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
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { sectionsApi, lessonsApi } from "@/lib/api/entities/api-sections";
import { useToast } from "@/hooks/useToast";

interface CourseEditorCoreProps {
  courseId: string;
  onSave?: (sections: Section[]) => void;
}

export function CourseEditorCore({ onSave }: CourseEditorCoreProps) {
  const { sections, setSections, addSectionOptimistic, addLessonOptimistic, confirmOperation, rollbackOperation, removeSectionOptimistic, removeLessonOptimistic, restoreSection, restoreLesson } = useSection();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { courseId } = params as { courseId: string };
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleGoBack = useCallback(() => {
    router.push(`/editor/course/${courseId}`);
  }, [router, courseId]);

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

          if (oldIndex === -1 || newIndex === -1) return prev;

          return arrayMove(prev, oldIndex, newIndex);
        });
      }

      setActiveSectionId(null);
    },
    [setSections],
  );

  const handleAddSection = useCallback(async () => {
    if (!courseId) {
      toast.error("ID курса не определён");
      return;
    }

    // 1. СРАЗУ добавляем секцию в UI (Optimistic UI)
    const tempId = addSectionOptimistic(courseId);

    try {
      // 2. Отправляем запрос на сервер
      const response = await sectionsApi.create(courseId, {
        title: "Новая секция",
        order_index: sections.length + 1,
        isDraft: true,
      });

      // 3. Заменяем временный ID на реальный от сервера
      confirmOperation(tempId, response._id);

      toast.success("Секция успешно создана!");
    } catch (error) {
      console.error("Ошибка при создании секции:", error);
      // 4. Откатываем изменения при ошибке
      rollbackOperation(tempId);
      toast.error("Не удалось создать секцию");
    }
  }, [courseId, sections.length, addSectionOptimistic, confirmOperation, rollbackOperation, toast]);

  const handleRemoveSection = useCallback(
    async (sectionId: string) => {
      // 1. СРАЗУ удаляем секцию из UI (Optimistic UI)
      const { section: removedSection, sectionIndex } = removeSectionOptimistic(sectionId);

      try {
        // 2. Отправляем запрос на сервер
        await sectionsApi.delete(sectionId);
        toast.success("Секция удалена");
      } catch (error) {
        console.error("Ошибка при удалении секции:", error);
        // 3. Восстанавливаем секцию при ошибке
        restoreSection(removedSection, sectionIndex);
        toast.error("Не удалось удалить секцию");
      }
    },
    [removeSectionOptimistic, restoreSection, toast],
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
    async (sectionId: string) => {
      if (!sectionId) {
        toast.error("ID секции не определён");
        return;
      }

      // 1. СРАЗУ добавляем урок в UI (Optimistic UI)
      const tempId = addLessonOptimistic(sectionId);

      try {
        // Находим секцию для определения порядка урока
        const section = sections.find((s) => s.id === sectionId);
        const orderIndex = section ? section.lessons.length : 0;

        // 2. Отправляем запрос на сервер
        const response = await lessonsApi.create(sectionId, {
          title: "Новый урок",
          slug: `lesson-${Date.now()}`,
          order_index: orderIndex,
          is_free: false,
        });

        // 3. Заменяем временный ID на реальный от сервера
        confirmOperation(tempId, response._id);

        toast.success("Урок успешно создан!");
      } catch (error) {
        console.error("Ошибка при создании урока:", error);
        // 4. Откатываем изменения при ошибке
        rollbackOperation(tempId);
        toast.error("Не удалось создать урок");
      }
    },
    [sections, addLessonOptimistic, confirmOperation, rollbackOperation, toast],
  );

  const handleEditLesson = useCallback(
    (lessonId: string) => {
      router.push(`/editor/lesson/${lessonId}`);
    },
    [router],
  );

  const handleRemoveLesson = useCallback(
    async (sectionId: string, lessonId: string) => {
      // 1. СРАЗУ удаляем урок из UI (Optimistic UI)
      const { lesson: removedLesson, lessonIndex } = removeLessonOptimistic(sectionId, lessonId);

      try {
        // 2. Отправляем запрос на сервер
        await lessonsApi.delete(lessonId);
        toast.success("Урок удалён");
      } catch (error) {
        console.error("Ошибка при удалении урока:", error);
        // 3. Восстанавливаем урок при ошибке
        restoreLesson(sectionId, removedLesson, lessonIndex);
        toast.error("Не удалось удалить урок");
      }
    },
    [removeLessonOptimistic, restoreLesson, toast],
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

  // Проверка, является ли ID временным
  const isTempId = (id: string) => id.startsWith('temp_');

  // ========== Сохранение ==========

  const handleSave = useCallback(async () => {
    if (!courseId) {
      toast.error("ID курса не определён");
      return;
    }
    
    setIsSaving(true);
    try {
      // Собираем все изменения для отправки на сервер
      const updatePromises: Promise<unknown>[] = [];

      // Обновляем порядок секций
      updatePromises.push(sectionsApi.reorder(courseId, sectionIds));

      // Обновляем каждую секцию (название, порядок, lessons)
      for (const section of sections) {
        // Собираем ID уроков в порядке их следования
        const lessonIds = section.lessons.map((l) => l.lesson_id);

        updatePromises.push(
          sectionsApi.update(section.id, {
            title: section.title,
            order_index: section.order_index,
            isDraft: section.isDraft,
            lessons: lessonIds,
          }),
        );
      }

      await Promise.all(updatePromises);

      toast.success("Все изменения сохранены!");
      onSave?.(sections);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      toast.error("Не удалось сохранить изменения");
    } finally {
      setIsSaving(false);
    }
  }, [sections, courseId, sectionIds, onSave, toast]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="
              flex items-center gap-2 px-4 py-2
              text-slate-600 hover:text-slate-900
              hover:bg-slate-100 rounded-lg
              transition-colors
            "
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Назад к курсу</span>
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            px-6 py-3 text-white rounded-lg font-medium
            transition-colors shadow-sm hover:shadow-md
            ${
              isSaving
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Сохранение...
            </span>
          ) : (
            "Сохранить"
          )}
        </button>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Редактор секций</h1>
      <p className="text-slate-500 mb-8">
        Перетаскивайте секции и уроки для изменения порядка
      </p>

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
            {sections.map((section) => {
              const isPending = isTempId(section.id);
              return (
                <div
                  key={section.id}
                  className={`relative transition-all duration-300 ${
                    isPending ? 'opacity-70' : ''
                  }`}
                >
                  <SectionItem
                    section={section}
                    onTitleChange={handleTitleChange}
                    onLessonChange={handleLessonChange}
                    onRemove={handleRemoveSection}
                    onAddLesson={handleAddLesson}
                    onEditLesson={handleEditLesson}
                    onRemoveLesson={handleRemoveLesson}
                    onToggleDraft={handleToggleDraft}
                  />
                  {isPending && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                      Создание...
                    </div>
                  )}
                </div>
              );
            })}
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
