import { auth } from "../auth";
import { ApiError } from "../utils/ApiError";
import type { StreakObj } from "../types";
import { db } from "../lib/db";
import { ObjectId } from "mongodb";

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
   * - Если прошло < 24 часов с последнего обновления — увеличиваем count на 1
   * - Если прошло от 24 до 48 часов — стрик ещё активен, увеличиваем count на 1 (огонёк разгорается снова)
   * - Если прошло >= 48 часов — стрик сгорает, начинаем заново с count = 1
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

      let newStreak: StreakObj;

      if (hoursSinceUpdate < FORTY_EIGHT_HOURS / MS_PER_HOUR) {
        // Прошло < 48 часов — увеличиваем count на 1 (стрик активен)
        newStreak = {
          count: currentStreak.count + 1,
          isFire: true,
          updatedAt: now,
        };
      } else {
        // Прошло >= 48 часов — стрик сгорает, начинаем заново с count = 1
        newStreak = {
          count: 1,
          isFire: true,
          updatedAt: now,
        };
      }

      // Обновляем стрик пользователя через прямое обновление MongoDB
      // Если headers не переданы, пропускаем обновление БД
      if (headers && session) {
        // Читаем АКТУАЛЬНЫЕ данные стрика из MongoDB (не из кэшированной сессии!)
        const actualUserDoc = await db.collection('user').findOne(
          { _id: new ObjectId(userId) },
          { projection: { streak: 1 } }
        );
        
        const actualStreak: StreakObj = actualUserDoc?.streak || { count: 0, isFire: false, updatedAt: new Date(0) };
        const actualLastUpdate = actualStreak.updatedAt
          ? new Date(actualStreak.updatedAt)
          : new Date(0);
        
        // Проверяем, обновляли ли стрик уже сегодня (по календарному дню в UTC)
        const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const actualLastUpdateMidnight = new Date(actualLastUpdate.getFullYear(), actualLastUpdate.getMonth(), actualLastUpdate.getDate());
        const daysDiff = (nowMidnight.getTime() - actualLastUpdateMidnight.getTime()) / (24 * MS_PER_HOUR);
        
        // Если стрик уже обновлялся сегодня (в тот же календарный день) — пропускаем
        if (daysDiff === 0 && actualStreak.count > 0) {
          return actualStreak;
        }
        
        // Прямое обновление MongoDB
        const result = await db.collection('user').updateOne(
          { _id: new ObjectId(userId) },
          { $set: { streak: newStreak } }
        );
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
   * - После 24 часов без активности — огонёк гаснет (isFire = false)
   * - После 48 часов без активности — стрик сбрасывается (count = 0)
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

      let streak: StreakObj = session?.user?.streak || { count: 0, isFire: false, updatedAt: new Date(0) };

      // Вычисляем визуальное состояние на основе updatedAt
      const now = new Date();
      const lastUpdate = streak.updatedAt
        ? new Date(streak.updatedAt)
        : new Date(0);

      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / MS_PER_HOUR;

      // Огонёк горит только если прошло < 24 часов и count > 0
      const isFire = hoursSinceUpdate < 24 && streak.count > 0;

      // Если прошло >= 48 часов — стрик полностью сгорает
      if (hoursSinceUpdate >= FORTY_EIGHT_HOURS / MS_PER_HOUR && streak.count > 0) {
        return {
          count: 0,
          isFire: false,
          updatedAt: streak.updatedAt,
        };
      }

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
