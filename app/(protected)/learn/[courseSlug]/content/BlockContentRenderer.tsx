"use client";

import { useLearning } from "@/hooks/useLearning";
import { TextBlockView } from "./TextBlockView";
import { VideoBlockView } from "./VideoBlockView";
import { QuizBlockView } from "./QuizBlockView";
import { EmptyState } from "@/components/learning/EmptyState";
import type { ITextBlock, IVideoBlock, IQuizBlock } from "@/types/types";

export function BlockContentRenderer() {
  const { getCurrentBlock, getCurrentLesson, getCurrentSection } = useLearning();

  const block = getCurrentBlock();
  const lesson = getCurrentLesson();
  const section = getCurrentSection();

  if (!block) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Хлебные крошки */}
      <div className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <span>{section?.title}</span>
        <span className="mx-2">/</span>
        <span>{lesson?.title}</span>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-medium">{block.title}</span>
      </div>

      {block.type === "text" && (
        <TextBlockView key={block.id || block._id} content={(block as ITextBlock).content} />
      )}
      {block.type === "video" && (
        <VideoBlockView key={block.id || block._id} content={(block as IVideoBlock).content} />
      )}
      {block.type === "quiz" && (
        <QuizBlockView key={block.id || block._id} content={(block as IQuizBlock).content} />
      )}
    </div>
  );
}
