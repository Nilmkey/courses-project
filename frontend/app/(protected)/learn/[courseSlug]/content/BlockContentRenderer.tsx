"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";
import { TextBlockView } from "./TextBlockView";
import { VideoBlockView } from "./VideoBlockView";
import { QuizBlockView } from "./QuizBlockView";
import { BlockNavigation } from "@/components/learning/BlockNavigation";
import { EmptyState } from "@/components/learning/EmptyState";
import type {
  ITextBlock,
  IVideoBlock,
  IQuizBlock,
} from "@/types/types";

export function BlockContentRenderer() {
  const {
    getCurrentBlock,
    getCurrentLesson,
    getCurrentSection,
    isCurrentBlockCompleted,
  } = useLearning();

  const block = getCurrentBlock;
  const lesson = getCurrentLesson;
  const section = getCurrentSection;
  const blockId = block?._id || "";

  // Для квизов: отслеживаем успешное прохождение в текущей сессии
  const [isQuizPassed, setIsQuizPassed] = useState(false);

  // Сбрасываем флаг при смене блока
  useEffect(() => {
    setIsQuizPassed(false);
  }, [blockId]);

  if (!block) {
    return <EmptyState />;
  }

  // Можно ли перейти к следующему шагу?
  // Для текста и видео -> всегда true.
  // Для тестов -> true, если тест уже пройден ранее или успешно сдан прямо сейчас.
  const canProceed =
    block.type !== "quiz" || isCurrentBlockCompleted || isQuizPassed;

  return (
    <div className="pb-12">
      {/* Навигационная цепочка и статус */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span className="truncate max-w-[150px] sm:max-w-[200px]">{section?.title}</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="truncate max-w-[150px] sm:max-w-[200px] font-medium text-slate-700 dark:text-slate-300">{lesson?.title}</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
            {block.title}
          </span>
        </div>

        {isCurrentBlockCompleted ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
            Пройдено
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Sparkles size={12} className="text-slate-400" />
            В процессе
          </div>
        )}
      </div>

      {/* Содержимое блока */}
      <div className="space-y-6">
        {block.type === "text" && (
          <TextBlockView content={(block as ITextBlock).content} />
        )}
        {block.type === "video" && (
          <VideoBlockView content={(block as IVideoBlock).content} />
        )}
        {block.type === "quiz" && (
          <QuizBlockView
            key={blockId}
            content={(block as IQuizBlock).content}
            onQuizPassed={() => setIsQuizPassed(true)}
          />
        )}
      </div>

      {/* Единая нижняя панель навигации */}
      <BlockNavigation canProceed={canProceed} />
    </div>
  );
}
