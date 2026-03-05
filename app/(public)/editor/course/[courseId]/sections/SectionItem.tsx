"use client";

import { memo, useCallback, useState } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import { Section, SectionLesson } from "@/types/types";
import { LessonItem } from "./LessonItem";
// import { useConstructor } from "@/hooks/useConstructor";

export interface SectionItemProps {
  section: Section;
  isOverlay?: boolean;
  onTitleChange?: (id: string, title: string) => void;
  onLessonChange?: (sectionId: string, lessons: SectionLesson[]) => void;
  onRemove?: (id: string) => void;
  onAddLesson?: (sectionId: string) => void;
  onEditLesson?: (lessonId: string) => void;
  onRemoveLesson?: (sectionId: string, lessonId: string) => void;
  onToggleDraft?: (sectionId: string) => void;
}

/**
 * Компонент секции с вложенным DnD для уроков
 * Оптимизирован с React.memo для минимизации ререндеров
 */
export const SectionItem = memo(function SectionItem({
  section,
  isOverlay = false,
  onTitleChange,
  onLessonChange,
  onRemove,
  onAddLesson,
  onEditLesson,
  onRemoveLesson,
  onToggleDraft,
}: SectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Sensors для внутреннего DnD (уроки)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: isOverlay,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // ========== Обработчики секции ==========

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onTitleChange?.(section.id, e.target.value);
    },
    [section.id, onTitleChange],
  );

  const handleRemove = useCallback(() => {
    onRemove?.(section.id);
  }, [section.id, onRemove]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleAddLesson = useCallback(() => {
    onAddLesson?.(section.id);
  }, [section.id, onAddLesson]);

  const handleToggleDraft = useCallback(() => {
    onToggleDraft?.(section.id);
  }, [section.id, onToggleDraft]);

  // ========== Обработчики уроков (внутренний DnD) ==========

  const handleLessonDragStart = useCallback((event: DragStartEvent) => {
    setActiveLessonId(event.active.id as string);
  }, []);

  const handleLessonDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        // Извлекаем lesson_id из уникального ID
        const activeLessonId = (active.id as string).replace(
          `${section.id}-lesson-`,
          "",
        );
        const overLessonId = (over.id as string).replace(
          `${section.id}-lesson-`,
          "",
        );

        const oldIndex = section.lessons.findIndex(
          (l) => l.lesson_id === activeLessonId,
        );
        const newIndex = section.lessons.findIndex(
          (l) => l.lesson_id === overLessonId,
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newLessons = [...section.lessons];
          const [removed] = newLessons.splice(oldIndex, 1);
          newLessons.splice(newIndex, 0, removed);
          onLessonChange?.(section.id, newLessons);
        }
      }

      setActiveLessonId(null);
    },
    [section.id, section.lessons, onLessonChange],
  );

  const handleEditLesson = useCallback(
    (lessonId: string) => {
      onEditLesson?.(lessonId);
    },
    [onEditLesson],
  );

  const handleRemoveLesson = useCallback(
    (lessonId: string) => {
      onRemoveLesson?.(section.id, lessonId);
    },
    [section.id, onRemoveLesson],
  );

  // Находим активный урок для DragOverlay
  const activeLesson = activeLessonId
    ? section.lessons.find(
        (l) => `${section.id}-lesson-${l.lesson_id}` === activeLessonId,
      )
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        rounded-xl border bg-white shadow-sm
        ${isOverlay ? "border-blue-400 shadow-xl scale-105" : "border-slate-200"}
        transition-all duration-200
      `}
    >
      <div className="flex items-center gap-3 p-4 border-b border-slate-100">
        <div
          {...attributes}
          {...listeners}
          className="
            cursor-grab p-1 
            hover:bg-slate-100 rounded 
            transition-colors
          "
        >
          <GripVertical size={20} className="text-slate-400" />
        </div>

        <button
          onClick={handleToggleExpand}
          className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500"
        >
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>

        <input
          type="text"
          value={section.title}
          onChange={handleTitleChange}
          className="
            flex-1 font-semibold text-slate-900 
            bg-transparent border-none outline-none 
            focus:ring-2 focus:ring-blue-500 rounded px-2 py-1
          "
          placeholder="Название секции"
        />

        {/* Индикатор статуса с кликом */}
        <button
          onClick={handleToggleDraft}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full transition-colors
            ${
              section.isDraft
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }
          `}
          title={
            section.isDraft ? "Опубликовать секцию" : "Вернуть в черновики"
          }
        >
          {section.isDraft ? (
            <>
              <CircleDashed size={14} />
              <span className="text-xs font-medium">Черновик</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              <span className="text-xs font-medium">Опубликовано</span>
            </>
          )}
        </button>

        {/* Количество уроков */}
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {section.lessons.length}{" "}
          {section.lessons.length === 1 ? "урок" : "уроков"}
        </span>

        {/* Индикатор черновика секции */}

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleRemove}
            className="
              p-2 text-slate-400 
              hover:text-red-600 hover:bg-red-50 
              rounded-lg transition-colors
            "
            title="Удалить секцию"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Контент секции (уроки) */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {/* Вложенный DnD для уроков */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleLessonDragStart}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={section.lessons.map(
                (l) => `${section.id}-lesson-${l.lesson_id}`,
              )}
              strategy={verticalListSortingStrategy}
            >
              {section.lessons.length > 0 ? (
                section.lessons.map((lesson) => (
                  <LessonItem
                    key={`${section.id}-lesson-${lesson.lesson_id}`}
                    lesson={lesson}
                    sectionId={section.id}
                    onEdit={handleEditLesson}
                    onRemove={handleRemoveLesson}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm">
                  В этой секции пока нет уроков
                </div>
              )}
            </SortableContext>

            {/* DragOverlay для уроков */}
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: "0.5" } },
                }),
              }}
            >
              {activeLessonId && activeLesson ? (
                <div className="cursor-grabbing">
                  <LessonItem
                    lesson={activeLesson}
                    sectionId={section.id}
                    isOverlay
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Кнопка добавления урока */}
          <button
            onClick={handleAddLesson}
            className="
              w-full py-3 px-4 
              border-2 border-dashed border-slate-200 
              rounded-lg 
              hover:bg-slate-50 hover:border-slate-300 
              transition-all duration-200
              flex items-center justify-center gap-2
              text-sm text-slate-500 hover:text-slate-700
            "
          >
            <Plus size={18} />
            Добавить урок
          </button>
        </div>
      )}
    </div>
  );
});
