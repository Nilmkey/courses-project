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
 * 
 * Визуальные состояния:
 * - active (isFire=true): огонёк горит оранжевым с анимацией pulse
 * - warning (24-48ч без активности): огонёк серый, стрик ещё жив
 * - lost/none: огонёк серый, count=0
 */
export function StreakFire({
  showCount = true,
  size = "sm",
  className = ""
}: StreakFireProps) {
  const { count, isFire, isLoading, status } = useStreak();

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

  // Визуальные стили в зависимости от статуса
  const isWarning = status === "warning";
  const containerClasses = isWarning
    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/50"
    : "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/50";

  const iconClasses = isFire
    ? "text-orange-500 animate-pulse"
    : isWarning
    ? "text-yellow-600 dark:text-yellow-500"
    : "text-gray-400 dark:text-gray-500";

  const textClassesColor = isFire
    ? "text-orange-600 dark:text-orange-400"
    : isWarning
    ? "text-yellow-700 dark:text-yellow-500"
    : "text-gray-500 dark:text-gray-400";

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border group transition-all hover:scale-105 ${containerClasses} ${className}`}>
      <Flame
        className={`${iconSizeClasses[size]} ${iconClasses}`}
      />
      {showCount && (
        <span className={`${textClasses[size]} font-black ${textClassesColor}`}>
          {count || 0}
        </span>
      )}
    </div>
  );
}
