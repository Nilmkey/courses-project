import { api } from "@/lib/api/api-client";

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

export const enrollmentApi = {
  /**
   * Проверка: куплен ли курс пользователем
   */
  isEnrolled: (courseId: string) =>
    api.get<IsEnrolledResponse>(
      `/v1/enrollment/check/${courseId}`,
      undefined,
      true
    ),

  /**
   * Покупка курса (запись на курс)
   */
  enroll: (courseId: string) =>
    api.post<EnrollResponse>(
      "/v1/enrollment/enroll",
      { courseId },
      undefined,
      true
    ),
};
