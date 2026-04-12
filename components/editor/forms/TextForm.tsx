"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { apiRequest } from "@/lib/api/api-client";
import { BlockContent } from "@/types/types";
import "@/styles/tiptap-editor.css";

interface EditorProps {
  content: BlockContent | undefined;
  onUpdate: (markdown: BlockContent) => void;
}

// Загрузка изображения на сервер
async function uploadImageFile(file: File): Promise<string> {
  console.log(
    "[ImageUpload] Начинаю загрузку файла:",
    file.name,
    file.type,
    file.size,
  );

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiRequest<{ url: string }>(
      "/v1/upload/image",
      {
        method: "POST",
        body: formData,
        headers: {},
      },
      true,
    );

    console.log("[ImageUpload] Ответ сервера:", response);

    if (!response?.url) throw new Error("No URL in response");
    return response.url;
  } catch (error) {
    console.error("[ImageUpload] Ошибка загрузки:", error);
    throw error;
  }
}

// Простая конвертация Markdown в HTML
function markdownToHtml(md: string): string {
  if (!md) return "";

  let html = md;

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

  // Inline код
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Изображения
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Ссылки
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Горизонтальная линия
  html = html.replace(/^---$/gm, "<hr>");

  // Цитаты
  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  // Списки (дефис)
  html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
  // Обернуть li в ul
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Параграфы (двойные переносы строк)
  html = html
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (
        block.startsWith("<h") ||
        block.startsWith("<ul") ||
        block.startsWith("<pre") ||
        block.startsWith("<blockquote") ||
        block.startsWith("<hr") ||
        block.startsWith("<img")
      ) {
        return block;
      }
      // Заменяем одиночные переносы на <br>
      block = block.replace(/\n/g, "<br>");
      return `<p>${block}</p>`;
    })
    .join("\n");

  // Одиночные переносы
  html = html.replace(/\n/g, "");

  return html;
}

// Простая конвертация HTML в Markdown
function htmlToMarkdown(html: string): string {
  let md = html;

  // Заголовки
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n");
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n");

  // Жирный и курсив
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  // Код
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Блоки кода
  md = md.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    "```\n$1\n```\n\n",
  );

  // Изображения
  md = md.replace(
    /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    "![$2]($1)\n\n",
  );
  md = md.replace(
    /<img[^>]*alt="([^"]*)"[^>]+src="([^"]+)"[^>]*\/?>/gi,
    "![$1]($2)\n\n",
  );
  md = md.replace(/<img[^>]+src="([^"]+)"[^>]*\/?>/gi, "![]($1)\n\n");

  // Ссылки
  md = md.replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Списки
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<\/?ul[^>]*>/gi, "\n");
  md = md.replace(/<\/?ol[^>]*>/gi, "\n");

  // Параграфы и переносы
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Цитаты
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n");

  // Горизонтальная линия
  md = md.replace(/<hr\s*\/?>/gi, "---\n\n");

  // Удаляем остальные HTML теги
  md = md.replace(/<[^>]+>/g, "");

  // Декодируем HTML entities
  md = md.replace(/&nbsp;/g, " ");
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');

  // Убираем лишние пустые строки
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

export const TipTapEditor: React.FC<EditorProps> = ({ content, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // Важно для Next.js SSR
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: "Начните вводить текст или перетащите изображение...",
      }),
    ],
    // Конвертируем markdown в HTML при инициализации
    content: markdownToHtml(content?.text || ""),
    editorProps: {
      attributes: {
        class: "min-h-[300px] focus:outline-none",
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const items = Array.from(clipboardData.items);
        const imageItems = items.filter(
          (item) => item.type.indexOf("image") !== -1,
        );

        if (imageItems.length === 0) {
          return false; // Пусть TipTap обработает текст сам
        }

        event.preventDefault();

        imageItems.forEach(async (item) => {
          const file = item.getAsFile();
          if (!file) return;

          try {
            setIsUploading(true);
            console.log(
              "[ImageUpload] Загружаю изображение из paste:",
              file.name,
            );
            const url = await uploadImageFile(file);
            console.log("[ImageUpload] URL получен:", url);

            editor
              ?.chain()
              .focus()
              .setImage({ src: url, alt: file.name })
              .run();
          } catch (error) {
            console.error("[ImageUpload] Ошибка при загрузке:", error);
          } finally {
            setIsUploading(false);
          }
        });

        return true;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files) return false;

        const imageFiles = Array.from(files).filter(
          (file) => file.type.indexOf("image") !== -1,
        );

        if (imageFiles.length === 0) {
          return false; // Пусть TipTap обработает другие файлы сам
        }

        event.preventDefault();

        imageFiles.forEach(async (file) => {
          try {
            setIsUploading(true);
            console.log(
              "[ImageUpload] Загружаю изображение из drop:",
              file.name,
            );
            const url = await uploadImageFile(file);
            console.log("[ImageUpload] URL получен:", url);

            editor
              ?.chain()
              .focus()
              .setImage({ src: url, alt: file.name })
              .run();
          } catch (error) {
            console.error("[ImageUpload] Ошибка при загрузке:", error);
          } finally {
            setIsUploading(false);
          }
        });

        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      console.log("[TipTap] Конвертация в markdown, длина:", markdown.length);
      onUpdate({ text: markdown });
    },
  });

  // Индикатор загрузки
  if (isUploading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500 dark:text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b5bdb] mr-3"></div>
        <span>Загрузка изображения...</span>
      </div>
    );
  }

  return (
    <div className="tiptap-editor-wrapper">
      <EditorContent editor={editor} />
    </div>
  );
};

export const TipTapWrapper: React.FC<EditorProps> = (props) => {
  return <TipTapEditor {...props} />;
};
