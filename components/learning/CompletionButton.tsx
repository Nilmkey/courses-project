"use client";

import { CheckCircle, ArrowRight } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";

export function CompletionButton() {
  const {
    currentLessonId,
    currentBlockId,
    completeBlock,
    getCurrentLesson,
    getLessonProgress,
    navigateToNextBlock
  } = useLearning();

  const currentLesson = getCurrentLesson();
  const totalBlocks = currentLesson?.content_blocks.length || 0;
  const lessonProgress = getLessonProgress(currentLessonId || '');

  // Определяем индекс текущего блока
  const currentBlockIndex = currentLesson?.content_blocks.findIndex(
    b => (b.id || b._id) === currentBlockId
  ) || 0;

  // Находим последний незавершенный блок в уроке
  const lastIncompleteBlockIndex = currentLesson?.content_blocks.reduceRight(
    (acc, block, index) => {
      if (acc !== -1) return acc; // Уже нашли
      
      const blockId = block.id || block._id || '';
      const isBlockCompleted = lessonProgress?.blocks?.some(
        (b) => b.blockId === blockId && b.completed
      );
      
      return isBlockCompleted ? acc : index;
    },
    -1 as number
  );

  // Кнопка "Завершить блок и урок" показывается на последнем незавершенном блоке
  const isLastIncompleteBlock = currentBlockIndex === lastIncompleteBlockIndex;

  const handleClick = async () => {
    if (!currentLessonId || !currentBlockId) return;

    // Завершаем текущий блок
    await completeBlock(currentLessonId, currentBlockId);

    // Переходим к следующему блоку
    navigateToNextBlock();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/25 active:scale-95 dark:bg-green-600 dark:hover:bg-green-700"
    >
      <CheckCircle size={20} />
      {isLastIncompleteBlock ? "Завершить блок и урок" : "Завершить блок"}
      <ArrowRight size={20} />
    </button>
  );
}
