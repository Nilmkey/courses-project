import { api } from "@/lib/api/api-client";
import type {
  UpdateCourseData,
  CourseApiResponse,
  CourseWithSectionsResponse,
  CoursesListResponse,
} from "@/types/types";

export const coursesApi = {
  getAll: () => api.get<CoursesListResponse>("/v1/courses", undefined, true),

  getById: (id: string) =>
    api.get<CourseWithSectionsResponse>(
      `/v1/courses/id/${id}`,
      undefined,
      true,
    ),

  getBySlug: (slug: string) =>
    api.get<CourseWithSectionsResponse>(
      `/v1/courses/${slug}`,
      undefined,
      true,
    ),

  create: () =>
    api.post<CourseApiResponse>("/v1/courses", undefined, undefined, true),

  update: (id: string, data: UpdateCourseData) =>
    api.patch<CourseApiResponse>(`/v1/courses/${id}`, data, undefined, true),

  delete: (id: string) =>
    api.delete<void>(`/v1/courses/${id}`, undefined, true),

  createWithRedirect: async () => {
    const course = await api.post<CourseApiResponse>(
      "/v1/courses",
      undefined,
      undefined,
      true,
    );
    return course;
  },
};
