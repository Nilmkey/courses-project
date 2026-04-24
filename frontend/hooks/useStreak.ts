import { useEffect, useState, useMemo } from "react";
import {
  streakApi,
  type StreakResponse,
} from "@/frontend/lib/api/entities/api-streak";
import { useToast } from "@/frontend/hooks/useToast";

export interface UseStreakResult {
  count: number;
  isFire: boolean;
  updatedAt: Date | null;
  hoursSinceUpdate: number;
  isLoading: boolean;
  error: Error | null;
  status: "active" | "warning" | "lost" | "none";
}

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
        console.log("[useStreak] Fetched streak data:", data);
        console.log(
          "[useStreak] count type:",
          typeof data.count,
          "value:",
          data.count,
        );
        setStreak(data);
        setError(null);
      } catch (err) {
        console.error("[useStreak] Failed to fetch streak:", err);
        setError(
          err instanceof Error ? err : new Error("Не удалось загрузить стрик"),
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchStreak();
  }, []);

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

    const status: "active" | "warning" | "lost" | "none" =
      streak.count === 0 && hoursSinceUpdate >= 48
        ? "lost"
        : streak.count === 0
          ? "none"
          : hoursSinceUpdate >= 24
            ? "warning"
            : "active";

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
