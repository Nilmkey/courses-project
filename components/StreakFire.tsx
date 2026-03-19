"use client";

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
 * - Активный стрик: яркий огонёк с количеством дней
 * - Потерянный стрик: тусклый огонёк (серый)
 * - Нет стрика: контур огонька (серый)
 */
export function StreakFire({ 
  showCount = true, 
  size = "md",
  className = "" 
}: StreakFireProps) {
  const { count, isFire, status, isLoading, hoursSinceUpdate } = useStreak();

  // Размеры в зависимости от prop size
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const countSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Состояния для разных статусов
  const statusConfig = {
    active: {
      emoji: isFire ? "🔥" : "🔥",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-500",
      animation: isFire ? "animate-pulse" : "",
      tooltip: `${count} дн. подряд`,
    },
    lost: {
      emoji: "🔥",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-400 dark:text-gray-500",
      animation: "",
      tooltip: "Стрик сгорел. Пройдите урок сегодня!",
    },
    none: {
      emoji: "🔥",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-300 dark:text-gray-600",
      animation: "",
      tooltip: "Пройдите первый урок для активации стрика",
    },
  };

  const config = statusConfig[status];

  if (isLoading) {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${config.bgColor} ${className}`}
        title="Загрузка..."
      >
        <span className={`${sizeClasses[size]} ${config.textColor} opacity-50`}>🔥</span>
        {showCount && (
          <span className={`${countSizeClasses[size]} font-medium ${config.textColor} opacity-50`}>
            ...
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${config.bgColor} ${className}`}
      title={config.tooltip}
    >
      <span className={`${sizeClasses[size]} ${config.textColor} ${config.animation}`}>
        {config.emoji}
      </span>
      {showCount && (
        <span className={`${countSizeClasses[size]} font-semibold ${config.textColor}`}>
          {count}
        </span>
      )}
      {status === "lost" && hoursSinceUpdate >= 48 && (
        <span className={`${countSizeClasses[size]} text-gray-400 dark:text-gray-500 ml-1`}>
          ({Math.floor(hoursSinceUpdate / 24)} дн. назад)
        </span>
      )}
    </div>
  );
}
