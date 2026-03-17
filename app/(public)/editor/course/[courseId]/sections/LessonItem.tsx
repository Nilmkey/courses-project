"use client";

import { memo, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Video,
  Pencil,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { SectionLesson } from "@/types/types";

export interface LessonItemProps {
  lesson: SectionLesson;
  sectionId: string;
  isOverlay?: boolean;
  isDraft?: boolean;
  isPending?: boolean;
  onEdit?: (lessonId: string) => void;
  onRemove?: (lessonId: string) => void;
}

export const LessonItem = memo(function LessonItem({
  lesson,
  sectionId,
  isOverlay = false,
  isDraft = true,
  isPending = false,
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
        rounded-xl border
        bg-white dark:bg-slate-800/60
        p-3
        transition-all duration-200
        hover:-translate-y-0.5
        ${
          isOverlay
            ? "border-indigo-400 shadow-xl shadow-indigo-500/10 scale-105 cursor-grabbing"
            : "border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/30"
        }
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="
          cursor-grab p-1
          hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg
          transition-colors
        "
      >
        <GripVertical
          size={16}
          className="text-slate-300 dark:text-slate-500"
        />
      </div>

      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-[#3b5bdb] dark:text-indigo-400">
        <Video size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 dark:text-white truncate text-sm">
          {lesson.title || "Без названия"}
        </h4>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Урок
        </p>
      </div>

      {/* {isDraft && (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700"
          title="Черновик"
        >
          <FileText size={12} />
          <span className="text-xs font-medium">Черновик</span>
        </div>
      )} */}

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          disabled={isPending}
          className={`
            p-2 rounded-xl transition-colors
            ${
              isPending
                ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                : "text-slate-400 hover:text-[#3b5bdb] hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
            }
          `}
          title={
            isPending
              ? "Нельзя редактировать во время создания"
              : "Редактировать"
          }
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Pencil size={15} />
          )}
        </button>
        <button
          onClick={handleRemove}
          disabled={isPending}
          className={`
            p-2 rounded-xl transition-colors
            ${
              isPending
                ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            }
          `}
          title={isPending ? "Нельзя удалить во время создания" : "Удалить"}
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>
    </div>
  );
});
