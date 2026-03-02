import { api } from "@/lib/api/api-client";
import type {
  CreateCourseData,
  UpdateCourseData,
  CourseApiResponse,
} from "@/types/types";

export const coursesApi = {
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
};
