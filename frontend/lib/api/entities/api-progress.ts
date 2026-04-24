import { api } from "@/frontend/lib/api/api-client";
import type { IQuizAnswer } from "@/types/types";

/**
 * Прогресс по блоку контента
 */
export interface BlockProgressResponse {
  blockId: string;
  completed: boolean;
  completedAt?: string;
  quizAnswers?: IQuizAnswer[];
}

/**
 * Прогресс по уроку с детализацией по блокам
 */
export interface LessonProgressResponse {
  lesson_id: string;
  completed: boolean;
  completedAt?: string;
  quizAnswers?: IQuizAnswer[];
  blocks?: BlockProgressResponse[];
  completedBlocksCount: number;
  totalBlocksCount: number;
}

/**
 * Прогресс по секции
 */
export interface SectionProgressResponse {
  section_id: string;
  completed: boolean;
  completedAt?: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

/**
 * Сводный прогресс курса
 */
export interface CourseProgressResponse {
  totalLessons: number;
  completedLessons: number;
  totalBlocks: number;
  completedBlocks: number;
  totalSections: number;
  completedSections: number;
  progress: number; // 0-100
}

/**
 * Детальный прогресс курса
 */
export interface CourseProgressDetail {
  _id: string;
  user_id: string;
  course_id: string;
  lessons: LessonProgressResponse[];
  sections: SectionProgressResponse[];
  overallProgress: number;
  stats: {
    totalBlocks: number;
    completedBlocks: number;
    totalLessons: number;
    completedLessons: number;
    totalSections: number;
    completedSections: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLessonProgressData {
  courseId: string;
  completed: boolean;
  quizAnswers?: IQuizAnswer[];
}

export interface MarkBlockCompleteData {
  courseId: string;
  blockId: string;
  quizAnswers?: IQuizAnswer[];
}

export const progressApi = {
  /**
   * Получить полный прогресс пользователя по курсу с деталями
   */
  getFullCourseProgress: (courseId: string) =>
    api.get<CourseProgressDetail>(
      `/v1/progress/course/${courseId}/full`,
      undefined,
      true,
    ),

  /**
   * Получить сводный прогресс курса (проценты)
   */
  getCourseProgress: (courseId: string) =>
    api.get<CourseProgressResponse>(
      `/v1/progress/course/${courseId}`,
      undefined,
      true,
    ),

  /**
   * Получить прогресс по конкретному уроку (ответы на quiz + блоки)
   */
  getLessonProgress: (lessonId: string, courseId: string) =>
    api.get<{ quizAnswers: IQuizAnswer[]; blocks: BlockProgressResponse[] }>(
      `/v1/progress/lesson/${lessonId}?courseId=${courseId}`,
      undefined,
      true,
    ),

  /**
   * Отметить урок как пройденный
   */
  markLessonComplete: (lessonId: string, courseId: string) =>
    api.post<LessonProgressResponse>(
      `/v1/progress/lesson/${lessonId}/complete`,
      { courseId },
      undefined,
      true,
    ),

  /**
   * Отметить блок как завершенный
   */
  markBlockComplete: (
    lessonId: string,
    courseId: string,
    data: MarkBlockCompleteData,
  ) =>
    api.post<LessonProgressResponse>(
      `/v1/progress/lesson/${lessonId}/block/${data.blockId}/complete`,
      { courseId, blockId: data.blockId, quizAnswers: data.quizAnswers },
      undefined,
      true,
    ),

  /**
   * Обновить прогресс урока (например, ответы на quiz)
   */
  updateLessonProgress: (lessonId: string, data: UpdateLessonProgressData) =>
    api.patch<LessonProgressResponse>(
      `/v1/progress/lesson/${lessonId}`,
      data,
      undefined,
      true,
    ),

  /**
   * Сбросить прогресс урока
   */
  resetLessonProgress: (lessonId: string, courseId: string) =>
    api.post<void>(
      `/v1/progress/lesson/${lessonId}/reset`,
      { courseId },
      undefined,
      true,
    ),

  /**
   * Инициализировать прогресс при записи на курс
   */
  initializeProgress: (courseId: string) =>
    api.post<void>(`/v1/progress/initialize`, { courseId }, undefined, true),

  /**
   * Пересчитать прогресс всех пользователей по курсу
   * Вызывается при добавлении/изменении контента
   */
  recalculateProgress: (courseId: string) =>
    api.post<{ message: string; updatedUsers: number }>(
      `/v1/progress/course/${courseId}/recalculate`,
      undefined,
      undefined,
      true,
    ),
};
