import { api } from "@/lib/api/api-client";
import type {
  CreateCourseData,
  UpdateCourseData,
  CourseApiResponse,
  CourseWithSectionsResponse,
  CoursesListResponse,
} from "@/types/types";

export const coursesApi = {
  getAll: () => api.get<CoursesListResponse>("/v1/courses"),

  getById: (customId: string) =>
    api.get<CourseWithSectionsResponse>(`/v1/courses/id/${customId}`),

  create: (customId: string, data: CreateCourseData) =>
    api.post<CourseApiResponse>(
      `/v1/courses/${customId}`,
      data,
      undefined,
      true,
    ),

  update: (customId: string, data: UpdateCourseData) =>
    api.patch<CourseApiResponse>(
      `/v1/courses/${customId}`,
      data,
      undefined,
      true,
    ),

  delete: (customId: string) =>
    api.delete<void>(`/v1/courses/${customId}`, undefined, true),
};
