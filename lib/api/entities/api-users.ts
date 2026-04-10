import { api } from "@/lib/api/api-client";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "student";
  createdAt: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserEnrollment {
  _id: string;
  course_id: string;
  enrolledAt: string;
  completedAt?: string;
  status: "active" | "completed" | "cancelled";
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    level: "beginner" | "intermediate" | "advanced";
    isPublished: boolean;
  };
  progress?: {
    overallProgress: number;
    stats: {
      totalBlocks: number;
      completedBlocks: number;
      totalLessons: number;
      completedLessons: number;
    };
  };
}

export interface UsersApiFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const usersApi = {
  getAll: (filters?: UsersApiFilters) => {
    const params = new URLSearchParams();
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.search) params.set("search", filters.search);
    
    const queryString = params.toString();
    return api.get<UsersListResponse>(
      `/v1/users${queryString ? `?${queryString}` : ""}`,
      undefined,
      true,
    );
  },

  getById: (id: string) =>
    api.get<User>(`/v1/users/${id}`, undefined, true),

  updateRole: (id: string, role: "admin" | "student") =>
    api.patch<User>(`/v1/users/${id}/role`, { role }, undefined, true),

  getEnrollments: (id: string) =>
    api.get<UserEnrollment[]>(`/v1/users/${id}/enrollments`, undefined, true),

  deleteEnrollment: (userId: string, courseId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/v1/users/${userId}/enrollments/${courseId}`,
      undefined,
      true,
    ),

  resetProgress: (userId: string, courseId: string) =>
    api.post<{ success: boolean; message: string }>(
      `/v1/users/${userId}/progress/${courseId}/reset`,
      undefined,
      undefined,
      true,
    ),

  enrollUser: (userId: string, courseId: string) =>
    api.post<{ success: boolean; message: string }>(
      `/v1/users/${userId}/enroll`,
      { courseId },
      undefined,
      true,
    ),

  deleteUser: (userId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/v1/users/${userId}`,
      undefined,
      true,
    ),
};
