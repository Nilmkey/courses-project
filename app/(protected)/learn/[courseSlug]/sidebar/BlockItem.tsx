"use client";

import { FileText, Video, HelpCircle, CheckCircle } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";
import type { IBlock } from "@/types/types";

const BLOCK_ICONS = {
  text: FileText,
  video: Video,
  quiz: HelpCircle,
};

const BLOCK_LABELS = {
  text: "Текст",
  video: "Видео",
  quiz: "Тест",
};

interface BlockItemProps {
  block: IBlock;
  sectionId: string;
  lessonId: string;
  blockIndex: number;
  totalBlocks: number;
}

export function BlockItem({
  block,
  sectionId,
  lessonId,
  blockIndex,
  totalBlocks,
}: BlockItemProps) {
  const { currentBlockId, currentLessonId, navigateToBlock, getLessonProgress } =
    useLearning();

  const blockId = block.id || block._id || '';
  const isActive = currentBlockId === blockId && currentLessonId === lessonId;
  const Icon = BLOCK_ICONS[block.type];

  const handleClick = () => {
    navigateToBlock(sectionId, lessonId, blockId);
  };

  // Получаем прогресс урока для определения завершённости блока
  const lessonProgress = getLessonProgress(lessonId);
  const isCompleted =
    lessonProgress &&
    lessonProgress.completedBlocks > blockIndex &&
    lessonProgress.status === "completed";

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-12 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {isCompleted ? (
        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
      ) : (
        <Icon
          size={14}
          className={`flex-shrink-0 ${
            isActive ? "text-blue-500" : "text-gray-400"
          }`}
        />
      )}

      <span className="truncate flex-1 text-left">
        {block.title || `${BLOCK_LABELS[block.type]} ${blockIndex + 1}`}
      </span>

      {isActive && (
        <span className="text-xs text-blue-500 font-medium">
          {blockIndex + 1}/{totalBlocks}
        </span>
      )}
    </button>
  );
}
