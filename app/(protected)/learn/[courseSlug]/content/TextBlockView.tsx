"use client";

import { useEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { CompletionButton } from "@/components/learning/CompletionButton";
import type { ITextBlock } from "@/types/types";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord.css";

interface ReadonlyEditorProps {
  content: string;
}

const ReadonlyEditor = ({ content }: ReadonlyEditorProps) => {
  const hasInitialized = useRef(false);

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: content || "Содержимое блока отсутствует",
      features: {
        [Crepe.Feature.BlockEdit]: false,
        [Crepe.Feature.Toolbar]: false,
        [Crepe.Feature.LinkTooltip]: false,
      },
    });

    crepe.create();
    hasInitialized.current = true;

    return crepe;
  }, []);

  return (
    <div className="prose prose-slate max-w-none">
      <Milkdown />
    </div>
  );
};

export function TextBlockView({ content, blockId }: { content: ITextBlock["content"]; blockId?: string }) {
  // Убрали автоматическое завершение - теперь блок завершается только по кнопке
  return (
    <div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-6 shadow-sm">
        <MilkdownProvider>
          <ReadonlyEditor content={content.text || ""} />
        </MilkdownProvider>
      </div>

      <CompletionButton />
    </div>
  );
}
