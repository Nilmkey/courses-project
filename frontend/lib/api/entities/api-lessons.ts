import { api } from "@/frontend/lib/api/api-client";
import type { CourseBlock } from "@/types/types";

export interface LessonBlockData {
  id: string;
  title: string;
  type: "text" | "video" | "quiz";
  content: Record<string, unknown>;
  order_index?: number;
}

export interface CreateLessonBlockData {
  title: string;
  slug: string;
  order_index?: number;
  is_free?: boolean;
  content_blocks?: LessonBlockData[];
}

export interface UpdateLessonBlockData {
  title?: string;
  slug?: string;
  order_index?: number;
  is_free?: boolean;
  content_blocks?: LessonBlockData[];
}

export interface ReorderLessonBlocksData {
  blockIds: string[];
}

export interface LessonBlockResponse {
  _id: string;
  section_id: string;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: LessonBlockData[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonBlocksListResponse {
  lessons: LessonBlockResponse[];
}

export const lessonsBlocksApi = {
  /**
   * Получить урок по ID
   */
  getById: (lessonId: string) =>
    api.get<LessonBlockResponse>(`/v1/lessons/${lessonId}`, undefined, true),

  /**
   * Создать новый урок
   */
  create: (sectionId: string, data: CreateLessonBlockData) =>
    api.post<LessonBlockResponse>(
      `/v1/lessons/${sectionId}`,
      data,
      undefined,
      true,
    ),

  /**
   * Обновить урок (включая content_blocks)
   */
  update: (lessonId: string, data: UpdateLessonBlockData) =>
    api.patch<LessonBlockResponse>(
      `/v1/lessons/${lessonId}`,
      data,
      undefined,
      true,
    ),

  /**
   * Удалить урок
   */
  delete: (lessonId: string) =>
    api.delete<void>(`/v1/lessons/${lessonId}`, undefined, true),

  /**
   * Изменить порядок уроков в секции
   */
  reorder: (sectionId: string, lessonIds: string[]) =>
    api.post<{ success: boolean; message: string }>(
      `/v1/lessons/reorder/${sectionId}`,
      { lessonIds },
      undefined,
      true,
    ),
};

/**
 * Конвертирует CourseBlock в LessonBlockData для отправки на сервер
 */
export const toLessonBlockData = (block: CourseBlock): LessonBlockData => ({
  id: block.id,
  title: block.title,
  type: block.type,
  content: block.content as Record<string, unknown>,
  order_index: 0, // порядок определяется позицией в массиве
});

/**
 * Конвертирует LessonBlockData в CourseBlock для локального использования
 */
export const toCourseBlock = (blockData: LessonBlockData): CourseBlock => {
  const content = blockData.content as Record<string, unknown>;

  return {
    id: blockData.id,
    title: blockData.title,
    type: blockData.type,
    content: {
      titleVideo: content.titleVideo as string | undefined,
      text: content.text as string | undefined,
      url: content.url as string | undefined,
      questions: content.questions as
        | import("@/types/types").QuizQuestion[]
        | undefined,
    },
  };
};
