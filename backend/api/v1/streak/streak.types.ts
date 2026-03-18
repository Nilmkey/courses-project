// api/v1/streak/streak.types.ts
import type { StreakObj } from "../../../types";

export interface GetStreakResponse extends StreakObj {
  /**
   * Количество часов с последнего обновления
   * Используется фронтендом для визуального отображения
   */
  hoursSinceUpdate?: number;
}

export interface StreakErrorResponse {
  message: string;
}
