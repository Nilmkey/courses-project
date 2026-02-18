"use client";

import { Plus, Type, Video, HelpCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useConstructor } from "@/hooks/useConstructor";
import { createNewBlock } from "@/lib/makeBlock";
import { BlockType } from "@/types/types";

interface MenuLinkProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  type: BlockType;
  onClick: () => void;
}

function MenuOption({ icon, label, description, onClick }: MenuLinkProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-3 py-2 text-left transition-all hover:bg-slate-50 rounded-lg group"
    >
      <div className="mt-1 p-2 bg-slate-100 rounded-md text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </button>
  );
}

export function AddItemButton() {
  const { setBlocks } = useConstructor();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAddBlock = (type: BlockType) => {
    setBlocks((prev) => [...prev, createNewBlock(type)]);
    setIsOpen(false)
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col items-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all group mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center gap-3 focus:outline-none"
      >
        <div className="p-4 bg-white rounded-full shadow-sm border border-slate-200 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300">
          <Plus size={32} />
        </div>
        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700">
          Добавить новый блок
        </span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full mt-4 z-50 w-50 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top"
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Тип контента
          </div>

          <MenuOption
            icon={<Type size={18} />}
            label="Текстовый конспект"
            description="Markdown, списки и форматирование"
            type="text"
            onClick={() => handleAddBlock("text")}
          />

          <MenuOption
            icon={<Video size={18} />}
            label="Видео-урок"
            description="YouTube, Vimeo или свой плеер"
            type="video"
            onClick={() => handleAddBlock("video")}
          />

          <MenuOption
            icon={<HelpCircle size={18} />}
            label="Проверочный тест"
            description="Вопросы с вариантами ответов"
            type="quiz"
            onClick={() => handleAddBlock("quiz")}
          />
        </div>
      )}
    </div>
  );
}
