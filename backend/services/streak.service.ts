import { auth } from "../auth";
import { ApiError } from "../utils/ApiError";
import type { StreakObj } from "../types";

/**
 * Константы для логики стриков (в миллисекундах)
 */
const MS_PER_HOUR = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * MS_PER_HOUR;
const FORTY_EIGHT_HOURS = 48 * MS_PER_HOUR;

/**
 * Сервис для управления стриками (ежедневное прохождение уроков)
 */
export const streakService = {
  /**
   * Продлить стрик при завершении урока
   * 
   * Логика:
   * - Если прошло < 24 часов с последнего обновления — не меняем count (защита от накрутки)
   * - Если прошло 24-48 часов — count++, isFire = true
   * - Если прошло > 48 часов — стрик сгорает, count = 1, isFire = true (начинаем заново)
   * 
   * @param userId - ID пользователя
   * @param headers - Headers из запроса для авторизации в better-auth
   */
  async extendStreak(userId: string, headers?: Headers): Promise<StreakObj> {
    try {
      const now = new Date();
      
      // Получаем сессию для доступа к данным пользователя
      let session: any = null;
      
      if (headers) {
        session = await auth.api.getSession({ headers });
      }
      
      // Если нет сессии, используем userId для получения данных
      // В будущем можно реализовать кэширование стрика
      const currentStreak: StreakObj = session?.user?.streak || { count: 0, isFire: false, updatedAt: new Date(0) };
      const lastUpdate = currentStreak.updatedAt 
        ? new Date(currentStreak.updatedAt) 
        : new Date(0);
      
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / MS_PER_HOUR;
      
      console.log(`[Streak] User ${userId}: last update ${hoursSinceUpdate.toFixed(2)}h ago`);
      
      let newStreak: StreakObj;
      
      if (hoursSinceUpdate < 24) {
        // Прошло < 24 часов — не меняем count, только обновляем timestamp
        // Это защита от накрутки, когда пользователь проходит много уроков за день
        newStreak = {
          count: currentStreak.count,
          isFire: true, // Показываем огонёк активным
          updatedAt: now,
        };
        console.log(`[Streak] User ${userId}: streak not extended (< 24h), count remains ${currentStreak.count}`);
      } else if (hoursSinceUpdate >= 24 && hoursSinceUpdate <= 48) {
        // Прошло 24-48 часов — продлеваем стрик
        newStreak = {
          count: currentStreak.count + 1,
          isFire: true,
          updatedAt: now,
        };
        console.log(`[Streak] User ${userId}: streak extended to ${newStreak.count}`);
      } else {
        // Прошло > 48 часов — стрик сгорает, начинаем заново с count = 1
        newStreak = {
          count: 1,
          isFire: true,
          updatedAt: now,
        };
        console.log(`[Streak] User ${userId}: streak reset (>${hoursSinceUpdate.toFixed(0)}h), new count = 1`);
      }
      
      // Обновляем стрик пользователя через сессию
      // Если headers не переданы, используем внутренний метод
      if (headers && session) {
        await auth.api.updateUser({
          body: {
            streak: newStreak,
          },
          headers,
        });
      }
      
      return newStreak;
    } catch (error) {
      console.error(`[Streak] Error extending streak for user ${userId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal("Не удалось обновить стрик");
    }
  },

  /**
   * Получить текущий стрик пользователя
   * 
   * @param userId - ID пользователя
   * @param headers - Headers из запроса для авторизации в better-auth
   */
  async getStreak(userId: string, headers?: Headers): Promise<StreakObj> {
    try {
      // Получаем сессию для доступа к данным пользователя
      let session: any = null;
      
      if (headers) {
        session = await auth.api.getSession({ headers });
      }
      
      const streak: StreakObj = session?.user?.streak || { count: 0, isFire: false, updatedAt: new Date(0) };
      
      // Вычисляем визуальное состояние на основе updatedAt
      const now = new Date();
      const lastUpdate = streak.updatedAt 
        ? new Date(streak.updatedAt) 
        : new Date(0);
      
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / MS_PER_HOUR;
      
      // isFire = true, если стрик активен (последнее обновление было < 48 часов назад)
      const isFire = hoursSinceUpdate < 48 && streak.count > 0;
      
      return {
        count: streak.count,
        isFire,
        updatedAt: streak.updatedAt,
      };
    } catch (error) {
      console.error(`[Streak] Error getting streak for user ${userId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal("Не удалось получить стрик");
    }
  },
};
