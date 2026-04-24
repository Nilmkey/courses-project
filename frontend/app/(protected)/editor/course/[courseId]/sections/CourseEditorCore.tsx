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
import { useSection } from "@/frontend/hooks/useSection";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Layers,
  Sun,
  Moon,
  GripVertical,
  Save,
} from "lucide-react";
import {
  sectionsApi,
  lessonsApi,
} from "@/frontend/lib/api/entities/api-sections";
import { useToast } from "@/frontend/hooks/useToast";
import { useUnsavedChanges } from "@/frontend/hooks/useUnsavedChanges";

interface CourseEditorCoreProps {
  courseId: string;
  onSave?: (sections: Section[]) => void;
  initialSections?: Section[] | null;
}

export function CourseEditorCore({
  courseId,
  onSave,
  initialSections,
}: CourseEditorCoreProps) {
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
    message:
      "У вас есть несохраненные изменения в секциях. Вы уверены, что хотите уйти?",
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Настройки курса</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-inner border border-slate-200/50 dark:border-slate-700/50"
                title={theme === "dark" ? "Светлая тема" : "Темная тема"}
              >
                {theme === "dark" ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-slate-600" />
                )}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges()}
              className={`
                  flex items-center gap-2 h-12 px-6 rounded-xl font-bold
                  transition-all duration-300 ease-out
                  ${
                    isSaving || !hasUnsavedChanges()
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-transparent"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
                  }
                `}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span className="hidden sm:inline">
                {isSaving ? "Сохранение..." : "Сохранить всё"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 relative z-10 w-full mb-20">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Структура курса
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                Управляйте секциями и уроками, меняйте их порядок
              </p>
            </div>
          </div>
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
                      isPending ? "opacity-70 scale-[0.99]" : ""
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
                      <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest animate-pulse z-20">
                        <Loader2 className="w-3 h-3 animate-spin" />
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
              <div className="cursor-grabbing scale-105 shadow-2xl rounded-2xl">
                <SectionItem section={activeSection} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-8">
          <AddSectionButton onAdd={handleAddSection} />
        </div>

        {/* Stats footer */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-8 justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shadow-inner">
                <Layers
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {sections.length}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  секций
                </div>
              </div>
            </div>
            <div className="w-px h-12 bg-slate-200/50 dark:bg-slate-800/50" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shadow-inner">
                <BookOpen
                  size={20}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {sections.reduce((acc, s) => acc + s.lessons.length, 0)}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  уроков
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
