import { Router } from "express";
import { progressController } from "./progress.controller";
import { validateRequest } from "./progress.middleware";
import {
  markLessonCompleteSchema,
  resetProgressSchema,
  getCourseProgressSchema,
  updateLessonProgressSchema,
} from "./progress.validation";
import { authMiddleware } from "../../../middleware/auth.middleware";

const router = Router();

router.get(
  "/course/:courseId",
  authMiddleware,
  validateRequest(getCourseProgressSchema),
  progressController.getCourseProgress.bind(progressController),
);

router.post(
  "/lesson/:lessonId/complete",
  authMiddleware,
  validateRequest(markLessonCompleteSchema),
  progressController.markComplete.bind(progressController),
);

router.post(
  "/lesson/:lessonId/reset",
  authMiddleware,
  validateRequest(resetProgressSchema),
  progressController.resetProgress.bind(progressController),
);

router.patch(
  "/lesson/:lessonId",
  authMiddleware,
  validateRequest(updateLessonProgressSchema),
  progressController.updateLessonProgress.bind(progressController),
);

export default router;
