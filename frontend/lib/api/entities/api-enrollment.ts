import { api } from "../api-client";
import { progressApi } from "./api-progress";

export interface EnrollmentResponse {
  _id: string;
  user_id: string;
  course_id: string;
  enrolledAt: string;
  completedAt?: string;
  status: "active" | "completed" | "cancelled";
  course?: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    level: string;
  };
}

export interface EnrollmentWithProgress extends EnrollmentResponse {
  progress?: {
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
}

export interface EnrollmentsListResponse {
  enrollments: EnrollmentResponse[];
}

export interface IsEnrolledResponse {
  isEnrolled: boolean;
}

export interface EnrollResponse {
  success: boolean;
  message: string;
  enrollment: {
    _id: string;
    user_id: string;
    course_id: string;
    enrolledAt: string;
    status: "active" | "completed" | "cancelled";
  };
}
export interface EnrollRequest {
  courseId: string;
}

export const enrollmentApi = {
  /**
   * Записаться на курс
   */
  enroll: async (courseId: string): Promise<EnrollResponse> => {
    return api.post<EnrollResponse>(
      "/v1/enrollment",
      { courseId },
      undefined,
      true,
    );
  },

  /**
   * Отписаться от курса
   */
  unenroll: async (courseId: string): Promise<void> => {
    return api.delete<void>(`/v1/enrollment/${courseId}`, undefined, true);
  },

  /**
   * Получить все курсы пользователя с прогрессом
   */
  getMyCoursesWithProgress: async (): Promise<EnrollmentWithProgress[]> => {
    const response = await api.get<EnrollmentsListResponse>(
      "/v1/enrollment/my",
      undefined,
      true,
    );
    
    // Получаем прогресс для каждого курса
    const enrollmentsWithProgress: EnrollmentWithProgress[] = [];
    
    for (const enrollment of response.enrollments) {
      try {
        const progress = await progressApi.getCourseProgress(enrollment.course_id);
        enrollmentsWithProgress.push({
          ...enrollment,
          progress,
        });
      } catch (error) {
        // Если не удалось получить прогресс, используем дефолтное значение
        enrollmentsWithProgress.push({
          ...enrollment,
          progress: {
            totalLessons: 0,
            completedLessons: 0,
            progress: 0,
          },
        });
      }
    }
    
    return enrollmentsWithProgress;
  },

  /**
   * Получить все курсы пользователя (без прогресса)
   */
  getMyCourses: async (): Promise<EnrollmentsListResponse> => {
    return api.get<EnrollmentsListResponse>(
      "/v1/enrollment/my",
      undefined,
      true,
    );
  },

  /**
   * Проверить, записан ли пользователь на курс
   */
  isEnrolled: async (courseId: string): Promise<IsEnrolledResponse> => {
    return api.get<IsEnrolledResponse>(
      `/v1/enrollment/${courseId}/check`,
      undefined,
      true,
    );
  },

  /**
   * Обновить статус записи на курс
   */
  updateStatus: async (
    courseId: string,
    status: "active" | "completed" | "cancelled",
  ): Promise<EnrollmentResponse> => {
    return api.patch<EnrollmentResponse>(
      `/v1/enrollment/${courseId}/status`,
      { status },
      undefined,
      true,
    );
  },
};
