"use client";

import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";

export function CompletionButton() {
  const {
    currentLessonId,
    currentBlockId,
    markLessonComplete,
    completeBlock,
    lessonProgress,
    getCurrentLesson,
    navigateToNextBlock,
    isCompletingBlock
  } = useLearning();

  const currentLesson = getCurrentLesson();
  const totalBlocks = currentLesson?.content_blocks.length || 0;
  const currentProgress = lessonProgress[currentLessonId || ''];
  const lessonProgress = getLessonProgress(currentLessonId || '');

  // Определяем индекс текущего блока
  const currentBlockIndex = currentLesson?.content_blocks.findIndex(
    b => (b.id || b._id) === currentBlockId
  ) || 0;

  const isLastBlock = currentBlockIndex === totalBlocks - 1;
  const isLoading = isCompletingBlock;

  const handleClick = async () => {
    if (!currentLessonId || !currentBlockId || isLoading) return;

    // Если это последний блок - просто завершаем урок
    // (бэкенд автоматически отметит все блоки как пройденные)
    if (isLastBlock) {
      await markLessonComplete(currentLessonId);
    } else {
      // Завершаем текущий блок (без await для мгновенной реакции UI)
      // Бэкенд автоматически проверит, все ли блоки пройдены
      completeBlock(currentLessonId, currentBlockId);
      // Переходим к следующему блоку
      navigateToNextBlock();
    }
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
      disabled={isLoading}
      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 dark:bg-green-600 dark:hover:bg-green-700"
    >
      <CheckCircle size={20} />
      {isLastIncompleteBlock ? "Завершить блок и урок" : "Завершить блок"}
      <ArrowRight size={20} />
    </button>
  );
}
