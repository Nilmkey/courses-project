// api/v1/streak/streak.controller.ts
import type { Request, Response } from "express";
import { streakService } from "../../../services/streak.service";
import type { GetStreakResponse } from "./streak.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";

type AuthRequest = Request & { user?: AuthenticatedUser };

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Преобразует StreakObj в GetStreakResponse с дополнительными данными
 */
const toStreakResponse = (streak: ReturnType<typeof streakService.getStreak> extends Promise<infer T> ? T : never): GetStreakResponse => {
  const now = new Date();
  const lastUpdate = streak.updatedAt 
    ? new Date(streak.updatedAt) 
    : new Date(0);
  
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / MS_PER_HOUR;
  
  return {
    count: streak.count,
    isFire: streak.isFire,
    updatedAt: streak.updatedAt,
    hoursSinceUpdate,
  };
};

export const streakController = {
  /**
   * Получить стрик текущего пользователя
   * GET /api/v1/streak
   */
  async getStreak(
    req: Request,
    res: Response<GetStreakResponse>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    // Получаем headers для доступа к данным пользователя
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

    const streak = await streakService.getStreak(authReq.user.id, headers);
    const response = toStreakResponse(streak);

    res.json(response);
  },
};
