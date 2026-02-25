"use client";

import { memo, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Video, Pencil, Trash2, FileText } from "lucide-react";
import { SectionLesson } from "@/types/types";

export interface LessonItemProps {
  lesson: SectionLesson;
  sectionId: string;
  isOverlay?: boolean;
  isDraft?: boolean;
  onEdit?: (lessonId: string) => void;
  onRemove?: (lessonId: string) => void;
}

export const LessonItem = memo(function LessonItem({
  lesson,
  sectionId,
  isOverlay = false,
  isDraft = true,
  onEdit,
  onRemove,
}: LessonItemProps) {
  const uniqueId = `${sectionId}-lesson-${lesson.lesson_id}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: uniqueId,
    disabled: isOverlay,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const handleEdit = useCallback(() => {
    onEdit?.(lesson.lesson_id);
  }, [lesson.lesson_id, onEdit]);

  const handleRemove = useCallback(() => {
    onRemove?.(lesson.lesson_id);
  }, [lesson.lesson_id, onRemove]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 
        rounded-lg border border-slate-200 
        bg-white p-3 
        shadow-sm transition-shadow 
        hover:shadow-md
        ${isOverlay ? "shadow-xl border-blue-400 cursor-grabbing scale-105" : ""}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="
          cursor-grab p-1 
          hover:bg-slate-100 rounded 
          transition-colors
        "
      >
        <GripVertical size={16} className="text-slate-400" />
      </div>

      {/* Icon */}
      <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
        <Video size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 truncate text-sm">
          {lesson.title || "Без названия"}
        </h4>
        <p className="text-xs text-slate-500">Урок</p>
      </div>

      {/* Индикатор черновика */}
      {isDraft && (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700"
          title="Черновик"
        >
          <FileText size={12} />
          {/* <span className="text-xs font-medium">Черновик</span> */}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="
            p-2 text-slate-400 
            hover:text-blue-600 hover:bg-blue-50 
            rounded-lg transition-colors
          "
          title="Редактировать"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={handleRemove}
          className="
            p-2 text-slate-400 
            hover:text-red-600 hover:bg-red-50 
            rounded-lg transition-colors
          "
          title="Удалить"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
});
