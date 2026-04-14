"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Suggestion, SuggestionOptions } from "@tiptap/suggestion";
import tippy from "tippy.js";
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

// TipTap расширение для Slash Command
export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          props.command(editor, range);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

// Компонент рендера меню
function SlashMenuRenderer(props: {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
  editor: Editor;
}) {
  const { items, command, editor } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingImageItem, setPendingImageItem] = useState<SlashMenuItem | null>(null);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      // Для image команды - сначала открываем file picker
      if (item.aliases.includes("image")) {
        setPendingImageItem(item);
        fileInputRef.current?.click();
      } else {
        command(item);
      }
    }
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor || !pendingImageItem) return;

      const loadingToast = toast.loading("Загрузка изображения...");

      try {
        const url = await uploadImageFile(file);
        
        // Удаляем slash команду и вставляем изображение
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: file.name })
          .run();
        
        toast.success("Изображение загружено!", { id: loadingToast });
      } catch (error) {
        console.error("[SlashMenu] Image upload error:", error);
        toast.error("Ошибка загрузки изображения", { id: loadingToast });
      } finally {
        e.target.value = "";
        setPendingImageItem(null);
      }
    },
    [editor, pendingImageItem],
  );

  // Навигация клавишами
  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [items]);

  // Группировка элементов
  const groupedItems = items.reduce<Record<string, SlashMenuItem[]>>(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {},
  );

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

      <div className="slash-menu">
        {Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <div key={groupName} className="slash-menu-group">
            <div className="slash-menu-group-label">{groupName}</div>
            {groupItems.map((item) => {
              const currentIndex = globalIndex;
              globalIndex++;
              const isSelected = currentIndex === selectedIndex;

              return (
                <button
                  key={item.title}
                  className={`slash-menu-item ${isSelected ? "selected" : ""}`}
                  onClick={() => selectItem(currentIndex)}
                >
                  <span className="slash-menu-item-icon">{item.icon}</span>
                  <div className="slash-menu-item-content">
                    <div className="slash-menu-item-title">{item.title}</div>
                    <div className="slash-menu-item-subtext">{item.subtext}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
        {items.length === 0 && (
          <div className="slash-menu-no-results">Ничего не найдено</div>
        )}
      </div>
    </>
  );
}

export function createSlashCommandExtension(
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  setUploading: (v: boolean) => void,
  editor: Editor | null,
) {
  const getItems = (editor: Editor): SlashMenuItem[] => [
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
      command: async (ed, range) => {
        ed.chain().focus().deleteRange(range).run();
        fileInputRef.current?.click();
      },
    },
  ];

  return SlashCommand.configure({
    suggestion: {
      items: ({ query, editor }: { query: string; editor: Editor }) => {
        const allItems = editor ? getItems(editor) : [];
        return filterItems(allItems, query);
      },
      render: () => {
        let component: any;
        let popup: any;

        return {
          onStart: (props: any) => {
            component = new SlashMenuRenderer({
              props: {
                ...props,
                editor: props.editor,
              },
            });

            if (!props.clientRect) {
              return;
            }

            popup = tippy("body", {
              getReferenceClientRect: props.clientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
            });
          },

          onUpdate(props: any) {
            component.updateProps(props);

            if (!props.clientRect) {
              return;
            }

            popup[0].setProps({
              getReferenceClientRect: props.clientRect,
            });
          },

          onKeyDown(props: any) {
            if (props.event.key === "Escape") {
              popup[0].hide();
              return true;
            }

            return component.ref?.onKeyDown(props);
          },

          onExit() {
            popup[0].destroy();
            component.destroy();
          },
        };
      },
    },
  });
}
