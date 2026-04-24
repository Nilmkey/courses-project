import { api } from "@/lib/api/api-client";

export interface StreakResponse {
  count: number;
  isFire: boolean;
  updatedAt: string;
  hoursSinceUpdate?: number;
}

export const streakApi = {
  /**
   * Получить текущий стрик пользователя
   */
  getStreak: () => api.get<StreakResponse>(`/v1/streak`, undefined, true),
};
