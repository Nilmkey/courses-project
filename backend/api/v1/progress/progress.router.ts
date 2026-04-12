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
  markBlockCompleteSchema,
  recalculateProgressSchema,
} from "./progress.validation";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { teacherMiddleware } from "../../../middleware/teacher.middleware";
import { requireEnrollment, requireEnrollmentFromBody } from "../../../middleware/enrollmentCheck.middleware";

const router = Router();

// Получить полный прогресс курса с деталями
router.get(
  "/course/:courseId/full",
  authMiddleware,
  requireEnrollment,
  validateRequest(getCourseProgressSchema),
  progressController.getFullCourseProgress.bind(progressController),
);

// Получить сводный прогресс курса (проценты)
router.get(
  "/course/:courseId",
  authMiddleware,
  requireEnrollment,
  validateRequest(getCourseProgressSchema),
  progressController.getCourseProgress.bind(progressController),
);

// Получить прогресс по конкретному уроку (ответы на quiz + блоки)
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
  requireEnrollmentFromBody,
  validateRequest(markLessonCompleteSchema),
  progressController.markComplete.bind(progressController),
);

// Отметить блок как завершенный
router.post(
  "/lesson/:lessonId/block/:blockId/complete",
  authMiddleware,
  requireEnrollmentFromBody,
  validateRequest(markBlockCompleteSchema),
  progressController.markBlockComplete.bind(progressController),
);

// Обновить прогресс урока (например, ответы на quiz)
router.patch(
  "/lesson/:lessonId",
  authMiddleware,
  requireEnrollmentFromBody,
  validateRequest(updateLessonProgressSchema),
  progressController.updateLessonProgress.bind(progressController),
);

// Сбросить прогресс урока
router.post(
  "/lesson/:lessonId/reset",
  authMiddleware,
  requireEnrollmentFromBody,
  validateRequest(resetProgressSchema),
  progressController.resetProgress.bind(progressController),
);

// Инициализировать прогресс при записи на курс
router.post(
  "/initialize",
  authMiddleware,
  requireEnrollmentFromBody,
  validateRequest(initializeProgressSchema),
  progressController.initializeProgress.bind(progressController),
);

// Пересчитать прогресс всех пользователей по курсу (только teacher/admin)
router.post(
  "/course/:courseId/recalculate",
  authMiddleware,
  teacherMiddleware,
  validateRequest(recalculateProgressSchema),
  progressController.recalculateProgress.bind(progressController),
);

export default router;
