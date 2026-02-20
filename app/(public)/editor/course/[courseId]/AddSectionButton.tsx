"use client";

import { Plus } from "lucide-react";

interface AddSectionButtonProps {
  onAdd: () => void;
}

/**
 * Кнопка добавления новой секции
 * Минималистичный дизайн в стиле additemButton
 */
export function AddSectionButton({ onAdd }: AddSectionButtonProps) {
  return (
    <button
      onClick={onAdd}
      className="
        w-full py-6 px-4 
        border-2 border-dashed border-slate-200 
        rounded-2xl bg-slate-50/50 
        hover:bg-slate-100 hover:border-slate-300 
        transition-all duration-200
        group flex items-center justify-center gap-3
      "
    >
      <div className="
        p-3 bg-white rounded-full 
        shadow-sm border border-slate-200 
        text-slate-400 
        group-hover:text-blue-500 group-hover:scale-110 
        transition-all duration-200
      ">
        <Plus size={24} />
      </div>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">
        Добавить секцию
      </span>
    </button>
  );
}
