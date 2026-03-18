"use client";

import { Plus } from "lucide-react";

interface AddSectionButtonProps {
  onAdd: () => void;
}

export function AddSectionButton({ onAdd }: AddSectionButtonProps) {
  return (
    <button
      onClick={onAdd}
      className="
        w-full py-7 px-4
        border-2 border-dashed border-indigo-200 dark:border-indigo-500/30
        rounded-2xl bg-indigo-50/40 dark:bg-indigo-500/5
        hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/50
        transition-all duration-200
        group flex items-center justify-center gap-3
      "
    >
      <div
        className="
        p-3 bg-white dark:bg-slate-800 rounded-2xl
        shadow-sm border border-indigo-100 dark:border-indigo-500/20
        text-indigo-300 dark:text-indigo-400
        group-hover:text-[#3b5bdb] group-hover:scale-110 group-hover:shadow-md group-hover:shadow-indigo-500/10
        transition-all duration-200
      "
      >
        <Plus size={22} />
      </div>
      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-[#3b5bdb] dark:group-hover:text-indigo-400 transition-colors">
        Добавить секцию
      </span>
    </button>
  );
}
