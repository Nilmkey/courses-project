"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  Image,
  Bold,
  Italic,
  Strikethrough,
} from "lucide-react";

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  action: (editor: any) => void;
}

interface SlashCommandMenuProps {
  editor: any;
  query: string;
  command: (props: any) => void;
}

// Список команд
const getCommands = (onImageSelect: () => void): CommandItem[] => [
  {
    title: "Заголовок 1",
    description: "Большой заголовок раздела",
    icon: <Heading1 size={18} />,
    keywords: ["заголовок", "heading", "h1"],
    action: (editor: any) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    title: "Заголовок 2",
    description: "Средний заголовок подраздела",
    icon: <Heading2 size={18} />,
    keywords: ["заголовок", "heading", "h2"],
    action: (editor: any) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    title: "Заголовок 3",
    description: "Маленький заголовок",
    icon: <Heading3 size={18} />,
    keywords: ["заголовок", "heading", "h3"],
    action: (editor: any) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  {
    title: "Жирный текст",
    description: "Выделить текст жирным",
    icon: <Bold size={18} />,
    keywords: ["жирный", "bold"],
    action: (editor: any) => {
      editor.chain().focus().toggleBold().run();
    },
  },
  {
    title: "Курсив",
    description: "Выделить текст курсивом",
    icon: <Italic size={18} />,
    keywords: ["курсив", "italic"],
    action: (editor: any) => {
      editor.chain().focus().toggleItalic().run();
    },
  },
  {
    title: "Зачёркнутый",
    description: "Зачеркнуть текст",
    icon: <Strikethrough size={18} />,
    keywords: ["зачёркнутый", "strike"],
    action: (editor: any) => {
      editor.chain().focus().toggleStrike().run();
    },
  },
  {
    title: "Изображение",
    description: "Вставить изображение",
    icon: <Image size={18} />,
    keywords: ["изображение", "image", "фото", "картинка"],
    action: (editor: any) => {
      onImageSelect();
    },
  },
  {
    title: "Маркированный список",
    description: "Создать список с точками",
    icon: <List size={18} />,
    keywords: ["список", "list", "маркированный"],
    action: (editor: any) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  {
    title: "Нумерованный список",
    description: "Создать нумерованный список",
    icon: <ListOrdered size={18} />,
    keywords: ["список", "list", "нумерованный"],
    action: (editor: any) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  {
    title: "Блок кода",
    description: "Вставить блок кода",
    icon: <Code size={18} />,
    keywords: ["код", "code", "блок"],
    action: (editor: any) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  {
    title: "Цитата",
    description: "Оформить как цитату",
    icon: <Quote size={18} />,
    keywords: ["цитата", "blockquote", "quote"],
    action: (editor: any) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  {
    title: "Разделитель",
    description: "Горизонтальная линия",
    icon: <Minus size={18} />,
    keywords: ["разделитель", "hr", "line", "линия"],
    action: (editor: any) => {
      editor.chain().focus().setHorizontalRule().run();
    },
  },
];

export const SlashCommandMenu = forwardRef<
  { onKeyDown: (props: any) => boolean },
  SlashCommandMenuProps
>(({ editor, query, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageInput, setImageInput] = useState<HTMLInputElement | null>(null);

  // Обработчик выбора изображения
  const handleImageSelect = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        console.log("[SlashCommand] Загрузка изображения:", file.name);
        
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/v1/upload/image", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("[SlashCommand] URL получен:", data.url);

        if (data.url) {
          editor
            .chain()
            .focus()
            .setImage({ src: data.url, alt: file.name })
            .run();
        }
      } catch (error) {
        console.error("[SlashCommand] Ошибка загрузки:", error);
      }
    };
    input.click();
  }, [editor]);

  // Фильтрация команд по запросу
  const filteredCommands = getCommands(handleImageSelect).filter((item) => {
    const searchQuery = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery))
    );
  });

  // Выбор команды
  const selectItem = useCallback(
    (index: number) => {
      const item = filteredCommands[index];
      if (item) {
        item.action(editor);
      }
    },
    [editor, filteredCommands]
  );

  // Навигация клавишами
  const onKeyDown = useCallback(
    ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? filteredCommands.length - 1 : prev - 1
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev === filteredCommands.length - 1 ? 0 : prev + 1
        );
        return true;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
    [selectedIndex, selectItem, filteredCommands.length]
  );

  // Экспортируем метод для обработки клавиш
  useImperativeHandle(ref, () => ({
    onKeyDown,
  }));

  // Сброс индекса при изменении запроса
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (filteredCommands.length === 0) {
    return (
      <div className="slash-command-empty">
        Нет доступных команд
      </div>
    );
  }

  return (
    <div className="slash-command-menu">
      <div className="slash-command-header">
        <span className="slash-command-title">Команды</span>
        <span className="slash-command-hint">
          Используйте ↑↓ для навигации, Enter для выбора
        </span>
      </div>
      <div className="slash-command-list">
        {filteredCommands.map((item, index) => (
          <button
            key={index}
            className={`slash-command-item ${index === selectedIndex ? "selected" : ""}`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="slash-command-icon">{item.icon}</div>
            <div className="slash-command-content">
              <div className="slash-command-name">{item.title}</div>
              <div className="slash-command-description">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

SlashCommandMenu.displayName = "SlashCommandMenu";
