// services/enrollment.service.ts
import { Enrollment, Course } from '../models';
import { ApiError } from '../utils/ApiError';
import type { IEnrollment } from '../models';
import type { Types } from 'mongoose';

export interface EnrollmentCreateInput {
  user_id: string | Types.ObjectId;
  course_id: string | Types.ObjectId;
}

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export const enrollmentService = {
  async enroll(userId: string, courseId: string): Promise<IEnrollment> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Курс не найден');
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

  async getMyCourses(userId: string): Promise<IEnrollment[]> {
    return await Enrollment.find({ user_id: userId }).populate('course_id').lean();
  },

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await Enrollment.findOne({ user_id: userId, course_id: courseId });
    return !!enrollment;
  },

  async updateStatus(
    userId: string,
    courseId: string,
    status: EnrollmentStatus
  ): Promise<IEnrollment | null> {
    const updated = await Enrollment.findOneAndUpdate(
      { user_id: userId, course_id: courseId },
      { status },
      { returnDocument: 'after' }
    ).lean();
    return updated;
  },
};