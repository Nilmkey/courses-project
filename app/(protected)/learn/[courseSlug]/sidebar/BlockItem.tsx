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

  const lessonProgress = getLessonProgress(lessonId);
  
  const isBlockCompleted = lessonProgress?.blocks?.some(
    (b) => b.blockId === blockId && b.completed
  );
  
  const isCompletedByIndex = lessonProgress &&
    lessonProgress.completedBlocks > blockIndex;
  
  const isCompleted = isBlockCompleted || isCompletedByIndex;

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-12 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
      }`}
    >
      {isCompleted ? (
        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
      ) : (
        <Icon
          size={14}
          className={`flex-shrink-0 ${
            isActive ? "text-blue-500" : "text-slate-400 dark:text-slate-500"
          }`}
        />
      )}

      <span className="truncate flex-1 text-left">
        {block.title || `${BLOCK_LABELS[block.type]} ${blockIndex + 1}`}
      </span>

      {isActive && (
        <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">
          {blockIndex + 1}/{totalBlocks}
        </span>
      )}
    </button>
  );
}
