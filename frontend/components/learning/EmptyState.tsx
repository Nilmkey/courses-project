"use client";

import { BookOpen, ArrowLeft } from "lucide-react";
import { useLearning } from "@/frontend/hooks/useLearning";

export function EmptyState() {
  const { sections, navigateToBlock } = useLearning();

  // Находим первый доступный блок для быстрой навигации
  const firstBlockLocation = (() => {
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (lesson.content_blocks.length > 0) {
          const firstBlock = lesson.content_blocks[0];
          return {
            sectionId: section._id,
            lessonId: lesson._id,
            blockId: firstBlock.id || firstBlock._id || "",
          };
        }
      }
    }
    return null;
  })();

  const handleStartCourse = () => {
    if (firstBlockLocation) {
      navigateToBlock(
        firstBlockLocation.sectionId,
        firstBlockLocation.lessonId,
        firstBlockLocation.blockId,
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-[#3b5bdb]/20 dark:to-[#5c7cfa]/20 rounded-full flex items-center justify-center mb-6">
        <BookOpen className="w-12 h-12 text-[#3b5bdb] dark:text-indigo-400" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Добро пожаловать в курс
      </h2>

      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Выберите любой блок в меню слева или начните с первого урока чтобы
        приступить к обучению
      </p>

      {firstBlockLocation && (
        <button
          onClick={handleStartCourse}
          className="flex items-center gap-2 px-6 py-3 bg-[#3b5bdb] text-white rounded-xl font-bold hover:bg-[#2f4a9e] transition-colors shadow-lg shadow-indigo-500/25"
        >
          <ArrowLeft size={20} className="rotate-180" />
          Начать обучение
        </button>
      )}
    </div>
  );
}
