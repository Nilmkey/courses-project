"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Type,
  Video,
  HelpCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { CourseBlock } from "@/types/types";

interface Props {
  block: CourseBlock;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

export default function DragItem({
  block,
  onEdit,
  onDelete,
  isOverlay,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: isOverlay });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const config = {
    text: { icon: Type, color: "text-blue-500", label: "Конспект" },
    video: { icon: Video, color: "text-red-500", label: "Видео-урок" },
    quiz: { icon: HelpCircle, color: "text-green-500", label: "Тест" },
  };

  const Icon = config[block.type].icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-4 rounded-xl border border-slate-200 
        bg-white p-4 mb-3 shadow-sm transition-shadow hover:shadow-md
        ${isOverlay ? "shadow-xl border-blue-400 cursor-grabbing scale-105" : ""}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 hover:bg-slate-100 rounded transition-colors"
      >
        <GripVertical size={20} className="text-slate-400" />
      </div>

      <div className={`p-2 rounded-lg bg-slate-50 ${config[block.type].color}`}>
        <Icon size={22} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 truncate">{block.title}</h4>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
          {config[block.type].label}
        </p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(block.id)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
