"use client";

import { CheckCircle2 } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";
import { TextBlockView } from "./TextBlockView";
import { VideoBlockView } from "./VideoBlockView";
import { QuizBlockView } from "./QuizBlockView";
import { EmptyState } from "@/components/learning/EmptyState";
import type { ITextBlock, IVideoBlock, IQuizBlock } from "@/types/types";

export function BlockContentRenderer() {
  const { getCurrentBlock, getCurrentLesson, getCurrentSection, getLessonProgress } = useLearning();

  const block = getCurrentBlock();
  const lesson = getCurrentLesson();
  const section = getCurrentSection();

  if (!block) {
    return <EmptyState />;
  }

  const blockId = block.id || block._id || '';
  
  // Проверяем, завершен ли текущий блок
  const lessonProgress = getLessonProgress(lesson?._id || '');
  const isBlockCompleted = lessonProgress?.blocks?.some(
    (b) => b.blockId === blockId && b.completed
  );

  return (
    <div>
      {/* Хлебные крошки с индикатором завершенности */}
      <div className="mb-6 flex items-center gap-3">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <span>{section?.title}</span>
          <span className="mx-2">/</span>
          <span>{lesson?.title}</span>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white font-medium">{block.title}</span>
        </div>
        {isBlockCompleted && (
          <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
        )}
      </div>

      {block.type === "text" && (
        <TextBlockView key={blockId} content={(block as ITextBlock).content} blockId={blockId} />
      )}
      {block.type === "video" && (
        <VideoBlockView key={blockId} content={(block as IVideoBlock).content} blockId={blockId} />
      )}
      {block.type === "quiz" && (
        <QuizBlockView key={blockId} content={(block as IQuizBlock).content} blockId={blockId} />
      )}
    </div>
  );
}
