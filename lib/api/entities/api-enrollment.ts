import { api } from "../api-client";

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
   * Получить все курсы пользователя
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
