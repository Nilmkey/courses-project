"use client";

import { useState, useCallback, useMemo } from "react";
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
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Section, SectionLesson } from "@/types/types";
import { SectionItem } from "./SectionItem";
import { AddSectionButton } from "./AddSectionButton";
import { useSection } from "@/hooks/useSection";
import { useRouter } from "next/navigation";

interface CourseEditorCoreProps {
  initialSections: Section[];
  sectionId: string;
  onSave?: (sections: Section[]) => void;
}

export function CourseEditorCore({ onSave }: CourseEditorCoreProps) {
  const { sections, setSections } = useSection();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // ========== Обработчики DnD для секций ==========

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveSectionId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setSections((prev) => {
          const oldIndex = prev.findIndex((s) => s.id === active.id);
          const newIndex = prev.findIndex((s) => s.id === over.id);

          // if (oldIndex === -1 || newIndex === -1) return prev;

          return arrayMove(prev, oldIndex, newIndex);
        });
      }

      setActiveSectionId(null);
    },
    [setSections],
  );

  const handleAddSection = useCallback(() => {
    setSections((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "Новая секция",
        order_index: sections.length + 1,
        isDraft: true,
        lessons: [],
      },
    ]);
  }, [setSections, sections]);

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      setSections((prev) => prev.filter((section) => section.id !== sectionId));
    },
    [setSections],
  );

  const handleTitleChange = useCallback(
    (sectionId: string, title: string) => {
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId ? { ...section, title } : section,
        ),
      );
    },
    [setSections],
  );

  const handleLessonChange = useCallback(
    (sectionId: string, lessons: SectionLesson[]) => {
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId ? { ...section, lessons } : section,
        ),
      );
    },
    [setSections],
  );

  const handleAddLesson = useCallback(
    (sectionId: string) => {
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                lessons: [
                  ...section.lessons,
                  {
                    lesson_id: crypto.randomUUID(),
                    title: "Новый урок",
                  },
                ],
              }
            : section,
        ),
      );
    },
    [setSections],
  );

  const handleEditLesson = useCallback(
    (lessonId: string) => {
      router.push(`/editor/lesson/${lessonId}`);
    },
    [router],
  );

  const handleRemoveLesson = useCallback(
    (sectionId: string, lessonId: string) => {
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                lessons: section.lessons.filter(
                  (lesson) => lesson.lesson_id !== lessonId,
                ),
              }
            : section,
        ),
      );
    },
    [setSections],
  );

  const handleToggleDraft = useCallback(
    (sectionId: string) => {
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? { ...section, isDraft: !section.isDraft }
            : section,
        ),
      );
    },
    [setSections],
  );

  // ========== Вычисляемые значения ==========

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId),
    [sections, activeSectionId],
  );

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  // ========== Сохранение ==========

  const handleSave = useCallback(() => {
    onSave?.(sections);
  }, [sections, onSave]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Редактор курса</h1>
          <p className="text-slate-500 mt-1">
            Перетаскивайте секции и уроки для изменения порядка
          </p>
        </div>
        <button
          onClick={handleSave}
          className="
            px-6 py-3 bg-blue-600 text-white 
            rounded-lg font-medium 
            hover:bg-blue-700 transition-colors
            shadow-sm hover:shadow-md
          "
        >
          Сохранить
        </button>
      </div>

      {/* Основной DnD контекст для секций */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                onTitleChange={handleTitleChange}
                onLessonChange={handleLessonChange}
                onRemove={handleRemoveSection}
                onAddLesson={handleAddLesson}
                onEditLesson={handleEditLesson}
                onRemoveLesson={handleRemoveLesson}
                onToggleDraft={handleToggleDraft}
              />
            ))}
          </div>
        </SortableContext>

        {/* DragOverlay для секций */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: "0.5" } },
            }),
          }}
        >
          {activeSectionId && activeSection ? (
            <div className="cursor-grabbing">
              <SectionItem section={activeSection} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Кнопка добавления секции */}
      <div className="mt-6">
        <AddSectionButton onAdd={handleAddSection} />
      </div>

      {/* Статистика */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span>
            <strong className="text-slate-900">{sections.length}</strong> секций
          </span>
          <span>
            <strong className="text-slate-900">
              {sections.reduce((acc, s) => acc + s.lessons.length, 0)}
            </strong>{" "}
            уроков
          </span>
        </div>
      </div>

      {/* Модалка редактирования урока (заглушка) */}
      {editingLessonId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Редактирование урока</h2>
            <p className="text-slate-500 mb-6">ID урока: {editingLessonId}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingLessonId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => setEditingLessonId(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
