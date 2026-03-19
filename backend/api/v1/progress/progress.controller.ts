// api/v1/progress/progress.controller.ts
import type { Request, Response } from "express";
import { progressService } from "../../../services/progress.service";
import type {
  MarkLessonCompleteRequest,
  ResetProgressRequest,
  GetCourseProgressRequest,
  UpdateLessonProgressRequest,
  GetLessonProgressRequest,
  InitializeProgressRequest,
  CourseProgressResponse,
  LessonProgressResponse,
  QuizAnswerResponse,
  CourseProgressDetailResponse,
  MarkBlockCompleteRequest,
  RecalculateProgressRequest,
  BlockProgressResponse,
  SectionProgressResponse,
} from "./progress.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import type { IQuizAnswer, ILessonProgress, IBlockProgress } from "../../../models";

type AuthRequest = Request & { user?: AuthenticatedUser };

interface CourseProgressData {
  totalLessons: number;
  completedLessons: number;
  totalBlocks: number;
  completedBlocks: number;
  totalSections: number;
  completedSections: number;
  progress: number;
}

const toQuizAnswerResponse = (answer: IQuizAnswer): QuizAnswerResponse => ({
  questionId: answer.questionId,
  selectedAnswer: answer.selectedAnswer,
  isCorrect: answer.isCorrect,
});

const toBlockProgressResponse = (
  progress: IBlockProgress,
): BlockProgressResponse => ({
  blockId: progress.blockId,
  completed: progress.completed,
  completedAt: progress.completedAt?.toISOString(),
  quizAnswers: progress.quizAnswers?.map(toQuizAnswerResponse),
});

const toLessonProgressResponse = (
  progress: ILessonProgress,
): LessonProgressResponse => ({
  lesson_id: progress.lesson_id.toString(),
  completed: progress.completed,
  completedAt: progress.completedAt?.toISOString(),
  quizAnswers: progress.quizAnswers?.map(toQuizAnswerResponse),
  blocks: progress.blocks ? progress.blocks.map(toBlockProgressResponse) : [],
  completedBlocksCount: progress.completedBlocksCount,
  totalBlocksCount: progress.totalBlocksCount,
});

const toSectionProgressResponse = (
  progress: any,
): SectionProgressResponse => ({
  section_id: progress.section_id.toString(),
  completed: progress.completed,
  completedAt: progress.completedAt?.toISOString(),
  completedLessonsCount: progress.completedLessonsCount,
  totalLessonsCount: progress.totalLessonsCount,
});

const toCourseProgressResponse = (
  data: CourseProgressData,
): CourseProgressResponse => ({
  totalLessons: data.totalLessons,
  completedLessons: data.completedLessons,
  totalBlocks: data.totalBlocks,
  completedBlocks: data.completedBlocks,
  totalSections: data.totalSections,
  completedSections: data.completedSections,
  progress: data.progress,
});

export const progressController = {
  /**
   * Получить полный прогресс курса с деталями по урокам
   */
  async getFullCourseProgress(
    req: Request<GetCourseProgressRequest["params"]>,
    res: Response<CourseProgressDetailResponse>,
  ): Promise<void> {
    const { courseId } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const progress = await progressService.getFullCourseProgress(
      authReq.user.id,
      courseId,
    );

    if (!progress) {
      throw ApiError.notFound("Курс не найден");
    }

    res.json(progress);
  },

  /**
   * Получить сводный прогресс курса (проценты)
   */
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

  /**
   * Получить прогресс по конкретному уроку
   */
  async getLessonProgress(
    req: Request<
      GetLessonProgressRequest["params"],
      unknown,
      unknown,
      GetLessonProgressRequest["query"]
    >,
    res: Response<{ quizAnswers: QuizAnswerResponse[]; blocks: BlockProgressResponse[] }>,
  ): Promise<void> {
    const { lessonId } = req.params;
    const { courseId } = req.query;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const result = await progressService.getLessonProgress(
      authReq.user.id,
      lessonId,
      courseId,
    );

    if (!result) {
      throw ApiError.notFound("Прогресс урока не найден");
    }

    res.json({
      quizAnswers: result.quizAnswers.map(toQuizAnswerResponse),
      blocks: result.blocks.map(toBlockProgressResponse),
    });
  },

  /**
   * Отметить урок как пройденный
   */
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

  /**
   * Сбросить прогресс урока
   */
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

  /**
   * Обновить прогресс урока (например, ответы на quiz)
   */
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

  /**
   * Отметить блок как завершенный
   */
  async markBlockComplete(
    req: Request<
      MarkBlockCompleteRequest["params"],
      unknown,
      MarkBlockCompleteRequest["body"]
    >,
    res: Response<LessonProgressResponse>,
  ): Promise<void> {
    const { lessonId } = req.params;
    const { courseId, blockId, quizAnswers } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const progress = await progressService.markBlockComplete(
      authReq.user.id,
      lessonId,
      courseId,
      blockId,
      quizAnswers,
    );

    if (!progress) {
      throw ApiError.internal("Не удалось отметить блок как завершенный");
    }

    const lessonProgress = progress.lessons?.find(
      (l) => l.lesson_id.toString() === lessonId,
    );

    if (!lessonProgress) {
      throw ApiError.internal("Прогресс урока не найден");
    }

    res.json(toLessonProgressResponse(lessonProgress));
  },

  /**
   * Инициализировать прогресс при записи на курс
   */
  async initializeProgress(
    req: Request<unknown, unknown, InitializeProgressRequest["body"]>,
    res: Response<void>,
  ): Promise<void> {
    const { courseId } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    await progressService.initializeProgress(authReq.user.id, courseId);
    res.status(204).send();
  },

  /**
   * Пересчитать прогресс всех пользователей по курсу
   * Вызывается при добавлении/изменении контента курса
   */
  async recalculateProgress(
    req: Request<RecalculateProgressRequest["params"]>,
    res: Response<{ message: string; updatedUsers: number }>,
  ): Promise<void> {
    const { courseId } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const result = await progressService.recalculateCourseProgress(courseId);

    res.json(result);
  },
};
