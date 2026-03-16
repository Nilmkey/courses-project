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

export interface UpdateLessonProgressData {
  courseId: string;
  completed: boolean;
  quizAnswers?: IQuizAnswer[];
}

export const progressApi = {
  /**
   * Получить прогресс пользователя по курсу
   */
  getCourseProgress: (courseId: string) =>
    api.get<CourseProgressResponse>(
      `/v1/progress/course/${courseId}`,
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
};
