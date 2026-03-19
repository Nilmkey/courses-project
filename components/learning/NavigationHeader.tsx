"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";
import { ProgressBar } from "./ProgressBar";

interface NavigationHeaderProps {
  onMenuClick?: () => void;
}

export function NavigationHeader({ onMenuClick }: NavigationHeaderProps) {
  const {
    course,
    overallProgress,
    getCurrentLesson,
    getCurrentBlock,
    navigateToPreviousBlock,
    navigateToNextBlock,
  } = useLearning();

  const currentLesson = getCurrentLesson;
  const currentBlock = getCurrentBlock;

  return (
    <header className="p-4 md:p-6 border-b bg-white dark:bg-slate-900 dark:border-slate-700 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        {/* Кнопка меню для мобильных и навигация */}
        <div className="flex items-center gap-2">
          {/* Кнопка меню только для мобильных */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Меню курса"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>

          {/* Навигация влево/вправо */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={navigateToPreviousBlock}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Предыдущий блок"
            >
              <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400 md:hidden" />
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400 hidden md:block" />
            </button>
            <button
              onClick={navigateToNextBlock}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Следующий блок"
            >
              <ChevronRight size={18} className="text-slate-600 dark:text-slate-400 md:hidden" />
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-400 hidden md:block" />
            </button>
          </div>
        </div>

        {/* Название курса */}
        <h1 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[120px] md:max-w-md">
          {course.title}
        </h1>

        {/* Пустой div для центрирования */}
        <div className="w-8 md:w-20" />
      </div>

      {/* Прогресс */}
      <ProgressBar value={overallProgress.progress} />

      {/* Информация о текущем блоке */}
      {currentBlock && (
        <div className="mt-3 md:mt-4 flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-900 dark:text-white truncate">
            {currentLesson?.title}
          </span>
          <span>/</span>
          <span className="truncate">{currentBlock.title || "Блок"}</span>
        </div>
      )}
    </header>
  );
}
