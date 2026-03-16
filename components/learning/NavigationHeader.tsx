"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";
import { ProgressBar } from "./ProgressBar";

export function NavigationHeader() {
  const {
    course,
    overallProgress,
    getCurrentLesson,
    getCurrentBlock,
    navigateToPreviousBlock,
    navigateToNextBlock,
  } = useLearning();

  const currentLesson = getCurrentLesson();
  const currentBlock = getCurrentBlock();

  return (
    <header className="p-6 border-b bg-white flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        {/* Навигация */}
        <div className="flex items-center gap-2">
          <button
            onClick={navigateToPreviousBlock}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Предыдущий блок"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button
            onClick={navigateToNextBlock}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Следующий блок"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Название курса */}
        <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">
          {course.title}
        </h1>

        {/* Пустой div для центрирования */}
        <div className="w-20" />
      </div>

      {/* Прогресс */}
      <ProgressBar value={overallProgress.progress} />

      {/* Информация о текущем блоке */}
      {currentBlock && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-900">
            {currentLesson?.title}
          </span>
          <span>/</span>
          <span>{currentBlock.title || "Блок"}</span>
        </div>
      )}
    </header>
  );
}
