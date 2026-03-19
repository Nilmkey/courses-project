"use client";

import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

interface StreakFireProps {
  /** Показывать ли количество дней рядом с огоньком */
  showCount?: boolean;
  /** Размер компонента */
  size?: "sm" | "md" | "lg";
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Компонент отображения стрика (огонёк за ежедневное прохождение уроков)
 */
export function StreakFire({
  showCount = true,
  size = "sm",
  className = ""
}: StreakFireProps) {
  const { count, isFire, isLoading } = useStreak();

  // Размеры в зависимости от prop size
  const iconSizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-100 dark:border-orange-800/50 opacity-50">
        <Flame className={`${iconSizeClasses[size]} text-orange-500`} />
        {showCount && (
          <span className={`${textClasses[size]} font-black text-orange-600 dark:text-orange-400`}>
            ...
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-100 dark:border-orange-800/50 group transition-all hover:scale-105 ${className}`}>
      <Flame
        className={`${iconSizeClasses[size]} ${isFire ? "text-orange-500 animate-pulse" : "text-gray-400 dark:text-gray-500"}`}
      />
      {showCount && (
        <span className={`${textClasses[size]} font-black ${isFire ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}`}>
          {count || 0}
        </span>
      )}
    </div>
  );
}
