"use client";

import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";
import { TextBlockView } from "./TextBlockView";
import { VideoBlockView } from "./VideoBlockView";
import { QuizBlockView } from "./QuizBlockView";
import { EmptyState } from "@/components/learning/EmptyState";
import type { ITextBlock, IVideoBlock, IQuizBlock } from "@/types/types";

export function BlockContentRenderer() {
  const {
    getCurrentBlock,
    getCurrentLesson,
    getCurrentSection,
    getLessonProgress,
  } = useLearning();

  const block = getCurrentBlock;
  const lesson = getCurrentLesson;
  const section = getCurrentSection;
  const blockId = block?._id || "";
  const lessonId = lesson?._id;

  const isBlockCompleted = useMemo(() => {
    if (!blockId || !lessonId) return false;

    const lessonProgress = getLessonProgress(lessonId);

    return (
      lessonProgress?.blocks?.some(
        (b) => b.blockId === blockId && b.completed,
      ) || false
    );
  }, [blockId, lessonId, getLessonProgress]);

  if (!block) {
    return <EmptyState />;
  }

  // const blockId = block.id || block._id || "";

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <span>{section?.title}</span>
          <span className="mx-2">/</span>
          <span>{lesson?.title}</span>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {block.title}
          </span>
        </div>
        {isBlockCompleted && (
          <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
        )}
      </div>

      {block.type === "text" && (
        <TextBlockView content={(block as ITextBlock).content} />
      )}
      {block.type === "video" && (
        <VideoBlockView content={(block as IVideoBlock).content} />
      )}
      {block.type === "quiz" && (
        <QuizBlockView key={blockId} content={(block as IQuizBlock).content} />
        
      )}
    </div>
  );
}
