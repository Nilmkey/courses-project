// services/enrollment.service.ts
import { Enrollment, Course } from '../models';
import { ApiError } from '../utils/ApiError';
import type { IEnrollment } from '../models';
import type { Types, Document } from 'mongoose';

export interface EnrollmentCreateInput {
  user_id: string | Types.ObjectId;
  course_id: string | Types.ObjectId;
}

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

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
      throw ApiError.notFound('Курс не найден');
    }

    if (!course.isOpenForEnrollment) {
      throw ApiError.badRequest('Набор на этот курс закрыт');
    }

    const existing = await Enrollment.findOne({ user_id: userId, course_id: courseId });
    if (existing) {
      throw ApiError.conflict('Вы уже записаны на этот курс');
    }

    const enrollment = await Enrollment.create({ user_id: userId, course_id: courseId });
    return enrollment;
  },

  async unenroll(userId: string, courseId: string): Promise<void> {
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

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await Enrollment.findOne({ user_id: userId, course_id: courseId });
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
};