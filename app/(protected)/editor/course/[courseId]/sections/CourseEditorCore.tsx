"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { useTheme } from "next-themes";
import { ArrowLeft, Loader2, BookOpen, Layers, Sun, Moon } from "lucide-react";
import { sectionsApi, lessonsApi } from "@/lib/api/entities/api-sections";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { Toaster } from "react-hot-toast";

interface CourseEditorCoreProps {
  courseId: string;
  onSave?: (sections: Section[]) => void;
  initialSections?: Section[] | null;
}

export function CourseEditorCore({ courseId, onSave, initialSections }: CourseEditorCoreProps) {
  const {
    sections,
    setSections,
    addSectionOptimistic,
    addLessonOptimistic,
    confirmOperation,
    rollbackOperation,
    removeSectionOptimistic,
    removeLessonOptimistic,
    restoreSection,
    restoreLesson,
  } = useSection();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasUnsavedChanges = useCallback(() => {
    if (!initialSections) return false;

    const current = JSON.stringify(sections);
    const initial = JSON.stringify(initialSections);

    return current !== initial;
  }, [sections, initialSections]);

  useUnsavedChanges({
    hasUnsavedChanges,
    message: "У вас есть несохраненные изменения в секциях. Вы уверены, что хотите уйти?",
    enabled: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleGoBack = useCallback(() => {
    router.push(`/editor/course/${courseId}`);
  }, [router, courseId]);

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

    const tempId = addSectionOptimistic(courseId);

    try {
      const response = await sectionsApi.create(courseId, {
        title: "Новая секция",
        order_index: sections.length + 1,
        isDraft: true,
      });

      confirmOperation(tempId, response._id);

      toast.success("Секция успешно создана!");
    } catch (error) {
      console.error("Ошибка при создании секции:", error);
      rollbackOperation(tempId);
      toast.error("Не удалось создать секцию");
    }
  }, [
    courseId,
    sections.length,
    addSectionOptimistic,
    confirmOperation,
    rollbackOperation,
    toast,
  ]);

  const handleRemoveSection = useCallback(
    async (sectionId: string) => {
      const { section: removedSection, sectionIndex } =
        removeSectionOptimistic(sectionId);

      try {
        await sectionsApi.delete(sectionId);
        toast.success("Секция удалена");
      } catch (error) {
        console.error("Ошибка при удалении секции:", error);
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

      const tempId = addLessonOptimistic(sectionId);

      try {
        const section = sections.find((s) => s.id === sectionId);
        const orderIndex = section ? section.lessons.length : 0;

        const response = await lessonsApi.create(sectionId, {
          title: "Новый урок",
          slug: `lesson-${Date.now()}`,
          order_index: orderIndex,
          is_free: false,
        });

        confirmOperation(tempId, response._id);

        toast.success("Урок успешно создан!");
      } catch (error) {
        console.error("Ошибка при создании урока:", error);
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
      const { lesson: removedLesson, lessonIndex } = removeLessonOptimistic(
        sectionId,
        lessonId,
      );

      try {
        await lessonsApi.delete(lessonId);
        toast.success("Урок удалён");
      } catch (error) {
        console.error("Ошибка при удалении урока:", error);
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

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId),
    [sections, activeSectionId],
  );

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const isTempId = (id: string) => id.startsWith("temp_");

  const handleSave = useCallback(async () => {
    if (!courseId) {
      toast.error("ID курса не определён");
      return;
    }

    setIsSaving(true);
    try {
      const updatePromises: Promise<unknown>[] = [];

      updatePromises.push(sectionsApi.reorder(courseId, sectionIds));

      for (const section of sections) {
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
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="
              flex items-center gap-2 px-4 py-2.5
              text-slate-500 dark:text-slate-400 hover:text-[#3b5bdb] dark:hover:text-indigo-400
              hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl
              transition-all duration-200 font-semibold text-sm
            "
          >
            <ArrowLeft size={18} />
            <span>Назад к курсу</span>
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
              title={theme === "dark" ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            px-6 py-2.5 text-white rounded-xl font-bold text-sm
            transition-all duration-200
            ${
              isSaving
                ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400"
                : "bg-gradient-to-r from-[#3b5bdb] to-[#5c7cfa] hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
            }
          `}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Сохранение...
            </span>
          ) : (
            "Сохранить"
          )}
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3b5bdb] to-[#5c7cfa] flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Layers size={20} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Редактор секций
          </h1>
        </div>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 pl-[52px]">
          Перетаскивайте секции и уроки для изменения порядка
        </p>
      </div>

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
                    isPending ? "opacity-70" : ""
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
                    <div className="absolute top-3.5 right-4 flex items-center gap-1.5 text-[10px] text-[#3b5bdb] dark:text-indigo-400 font-black uppercase tracking-widest animate-pulse">
                      <div className="w-1.5 h-1.5 bg-[#3b5bdb] rounded-full animate-bounce" />
                      Создание...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SortableContext>

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

      <div className="mt-6">
        <AddSectionButton onAdd={handleAddSection} />
      </div>

      <div className="mt-8 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Layers
                size={16}
                className="text-[#3b5bdb] dark:text-indigo-400"
              />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">
                {sections.length}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                секций
              </div>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <BookOpen
                size={16}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-800 dark:text-white">
                {sections.reduce((acc, s) => acc + s.lessons.length, 0)}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                уроков
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingLessonId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
              Редактирование урока
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 font-medium">
              ID урока: {editingLessonId}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingLessonId(null)}
                className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => setEditingLessonId(null)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#3b5bdb] to-[#5c7cfa] rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
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
