import { useEffect, useState, useMemo } from "react";
import { streakApi, type StreakResponse } from "@/lib/api/entities/api-streak";
import { useToast } from "@/hooks/useToast";

export interface UseStreakResult {
  /** Текущий стрик (количество дней) */
  count: number;
  /** Активен ли огонёк (визуальное состояние) */
  isFire: boolean;
  /** Дата последнего обновления */
  updatedAt: Date | null;
  /** Часов с последнего обновления */
  hoursSinceUpdate: number;
  /** Загружается ли данные */
  isLoading: boolean;
  /** Произошла ли ошибка */
  error: Error | null;
  /** Статус стрика для отображения */
  status: "active" | "warning" | "lost" | "none";
}

/**
 * Хук для получения и отображения стрика пользователя
 *
 * Визуальная логика:
 * - active: стрик активен (последнее обновление < 24 часов назад) — огонёк горит
 * - warning: стрик под угрозой (24-48 часов без активности) — огонёк погас, но стрик ещё жив
 * - lost: стрик сгорел (прошло >= 48 часов) — возвращается count = 0 с бэкенда
 * - none: стрик ещё не начинался (count = 0)
 */
export function useStreak(): UseStreakResult {
  const toast = useToast();
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStreak() {
      try {
        setIsLoading(true);
        const data = await streakApi.getStreak();
        setStreak(data);
        setError(null);
      } catch (err) {
        console.error("[useStreak] Failed to fetch streak:", err);
        setError(err instanceof Error ? err : new Error("Не удалось загрузить стрик"));
        // Не используем toast.error здесь, чтобы избежать цикла
      } finally {
        setIsLoading(false);
      }
    }

    fetchStreak();
    // Пустой массив зависимостей — загружаем только при монтировании
  }, []);

  // Вычисляем визуальное состояние с помощью useMemo
  const result = useMemo((): UseStreakResult => {
    if (!streak) {
      return {
        count: 0,
        isFire: false,
        updatedAt: null,
        hoursSinceUpdate: 0,
        isLoading,
        error,
        status: "none",
      };
    }

    const hoursSinceUpdate = streak.hoursSinceUpdate ?? 0;

    // Определяем статус для отображения
    // Бэкенд уже вернул count = 0, если прошло >= 48 часов
    const status: "active" | "warning" | "lost" | "none" =
      streak.count === 0 && hoursSinceUpdate >= 48 ? "lost" :
      streak.count === 0 ? "none" :
      hoursSinceUpdate >= 24 ? "warning" :
      "active";

    return {
      count: streak.count,
      isFire: streak.isFire && status === "active",
      updatedAt: streak.updatedAt ? new Date(streak.updatedAt) : null,
      hoursSinceUpdate,
      isLoading,
      error,
      status,
    };
  }, [streak, isLoading, error]);

  return result;
}
