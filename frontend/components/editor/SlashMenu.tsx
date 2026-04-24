"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import toast from "react-hot-toast";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Image,
} from "lucide-react";
import { apiRequest } from "@/lib/api/api-client";

// Загрузка изображения на сервер
async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest<{ url: string }>(
    "/v1/upload/image",
    {
      method: "POST",
      body: formData,
      headers: {},
    },
    true,
  );

  if (!response?.url) throw new Error("No URL in response");
  return response.url;
}

interface SlashMenuItem {
  title: string;
  subtext: string;
  icon: React.ReactNode;
  aliases: string[];
  group: string;
  command: (editor: Editor, range: { from: number; to: number }) => void;
}

interface SlashMenuProps {
  editor: Editor | null;
}

// Определение пунктов меню
function getSlashMenuItems(editor: Editor): SlashMenuItem[] {
  return [
    {
      title: "Text",
      subtext: "Plain text paragraph",
      icon: <Type className="w-4 h-4" />,
      aliases: ["text", "paragraph", "p"],
      group: "Basic",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).run();
      },
    },
    {
      title: "Heading 1",
      subtext: "Large section heading",
      icon: <Heading1 className="w-4 h-4" />,
      aliases: ["h1", "heading 1", "title"],
      group: "Headings",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      subtext: "Medium section heading",
      icon: <Heading2 className="w-4 h-4" />,
      aliases: ["h2", "heading 2"],
      group: "Headings",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      subtext: "Small section heading",
      icon: <Heading3 className="w-4 h-4" />,
      aliases: ["h3", "heading 3"],
      group: "Headings",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      subtext: "Unordered list of items",
      icon: <List className="w-4 h-4" />,
      aliases: ["ul", "bullet", "unordered"],
      group: "Lists",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      subtext: "Ordered list of items",
      icon: <ListOrdered className="w-4 h-4" />,
      aliases: ["ol", "numbered", "ordered"],
      group: "Lists",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Quote",
      subtext: "Blockquote for citations",
      icon: <Quote className="w-4 h-4" />,
      aliases: ["blockquote", "quote", "cite"],
      group: "Blocks",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Code Block",
      subtext: "Code snippet with syntax highlighting",
      icon: <Code className="w-4 h-4" />,
      aliases: ["code", "pre", "snippet"],
      group: "Blocks",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Divider",
      subtext: "Horizontal rule separator",
      icon: <Minus className="w-4 h-4" />,
      aliases: ["hr", "divider", "horizontal rule", "line"],
      group: "Blocks",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: "Image",
      subtext: "Upload an image from your device",
      icon: <Image className="w-4 h-4" />,
      aliases: ["image", "photo", "picture", "img", "upload"],
      group: "Media",
      command: (ed, range) => {
        ed.chain().focus().deleteRange(range).run();
      },
    },
  ];
}

// Фильтрация пунктов меню по поисковому запросу
function filterItems(items: SlashMenuItem[], query: string): SlashMenuItem[] {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();

  return items.filter((item) => {
    return (
      item.title.toLowerCase().includes(lowerQuery) ||
      item.subtext.toLowerCase().includes(lowerQuery) ||
      item.aliases.some((alias) => alias.toLowerCase().includes(lowerQuery))
    );
  });
}

export function SlashMenu({ editor }: SlashMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingRange, setPendingRange] = useState<{
    from: number;
    to: number;
  } | null>(null);

  const allItems = editor ? getSlashMenuItems(editor) : [];
  const filteredItems = filterItems(allItems, query);

  // Обработка выбора файла для загрузки изображения
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      setUploading(true);
      const loadingToast = toast.loading("Загрузка изображения...");

      try {
        const url = await uploadImageFile(file);

        // Если есть pending range - удаляем slash команду
        if (pendingRange) {
          editor.chain().focus().deleteRange(pendingRange).run();
        }

        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        toast.success("Изображение загружено!", { id: loadingToast });
      } catch (error) {
        console.error("[SlashMenu] Image upload error:", error);
        toast.error("Ошибка загрузки изображения", { id: loadingToast });
      } finally {
        setUploading(false);
        setPendingRange(null);
        // Сбрасываем input для повторного выбора того же файла
        e.target.value = "";
      }
    },
    [editor, pendingRange],
  );

  // Мониторинг ввода для slash команд
  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      const { state } = editor;
      const { selection, doc } = state;
      const { $anchor } = selection;

      // Получаем текст от начала текущего узла до позиции курсора
      const textFromStart = doc.textBetween($anchor.start(), $anchor.pos, "\n");

      // Ищем паттерн "/" или "/что-то" в конце текста
      const slashMatch = textFromStart.match(/\/(\w*)$/);

      if (slashMatch) {
        // Проверяем, что "/" не является частью URL или другого контекста
        const lineStart = textFromStart.slice(0, -slashMatch[0].length);
        const lastSpaceIndex = lineStart.lastIndexOf(" ");
        const lineBeforeSlash =
          lastSpaceIndex >= 0 ? lineStart.slice(lastSpaceIndex + 1) : lineStart;

        // Если перед "/" есть только пробелы или это начало строки - показываем меню
        if (lineBeforeSlash.trim() === "" || lineBeforeSlash === "") {
          const view = editor.view;

          // Получаем DOM элемент на позиции курсора
          const domAtPos = view.domAtPos($anchor.pos);
          if (!domAtPos) {
            setVisible(false);
            return;
          }

          // Создаем Range для получения точных координат
          const range = document.createRange();
          const { node, offset } = domAtPos;

          let rect: DOMRect;

          if (node.nodeType === Node.TEXT_NODE && offset > 0) {
            // Для текстового узла получаем координаты перед курсором
            range.setStart(node, Math.max(0, offset - 1));
            range.setEnd(node, offset);
            rect = range.getBoundingClientRect();
          } else {
            // Для элемента используем его rect
            const element =
              node.nodeType === Node.ELEMENT_NODE
                ? (node as Element)
                : node.parentElement || view.dom;
            rect = element.getBoundingClientRect();
          }

          // Сохраняем range для удаления slash команды
          const from = $anchor.pos - slashMatch[0].length;
          const to = $anchor.pos;
          setPendingRange({ from, to });

          // Определяем доступное пространство в viewport
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;

          const menuHeight = 400;
          const menuWidth = 320;
          const menuPadding = 4;

          // Доступное пространство снизу и сверху
          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;

          // Показываем меню снизу, если есть место, иначе сверху
          const showBelow = spaceBelow >= menuHeight || spaceBelow > spaceAbove;

          // Рассчитываем позицию
          let topPos = showBelow
            ? rect.bottom + menuPadding
            : rect.top - menuHeight - menuPadding;

          let leftPos = rect.left;

          // Корректируем, чтобы меню не выходило за правый край viewport
          if (leftPos + menuWidth > viewportWidth - 10) {
            leftPos = viewportWidth - menuWidth - 10;
          }

          // Корректируем, чтобы меню не выходило за левый край viewport
          if (leftPos < 10) {
            leftPos = 10;
          }

          // Корректируем вертикальную позицию
          if (topPos < 10) {
            topPos = 10;
          }
          if (topPos + menuHeight > viewportHeight - 10) {
            topPos = viewportHeight - menuHeight - 10;
          }

          setPosition({
            top: topPos,
            left: leftPos,
          });
          setVisible(true);
          setQuery(slashMatch[1] || "");
          setSelectedIndex(0);
          return;
        }
      }

      setVisible(false);
    };

    editor.on("transaction", handleTransaction);

    return () => {
      editor.off("transaction", handleTransaction);
    };
  }, [editor]);

  // Клавиатурная навигация
  useEffect(() => {
    if (!visible || filteredItems.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex] && editor) {
            const item = filteredItems[selectedIndex];

            // Для image - открываем file picker
            if (item.aliases.includes("image")) {
              if (pendingRange) {
                editor.chain().focus().deleteRange(pendingRange).run();
              }
              fileInputRef.current?.click();
            } else {
              selectItem(item);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          setVisible(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, filteredItems, selectedIndex, editor, pendingRange]);

  // Выбор пункта меню
  const selectItem = (item: SlashMenuItem) => {
    if (!editor) return;

    if (pendingRange) {
      item.command(editor, pendingRange);
    }

    setVisible(false);
  };

  // Группировка элементов
  const groupedItems = filteredItems.reduce<Record<string, SlashMenuItem[]>>(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {},
  );

  if (!visible || filteredItems.length === 0) {
    return (
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    );
  }

  let globalIndex = 0;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div
        className="slash-menu"
        style={{
          position: "fixed",
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 99999,
        }}
      >
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} className="slash-menu-group">
            <div className="slash-menu-group-label">{groupName}</div>
            {items.map((item) => {
              const currentIndex = globalIndex;
              globalIndex++;
              const isSelected = currentIndex === selectedIndex;

              return (
                <button
                  key={item.title}
                  className={`slash-menu-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    if (item.aliases.includes("image")) {
                      if (pendingRange) {
                        editor?.chain().focus().deleteRange(pendingRange).run();
                      }
                      fileInputRef.current?.click();
                    } else {
                      selectItem(item);
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(currentIndex)}
                >
                  <span className="slash-menu-item-icon">{item.icon}</span>
                  <div className="slash-menu-item-content">
                    <div className="slash-menu-item-title">{item.title}</div>
                    <div className="slash-menu-item-subtext">
                      {item.subtext}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
