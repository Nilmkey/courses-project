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
import { Types } from "mongoose";

type AuthRequest = Request & { user?: AuthenticatedUser };

interface ProgressData {
  _id: Types.ObjectId;
  student_id: Types.ObjectId;
  lesson_id: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  quizAnswers?: Array<{
    questionId: string;
    selectedAnswer: number | number[] | string;
    isCorrect: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface CourseProgressData {
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

const toQuizAnswerResponse = (answer: unknown): QuizAnswerResponse => {
  const a = answer as Record<string, unknown>;
  return {
    questionId: String(a.questionId),
    selectedAnswer: a.selectedAnswer as QuizAnswerResponse["selectedAnswer"],
    isCorrect: Boolean(a.isCorrect),
  };
};

const toLessonProgressResponse = (
  progress: ProgressData,
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

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const progress = await progressService.markComplete(
      authReq.user.id,
      lessonId,
    );

    if (!progress) {
      throw ApiError.internal("Не удалось отметить урок как пройденный");
    }

    res.json(toLessonProgressResponse(progress as unknown as ProgressData));
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

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    await progressService.resetProgress(authReq.user.id, lessonId);
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
    const { completed, quizAnswers } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const progress = await progressService.updateLessonProgress(
      authReq.user.id,
      lessonId,
      {
        lesson_id: lessonId,
        completed,
        completedAt: completed ? new Date() : undefined,
        quizAnswers,
      },
    );

    if (!progress) {
      throw ApiError.internal("Не удалось обновить прогресс");
    }

    res.json(toLessonProgressResponse(progress as unknown as ProgressData));
  },
};
