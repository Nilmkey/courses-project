"use client";

import { memo, useMemo } from "react";
import { CompletionButton } from "@/components/learning/CompletionButton";
import type { ITextBlock } from "@/types/types";
import DOMPurify from "dompurify";
import "@/styles/tiptap-viewer.css";

// Простая конвертация Markdown в HTML
function markdownToHtml(md: string): string {
  if (!md || !md.trim())
    return '<p class="text-slate-400 dark:text-slate-500 italic">Содержимое блока отсутствует</p>';

  let html = md;

  // Экранируем HTML entities (чтобы не было XSS)
  html = html.replace(/&/g, "&amp;");
  html = html.replace(/</g, "&lt;");
  html = html.replace(/>/g, "&gt;");
  html = html.replace(/&quot;/g, "&quot;");

  // Блоки кода
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre><code class="language-$1">$2</code></pre>',
  );

  // Заголовки
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Жирный и курсив
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Inline код
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Изображения
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Ссылки
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Горизонтальная линия
  html = html.replace(/^---$/gm, "<hr />");

  // Цитаты
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  // Списки (дефис или звёздочка)
  html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
  // Обернуть li в ul
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Нумерованные списки
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match) => {
    if (!match.startsWith("<ul>")) {
      return `<ol>${match}</ol>`;
    }
    return match;
  });

  // Параграфы (двойные переносы строк)
  html = html
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (
        block.startsWith("<h") ||
        block.startsWith("<ul") ||
        block.startsWith("<ol") ||
        block.startsWith("<pre") ||
        block.startsWith("<blockquote") ||
        block.startsWith("<hr") ||
        block.startsWith("<img")
      ) {
        return block;
      }
      // Заменяем одиночные переносы на <br>
      block = block.replace(/\n/g, "<br />");
      return `<p>${block}</p>`;
    })
    .join("\n");

  // Одиночные переносы
  html = html.replace(/\n/g, "");

  return html;
}

interface ReadonlyEditorProps {
  content: string;
}

// Оптимизированный компонент для отображения (без TipTap)

const ReadonlyEditor = memo<ReadonlyEditorProps>(function ReadonlyEditor({
  content,
}) {
  const htmlContent = useMemo(() => {
    const converted = markdownToHtml(content);
    if (typeof window !== "undefined") {
      return DOMPurify.sanitize(converted);
    }
    return converted;
  }, [content]);

  return (
    <div
      className="tiptap-viewer prose prose-slate dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
});

export function TextBlockView({ content }: { content: ITextBlock["content"] }) {
  return (
    <div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-6 shadow-sm">
        <ReadonlyEditor content={content.text || ""} />
      </div>

      <CompletionButton />
    </div>
  );
}
