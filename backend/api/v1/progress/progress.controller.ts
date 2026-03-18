// api/v1/progress/progress.controller.ts
import type { Request, Response } from "express";
import { progressService } from "../../../services/progress.service";
import type {
  MarkLessonCompleteRequest,
  ResetProgressRequest,
  GetCourseProgressRequest,
  UpdateLessonProgressRequest,
  CourseProgressResponse,
  LessonProgressResponse,
  QuizAnswerResponse,
} from "./progress.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import type { IQuizAnswer, ILessonProgress } from "../../../models";

type AuthRequest = Request & { user?: AuthenticatedUser };

interface CourseProgressData {
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

const toQuizAnswerResponse = (answer: IQuizAnswer): QuizAnswerResponse => ({
  questionId: answer.questionId,
  selectedAnswer: answer.selectedAnswer,
  isCorrect: answer.isCorrect,
});

const toLessonProgressResponse = (
  progress: ILessonProgress,
): LessonProgressResponse => ({
  lesson_id: progress.lesson_id.toString(),
  completed: progress.completed,
  completedAt: progress.completedAt?.toISOString(),
  quizAnswers: progress.quizAnswers?.map(toQuizAnswerResponse),
});

const toCourseProgressResponse = (
  data: CourseProgressData,
): CourseProgressResponse => ({
  totalLessons: data.totalLessons,
  completedLessons: data.completedLessons,
  progress: data.progress,
});

export const progressController = {
  async markComplete(
    req: Request<
      MarkLessonCompleteRequest["params"],
      unknown,
      MarkLessonCompleteRequest["body"]
    >,
    res: Response<LessonProgressResponse>,
  ): Promise<void> {
    const { lessonId } = req.params;
    const { courseId } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    // Получаем headers для обновления стрика
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.append(key, value);
        }
      }
    }

    const progress = await progressService.markComplete(
      authReq.user.id,
      lessonId,
      courseId,
      headers,
    );

    if (!progress) {
      throw ApiError.internal("Не удалось отметить урок как пройденный");
    }

    const lessonProgress = progress.lessons?.find(
      (l) => l.lesson_id.toString() === lessonId,
    );

    if (!lessonProgress) {
      throw ApiError.internal("Прогресс урока не найден");
    }

    res.json(toLessonProgressResponse(lessonProgress));
  },

  async resetProgress(
    req: Request<
      ResetProgressRequest["params"],
      unknown,
      ResetProgressRequest["body"]
    >,
    res: Response<void>,
  ): Promise<void> {
    const { lessonId } = req.params;
    const { courseId } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    await progressService.resetProgress(authReq.user.id, lessonId, courseId);
    res.status(204).send();
  },

  async getCourseProgress(
    req: Request<GetCourseProgressRequest["params"]>,
    res: Response<CourseProgressResponse>,
  ): Promise<void> {
    const { courseId } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const progress = await progressService.getCourseProgress(
      authReq.user.id,
      courseId,
    );

    if (!progress) {
      throw ApiError.notFound("Курс не найден или прогресс не отслеживается");
    }

    res.json(toCourseProgressResponse(progress));
  },

  async updateLessonProgress(
    req: Request<
      UpdateLessonProgressRequest["params"],
      unknown,
      UpdateLessonProgressRequest["body"]
    >,
    res: Response<LessonProgressResponse>,
  ): Promise<void> {
    const { lessonId } = req.params;
    const { courseId, completed, quizAnswers } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const progress = await progressService.updateLessonProgress(
      authReq.user.id,
      lessonId,
      courseId,
      {
        lesson_id: lessonId,
        completed,
        quizAnswers,
      },
    );

    if (!progress) {
      throw ApiError.internal("Не удалось обновить прогресс");
    }

    const lessonProgress = progress.lessons?.find(
      (l) => l.lesson_id.toString() === lessonId,
    );

    if (!lessonProgress) {
      throw ApiError.internal("Прогресс урока не найден");
    }

    res.json(toLessonProgressResponse(lessonProgress));
  },
};
