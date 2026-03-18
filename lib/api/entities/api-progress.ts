import { api } from "@/lib/api/api-client";
import type { IQuizAnswer } from "@/types/types";

export interface CourseProgressResponse {
  totalLessons: number;
  completedLessons: number;
  progress: number; // 0-100
}

export interface LessonProgressResponse {
  lesson_id: string;
  completed: boolean;
  completedAt?: string;
  quizAnswers?: IQuizAnswer[];
}

export interface CourseProgressDetail {
  _id: string;
  user_id: string;
  course_id: string;
  lessons: LessonProgressResponse[];
  overallProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLessonProgressData {
  courseId: string;
  completed: boolean;
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
      true
    ),

  /**
   * Получить сводный прогресс курса (проценты)
   */
  getCourseProgress: (courseId: string) =>
    api.get<CourseProgressResponse>(
      `/v1/progress/course/${courseId}`,
      undefined,
      true
    ),

  /**
   * Получить прогресс по конкретному уроку (ответы на quiz)
   */
  getLessonProgress: (lessonId: string, courseId: string) =>
    api.get<IQuizAnswer[]>(
      `/v1/progress/lesson/${lessonId}?courseId=${courseId}`,
      undefined,
      true
    ),

  /**
   * Отметить урок как пройденный
   */
  markLessonComplete: (lessonId: string, courseId: string) =>
    api.post<LessonProgressResponse>(
      `/v1/progress/lesson/${lessonId}/complete`,
      { courseId },
      undefined,
      true
    ),

  /**
   * Обновить прогресс урока (например, ответы на quiz)
   */
  updateLessonProgress: (
    lessonId: string,
    data: UpdateLessonProgressData
  ) =>
    api.patch<LessonProgressResponse>(
      `/v1/progress/lesson/${lessonId}`,
      data,
      undefined,
      true
    ),

  /**
   * Сбросить прогресс урока
   */
  resetLessonProgress: (lessonId: string, courseId: string) =>
    api.post<void>(
      `/v1/progress/lesson/${lessonId}/reset`,
      { courseId },
      undefined,
      true
    ),

  /**
   * Инициализировать прогресс при записи на курс
   */
  initializeProgress: (courseId: string) =>
    api.post<void>(
      `/v1/progress/initialize`,
      { courseId },
      undefined,
      true
    ),
};
