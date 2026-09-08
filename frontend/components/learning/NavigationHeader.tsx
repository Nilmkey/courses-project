"use client";

import { ChevronLeft, ChevronRight, Menu, ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    hasPreviousBlock,
    hasNextBlock,
    prevStepInfo,
    nextStepInfo,
    navigateToPreviousBlock,
    navigateToNextBlock,
  } = useLearning();

  const currentLesson = getCurrentLesson;
  const currentBlock = getCurrentBlock;

  return (
    <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl flex-shrink-0 z-30 sticky top-0 transition-colors">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          {/* Левая часть: кнопка меню (моб) и стрелки навигации */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onMenuClick}
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-inner"
              title="Меню курса"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800/60 p-0.5 sm:p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={navigateToPreviousBlock}
                disabled={!hasPreviousBlock}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm text-slate-600 dark:text-slate-300 transition-all disabled:opacity-30 disabled:hover:shadow-none disabled:hover:bg-transparent disabled:cursor-not-allowed"
                title={
                  prevStepInfo?.title
                    ? `Предыдущий шаг: ${prevStepInfo.title}`
                    : "Предыдущий шаг"
                }
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={navigateToNextBlock}
                disabled={!hasNextBlock}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm text-slate-600 dark:text-slate-300 transition-all disabled:opacity-30 disabled:hover:shadow-none disabled:hover:bg-transparent disabled:cursor-not-allowed"
                title={
                  nextStepInfo?.title
                    ? `Следующий шаг: ${nextStepInfo.title}`
                    : "Следующий шаг"
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Название курса по центру */}
          <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[240px] md:max-w-md tracking-tight px-2 text-center">
            {course.title}
          </h1>

          {/* Правая часть: кнопка выхода к курсам */}
          <div className="flex items-center justify-end">
            <Link
              href="/courses"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Вернуться к списку курсов"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Все курсы</span>
            </Link>
          </div>
        </div>

        {/* Прогресс-бар курса */}
        <div className="relative pointer-events-none">
          <ProgressBar value={overallProgress.progress} />
          {overallProgress.progress > 0 && (
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.5)] blur-[2px]" />
          )}
        </div>

        {/* Текущий урок и шаг */}
        {currentBlock && (
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
            <span className="text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[200px] md:max-w-sm">
              {currentLesson?.title}
            </span>
            <span className="text-indigo-500 dark:text-indigo-400 mx-1">
              /
            </span>
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px] sm:max-w-[150px] md:max-w-sm">
              {currentBlock.title || "Шаг"}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
