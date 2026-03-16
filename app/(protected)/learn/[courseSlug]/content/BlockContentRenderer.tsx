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
      <div className="mb-6 text-sm text-gray-500">
        <span>{section?.title}</span>
        <span className="mx-2">/</span>
        <span>{lesson?.title}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{block.title}</span>
      </div>

      {block.type === "text" && (
        <TextBlockView content={(block as ITextBlock).content} />
      )}
      {block.type === "video" && (
        <VideoBlockView content={(block as IVideoBlock).content} />
      )}
      {block.type === "quiz" && (
        <QuizBlockView content={(block as IQuizBlock).content} />
      )}
    </div>
  );
}
