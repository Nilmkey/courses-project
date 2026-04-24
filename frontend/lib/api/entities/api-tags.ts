import { api } from "@/frontend/lib/api/api-client";
import type { ITag } from "@/types/types";

export interface TagsListResponse {
  tags: ITag[];
}

export interface CreateTagData {
  name: string;
  slug: string;
  color: string;
}

export interface UpdateTagData {
  name?: string;
  slug?: string;
  color?: string;
}

export const tagsApi = {
  /**
   * Получить все теги
   */
  getAll: () => api.get<TagsListResponse>("/v1/tags", undefined, true),

  /**
   * Поиск тегов по названию (для autocomplete)
   */
  search: (query: string) =>
    api.get<TagsListResponse>(
      `/v1/tags/search?query=${encodeURIComponent(query)}`,
      undefined,
      true,
    ),

  /**
   * Получить тег по ID
   */
  getById: (id: string) =>
    api.get<TagsListResponse>(`/v1/tags/${id}`, undefined, true),

  /**
   * Создать новый тег
   */
  create: (data: CreateTagData) =>
    api.post<TagsListResponse>("/v1/tags", data, undefined, true),

  /**
   * Обновить тег
   */
  update: (id: string, data: UpdateTagData) =>
    api.patch<TagsListResponse>(`/v1/tags/${id}`, data, undefined, true),

  /**
   * Удалить тег
   */
  delete: (id: string) => api.delete<void>(`/v1/tags6/${id}`, undefined, true),

  /**
   * Получить теги курса
   */
  getCourseTags: (courseId: string) =>
    api.get<TagsListResponse>(
      `/v1/tags/courses/${courseId}/tags`,
      undefined,
      true,
    ),

  /**
   * Присвоить теги курсу
   */
  assignTagsToCourse: (courseId: string, tagIds: string[]) =>
    api.post<void>(
      `/v1/tags/courses/${courseId}/tags`,
      { tagIds },
      undefined,
      true,
    ),
};
