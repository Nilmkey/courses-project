import { Router } from "express";
import { streakController } from "./streak.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";

const router = Router();

/**
 * @route GET /api/v1/streak
 * @description Получить стрик текущего пользователя
 * @access Private (требуется авторизация)
 */
router.get(
  "/",
  authMiddleware,
  streakController.getStreak.bind(streakController),
);

export default router;
