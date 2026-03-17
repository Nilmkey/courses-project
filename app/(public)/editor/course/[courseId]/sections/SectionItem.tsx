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
  Loader2,
} from "lucide-react";
import { Section, SectionLesson } from "@/types/types";
import { LessonItem } from "./LessonItem";

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

  const isPending = section.id.startsWith("temp_");

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

  const handleLessonDragStart = useCallback((event: DragStartEvent) => {
    setActiveLessonId(event.active.id as string);
  }, []);

  const handleLessonDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
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
        group
        rounded-2xl border bg-white dark:bg-slate-900
        transition-all duration-200
        ${
          isOverlay
            ? "border-indigo-400 shadow-xl shadow-indigo-500/10 scale-105"
            : "border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:shadow-indigo-500/5"
        }
      `}
    >
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
        <div
          {...attributes}
          {...listeners}
          className="
            cursor-grab p-1
            hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg
            transition-colors
          "
        >
          <GripVertical
            size={18}
            className="text-slate-300 dark:text-slate-600"
          />
        </div>

        <button
          onClick={handleToggleExpand}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 dark:text-slate-500"
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        <input
          type="text"
          value={section.title}
          onChange={handleTitleChange}
          disabled={isPending}
          className={`
            flex-1 font-bold text-slate-800 dark:text-white text-sm
            bg-transparent border-none outline-none
            focus:ring-2 focus:ring-[#3b5bdb]/30 rounded-lg px-2 py-1
            placeholder:text-slate-400 dark:placeholder:text-slate-600
            ${isPending ? "opacity-50 cursor-not-allowed" : ""}
          `}
          placeholder="Название секции"
        />

        <button
          onClick={handleToggleDraft}
          disabled={isPending}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors
            ${
              isPending
                ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400"
                : section.isDraft
                  ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-100 dark:border-amber-500/20"
                  : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-100 dark:border-emerald-500/20"
            }
          `}
          title={
            isPending
              ? "Нельзя изменить во время создания"
              : section.isDraft
                ? "Опубликовать секцию"
                : "Вернуть в черновики"
          }
        >
          {section.isDraft ? (
            <>
              <CircleDashed size={12} />
              <span>Черновик</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} />
              <span>Опубликовано</span>
            </>
          )}
        </button>

        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          {section.lessons.length}{" "}
          {section.lessons.length === 1 ? "урок" : "уроков"}
        </span>

        <div
          className={`flex gap-1 transition-opacity ${
            isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
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
            title={
              isPending ? "Нельзя удалить во время создания" : "Удалить секцию"
            }
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-2 bg-slate-50/30 dark:bg-slate-800/20 rounded-b-2xl">
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
                section.lessons.map((lesson) => {
                  const isLessonPending = lesson.lesson_id.startsWith("temp_");
                  return (
                    <div
                      key={`${section.id}-lesson-${lesson.lesson_id}`}
                      className={`relative transition-all duration-300 ${
                        isLessonPending ? "opacity-70" : ""
                      }`}
                    >
                      <LessonItem
                        lesson={lesson}
                        sectionId={section.id}
                        isPending={isLessonPending}
                        onEdit={handleEditLesson}
                        onRemove={handleRemoveLesson}
                      />
                      {isLessonPending && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-[#3b5bdb] font-black uppercase tracking-widest animate-pulse">
                          <div className="w-1.5 h-1.5 bg-[#3b5bdb] rounded-full" />
                          Создание...
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm font-medium">
                  В этой секции пока нет уроков
                </div>
              )}
            </SortableContext>

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

          <button
            onClick={handleAddLesson}
            className="
              w-full py-3 px-4
              border-2 border-dashed border-indigo-100 dark:border-indigo-500/20
              rounded-xl
              hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/30
              transition-all duration-200
              flex items-center justify-center gap-2
              text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-[#3b5bdb] dark:hover:text-indigo-400
            "
          >
            <Plus size={15} />
            Добавить урок
          </button>
        </div>
      )}
    </div>
  );
});
