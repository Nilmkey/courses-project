import { api } from "@/frontend/lib/api/api-client";
import type { Section } from "@/types/types";

export interface CreateSectionData {
  title: string;
  order_index?: number;
  isDraft?: boolean;
}

export interface UpdateSectionData {
  title?: string;
  order_index?: number;
  isDraft?: boolean;
  lessons?: string[];
}

export interface CreateLessonData {
  title: string;
  slug: string;
  order_index?: number;
  is_free?: boolean;
}

export interface UpdateLessonData {
  title?: string;
  slug?: string;
  order_index?: number;
  is_free?: boolean;
}

export interface LessonData {
  _id: string;
  title: string;
}

export interface SectionResponse {
  _id: string;
  course_id: string;
  title: string;
  order_index: number;
  isDraft: boolean;
  lessons: LessonData[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonResponse {
  _id: string;
  section_id: string;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionsListResponse {
  sections: SectionResponse[];
}

export interface LessonsListResponse {
  lessons: LessonResponse[];
}

export const sectionsApi = {
  /**
   * Получить все секции курса
   */
  getByCourse: (courseId: string) =>
    api.get<SectionsListResponse>(
      `/v1/sections/course/${courseId}`,
      undefined,
      true,
    ),

  /**
   * Создать новую секцию
   */
  create: (courseId: string, data: CreateSectionData) =>
    api.post<SectionResponse>(
      `/v1/sections/${courseId}`,
      data,
      undefined,
      true,
    ),

  /**
   * Обновить секцию
   */
  update: (sectionId: string, data: UpdateSectionData) =>
    api.patch<SectionResponse>(
      `/v1/sections/${sectionId}`,
      data,
      undefined,
      true,
    ),

  /**
   * Удалить секцию
   */
  delete: (sectionId: string) =>
    api.delete<void>(`/v1/sections/${sectionId}`, undefined, true),

  /**
   * Изменить порядок секций
   */
  reorder: (courseId: string, sectionIds: string[]) =>
    api.post<{ success: boolean; message: string }>(
      `/v1/sections/reorder/${courseId}`,
      { sectionIds },
      undefined,
      true,
    ),
};

export const lessonsApi = {
  /**
   * Получить все уроки секции
   */
  getBySection: (sectionId: string) =>
    api.get<LessonsListResponse>(
      `/v1/lessons/section/${sectionId}`,
      undefined,
      true,
    ),

  /**
   * Создать новый урок
   */
  create: (sectionId: string, data: CreateLessonData) =>
    api.post<LessonResponse>(`/v1/lessons/${sectionId}`, data, undefined, true),

  /**
   * Обновить урок
   */
  update: (lessonId: string, data: UpdateLessonData) =>
    api.patch<LessonResponse>(`/v1/lessons/${lessonId}`, data, undefined, true),

  /**
   * Удалить урок
   */
  delete: (lessonId: string) =>
    api.delete<void>(`/v1/lessons/${lessonId}`, undefined, true),

  /**
   * Изменить порядок уроков
   */
  reorder: (sectionId: string, lessonIds: string[]) =>
    api.post<{ success: boolean; message: string }>(
      `/v1/lessons/reorder/${sectionId}`,
      { lessonIds },
      undefined,
      true,
    ),
};
