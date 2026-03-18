import { Router } from "express";
import { progressController } from "./progress.controller";
import { validateRequest } from "./progress.middleware";
import {
  markLessonCompleteSchema,
  resetProgressSchema,
  getCourseProgressSchema,
  updateLessonProgressSchema,
  getLessonProgressSchema,
  initializeProgressSchema,
} from "./progress.validation";
import { authMiddleware } from "../../../middleware/auth.middleware";

const router = Router();

// Получить полный прогресс курса с деталями
router.get(
  "/course/:courseId/full",
  authMiddleware,
  validateRequest(getCourseProgressSchema),
  progressController.getFullCourseProgress.bind(progressController),
);

// Получить сводный прогресс курса (проценты)
router.get(
  "/course/:courseId",
  authMiddleware,
  validateRequest(getCourseProgressSchema),
  progressController.getCourseProgress.bind(progressController),
);

// Получить прогресс по конкретному уроку (ответы на quiz)
router.get(
  "/lesson/:lessonId",
  authMiddleware,
  validateRequest(getLessonProgressSchema),
  progressController.getLessonProgress.bind(progressController),
);

// Отметить урок как пройденный
router.post(
  "/lesson/:lessonId/complete",
  authMiddleware,
  validateRequest(markLessonCompleteSchema),
  progressController.markComplete.bind(progressController),
);

// Обновить прогресс урока (например, ответы на quiz)
router.patch(
  "/lesson/:lessonId",
  authMiddleware,
  validateRequest(updateLessonProgressSchema),
  progressController.updateLessonProgress.bind(progressController),
);

// Сбросить прогресс урока
router.post(
  "/lesson/:lessonId/reset",
  authMiddleware,
  validateRequest(resetProgressSchema),
  progressController.resetProgress.bind(progressController),
);

// Инициализировать прогресс при записи на курс
router.post(
  "/initialize",
  authMiddleware,
  validateRequest(initializeProgressSchema),
  progressController.initializeProgress.bind(progressController),
);

export default router;
