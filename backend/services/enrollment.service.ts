// services/enrollment.service.ts
import { Enrollment, Course, Progress } from '../models';
import { ApiError } from '../utils/ApiError';
import type { IEnrollment } from '../models';
import type { Types, Document } from 'mongoose';
import { progressService } from './progress.service';

export interface EnrollmentCreateInput {
  user_id: string | Types.ObjectId;
  course_id: string | Types.ObjectId;
}

export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface PopulatedEnrollment extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  course_id: Types.ObjectId & {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    thumbnail?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
  };
  enrolledAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export const enrollmentService = {
  async enroll(userId: string, courseId: string): Promise<IEnrollment> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound("Курс не найден");
    }

    // Проверяем, записан ли уже пользователь на этот курс
    const existing = await Enrollment.findOne({
      user_id: userId,
      course_id: courseId,
    });
    if (existing) {
      throw ApiError.conflict("Вы уже записаны на этот курс");
    }

    // Если набор закрыт и пользователь еще не записан - запрещаем запись
    if (!course.isOpenForEnrollment) {
      throw ApiError.badRequest("Набор на этот курс закрыт");
    }

    const enrollment = await Enrollment.create({
      user_id: userId,
      course_id: courseId,
    });

    // Инициализируем прогресс для нового курса
    await progressService.initializeProgress(userId, courseId);

    return enrollment;
  },

  async unenroll(userId: string, courseId: string): Promise<void> {
    // Удаляем прогресс вместе с записью
    await Progress.deleteOne({
      user_id: userId,
      course_id: courseId,
    });

    await Enrollment.findOneAndDelete({ user_id: userId, course_id: courseId });
  },

  async getMyCourses(userId: string): Promise<PopulatedEnrollment[]> {
    const enrollments = await Enrollment.find({ user_id: userId })
      .populate<{ course_id: PopulatedEnrollment['course_id'] }>('course_id')
      .lean();

    // Фильтруем записи, где курс не был найден (удалён)
    return enrollments
      .filter((e): e is typeof e & { course_id: PopulatedEnrollment['course_id'] } => !!e.course_id)
      .map((e) => e as unknown as PopulatedEnrollment);
  },

  async getMyCoursesWithSections(userId: string): Promise<PopulatedEnrollment[]> {
    const enrollments = await Enrollment.find({ user_id: userId })
      .populate<{ course_id: PopulatedEnrollment['course_id'] }>('course_id')
      .lean();

    // Фильтруем записи, где курс не был найден (удалён)
    const filteredEnrollments = enrollments
      .filter((e): e is typeof e & { course_id: PopulatedEnrollment['course_id'] } => !!e.course_id)
      .map((e) => e as unknown as PopulatedEnrollment);

    // Для каждого курса отдельно получаем секции
    for (const enrollment of filteredEnrollments) {
      const sections = await import('../models/Section').then(m => 
        m.Section.find({ course_id: enrollment.course_id._id }).sort({ order_index: 1 }).lean()
      );
      (enrollment.course_id as any).sections = sections;
    }

    return filteredEnrollments;
  },

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await Enrollment.findOne({
      user_id: userId,
      course_id: courseId,
    });
    return !!enrollment;
  },

  async updateStatus(
    userId: string,
    courseId: string,
    status: EnrollmentStatus
  ): Promise<PopulatedEnrollment | null> {
    const updated = await Enrollment.findOneAndUpdate(
      { user_id: userId, course_id: courseId },
      { status },
      { returnDocument: 'after' }
    )
    .populate<{ course_id: PopulatedEnrollment['course_id'] }>('course_id')
    .lean();

    return updated as PopulatedEnrollment | null;
  },

  /**
   * Получить прогресс пользователя по всем курсам
   */
  async getMyCoursesWithProgress(userId: string): Promise<PopulatedEnrollment[]> {
    const enrollments = await this.getMyCourses(userId);

    // Для каждого курса получаем прогресс
    for (const enrollment of enrollments) {
      const progress = await progressService.getCourseProgress(
        userId,
        enrollment.course_id._id.toString()
      );

      // Добавляем информацию о прогрессе в объект enrollment (как дополнительное поле)
      (enrollment as any).progress = progress;
    }

    return enrollments;
  },
};
