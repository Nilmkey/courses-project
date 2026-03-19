"use client";

import { useRef, memo } from "react";
import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { CompletionButton } from "@/components/learning/CompletionButton";
import type { ITextBlock } from "@/types/types";

import "@milkdown/crepe/theme/common/style.css";

// Кастомные стили для темной/светлой темы
const milkdownThemeStyles = `
  /* Светлая тема (по умолчанию) */
  .milkdown {
    --crepe-color-background: #ffffff;
    --crepe-color-on-background: #171717;
    --crepe-color-surface: #f8fafc;
    --crepe-color-on-surface: #1e293b;
    --crepe-color-surface-low: #f1f5f9;
    --crepe-color-primary: #3b5bdb;
    --crepe-color-on-primary: #ffffff;
    --crepe-color-secondary: #64748b;
    --crepe-color-on-secondary: #ffffff;
    --crepe-color-error: #ef4444;
    --crepe-color-on-error: #ffffff;
    --crepe-color-success: #22c55e;
    --crepe-color-on-success: #ffffff;
    --crepe-color-warning: #f59e0b;
    --crepe-color-on-warning: #1e293b;
    --crepe-color-info: #3b82f6;
    --crepe-color-on-info: #ffffff;
    --crepe-color-line: #e2e8f0;
    --crepe-color-selection: rgba(59, 91, 219, 0.1);
    
    /* Типографика */
    --crepe-font-default: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --crepe-font-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --crepe-font-code: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    
    /* Размеры */
    --crepe-font-size-base: 1rem;
    --crepe-font-size-h1: 1.875rem;
    --crepe-font-size-h2: 1.5rem;
    --crepe-font-size-h3: 1.25rem;
    --crepe-font-size-h4: 1.125rem;
    --crepe-font-size-h5: 1rem;
    --crepe-font-size-h6: 0.875rem;
    
    /* Отступы */
    --crepe-spacing-xs: 0.25rem;
    --crepe-spacing-s: 0.5rem;
    --crepe-spacing-m: 1rem;
    --crepe-spacing-l: 1.5rem;
    --crepe-spacing-xl: 2rem;
    
    /* Радиус скругления */
    --crepe-radius-s: 0.25rem;
    --crepe-radius-m: 0.5rem;
    --crepe-radius-l: 0.75rem;
  }

  /* Темная тема */
  .dark .milkdown {
    --crepe-color-background: #0a0a0a;
    --crepe-color-on-background: #ededed;
    --crepe-color-surface: #1e293b;
    --crepe-color-on-surface: #f1f5f9;
    --crepe-color-surface-low: #1e293b;
    --crepe-color-primary: #5c7cfa;
    --crepe-color-on-primary: #ffffff;
    --crepe-color-secondary: #94a3b8;
    --crepe-color-on-secondary: #1e293b;
    --crepe-color-error: #f87171;
    --crepe-color-on-error: #1e293b;
    --crepe-color-success: #4ade80;
    --crepe-color-on-success: #1e293b;
    --crepe-color-warning: #fbbf24;
    --crepe-color-on-warning: #1e293b;
    --crepe-color-info: #60a5fa;
    --crepe-color-on-info: #1e293b;
    --crepe-color-line: #334155;
    --crepe-color-selection: rgba(92, 124, 250, 0.2);
  }

  /* Стили для контента редактора */
  .milkdown .milkdown-editor {
    padding: 0;
    color: var(--crepe-color-on-background);
    line-height: 1.7;
  }

  .milkdown h1,
  .milkdown h2,
  .milkdown h3,
  .milkdown h4,
  .milkdown h5,
  .milkdown h6 {
    font-weight: 700;
    line-height: 1.3;
    color: var(--crepe-color-on-background);
    margin-top: 1.5em;
    margin-bottom: 0.75em;
  }

  .milkdown h1 { font-size: var(--crepe-font-size-h1); }
  .milkdown h2 { font-size: var(--crepe-font-size-h2); }
  .milkdown h3 { font-size: var(--crepe-font-size-h3); }
  .milkdown h4 { font-size: var(--crepe-font-size-h4); }
  .milkdown h5 { font-size: var(--crepe-font-size-h5); }
  .milkdown h6 { font-size: var(--crepe-font-size-h6); }

  .milkdown p {
    margin-bottom: 1em;
    color: var(--crepe-color-on-background);
  }

  .milkdown a {
    color: var(--crepe-color-primary);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .milkdown a:hover {
    color: var(--crepe-color-primary);
    opacity: 0.8;
    text-decoration: underline;
  }

  .milkdown code {
    background: var(--crepe-color-surface-low);
    padding: 0.2em 0.4em;
    border-radius: var(--crepe-radius-s);
    font-size: 0.875em;
    font-family: var(--crepe-font-code);
    color: var(--crepe-color-on-surface);
  }

  .milkdown pre {
    background: var(--crepe-color-surface);
    border: 1px solid var(--crepe-color-line);
    border-radius: var(--crepe-radius-m);
    padding: var(--crepe-spacing-l);
    overflow-x: auto;
    margin: var(--crepe-spacing-l) 0;
  }

  .milkdown pre code {
    background: transparent;
    padding: 0;
    color: var(--crepe-color-on-surface);
  }

  .milkdown blockquote {
    border-left: 4px solid var(--crepe-color-primary);
    padding-left: var(--crepe-spacing-l);
    margin: var(--crepe-spacing-l) 0;
    color: var(--crepe-color-secondary);
    font-style: italic;
  }

  .milkdown ul,
  .milkdown ol {
    padding-left: var(--crepe-spacing-xl);
    margin: var(--crepe-spacing-l) 0;
  }

  .milkdown li {
    margin-bottom: 0.5em;
    color: var(--crepe-color-on-background);
  }

  .milkdown hr {
    border: none;
    border-top: 1px solid var(--crepe-color-line);
    margin: var(--crepe-spacing-xl) 0;
  }

  .milkdown img {
    max-width: 100%;
    height: auto;
    border-radius: var(--crepe-radius-m);
    margin: var(--crepe-spacing-l) 0;
  }

  .milkdown table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--crepe-spacing-l) 0;
  }

  .milkdown th,
  .milkdown td {
    border: 1px solid var(--crepe-color-line);
    padding: var(--crepe-spacing-s) var(--crepe-spacing-m);
    text-align: left;
    color: var(--crepe-color-on-background);
  }

  .milkdown th {
    background: var(--crepe-color-surface-low);
    font-weight: 600;
  }

  .milkdown tr:nth-child(even) {
    background: var(--crepe-color-surface-low);
  }
`;

interface ReadonlyEditorProps {
  content: string;
}

// Оптимизированный редактор с memo
const ReadonlyEditor = memo<ReadonlyEditorProps>(function ReadonlyEditor({ content }) {
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
    <div className="milkdown">
      <Milkdown />
    </div>
  );
});

export function TextBlockView({ content }: { content: ITextBlock["content"] }) {
  return (
    <div>
      {/* Инъекция кастомных стилей темы */}
      <style dangerouslySetInnerHTML={{ __html: milkdownThemeStyles }} />
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-6 shadow-sm">
        <MilkdownProvider>
          <ReadonlyEditor content={content.text || ""} />
        </MilkdownProvider>
      </div>

      <CompletionButton />
    </div>
  );
}
