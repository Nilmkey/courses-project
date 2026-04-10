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
    <header className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl flex-shrink-0 z-30 sticky top-0 transition-colors">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-inner"
              title="Меню курса"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl glass-panel">
              <button
                onClick={navigateToPreviousBlock}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm text-slate-600 dark:text-slate-400 transition-all disabled:opacity-30 disabled:hover:shadow-none disabled:hover:bg-transparent"
                title="Предыдущий шаг"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={navigateToNextBlock}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm text-slate-600 dark:text-slate-400 transition-all disabled:opacity-30 disabled:hover:shadow-none disabled:hover:bg-transparent"
                title="Следующий шаг"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <h1 className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate max-w-[150px] md:max-w-lg tracking-tight px-4 text-center">
            {course.title}
          </h1>

          <div className="w-[88px] md:w-[96px]" />
        </div>

        <div className="relative pointer-events-none">
           <ProgressBar value={overallProgress.progress} />
           {overallProgress.progress > 0 && <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.5)] blur-[2px]" />}
        </div>
       
        {currentBlock && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
            <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px] md:max-w-sm">
              {currentLesson?.title}
            </span>
            <span className="text-indigo-500 dark:text-indigo-400 mx-2">/</span>
            <span className="truncate max-w-[150px] md:max-w-sm">
              {currentBlock.title || "Шаг"}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
