"use client";

import { CheckCircle } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";

export function CompletionButton() {
  const { 
    currentLessonId, 
    currentBlockId, 
    markLessonComplete, 
    completeBlock,
    lessonProgress, 
    getCurrentLesson,
    navigateToNextBlock 
  } = useLearning();

  const currentLesson = getCurrentLesson();
  const totalBlocks = currentLesson?.content_blocks.length || 0;
  const currentProgress = lessonProgress[currentLessonId || ''];
  const completedBlocks = currentProgress?.completedBlocks || 0;
  
  // Определяем индекс текущего блока
  const currentBlockIndex = currentLesson?.content_blocks.findIndex(
    b => (b.id || b._id) === currentBlockId
  ) || 0;
  
  const isLastBlock = currentBlockIndex === totalBlocks - 1;
  
  const handleClick = async () => {
    if (!currentLessonId || !currentBlockId) return;
    
    // Завершаем текущий блок
    await completeBlock(currentLessonId, currentBlockId);
    
    // Если это последний блок - автоматически завершаем урок
    if (isLastBlock) {
      await markLessonComplete(currentLessonId);
    } else {
      // Переходим к следующему блоку
      navigateToNextBlock();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/25 active:scale-95"
    >
      <CheckCircle size={20} />
      {isLastBlock ? "Завершить блок и урок" : "Завершить блок"}
    </button>
  );
}
