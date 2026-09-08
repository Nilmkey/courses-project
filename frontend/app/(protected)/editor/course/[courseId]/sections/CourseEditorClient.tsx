"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Section } from "@/types/types";
import { CourseEditorCore } from "./CourseEditorCore";
import { useSection } from "@/hooks/useSection";
import { sectionsApi } from "@/lib/api/entities/api-sections";
import { useToast } from "@/hooks/useToast";
import { Loader2 } from "lucide-react";

export function CourseEditorClient() {
  const { courseId } = useParams<{ courseId: string }>();
  const { setSections } = useSection();
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialSections, setInitialSections] = useState<Section[] | null>(
    null,
  );
  const toast = useToast();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!courseId || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadSections = async () => {
      try {
        const response = await sectionsApi.getByCourse(courseId);

        const loadedSections: Section[] = response.sections.map((section) => ({
          id: section._id,
          title: section.title,
          order_index: section.order_index,
          isDraft: section.isDraft,
          courseId,
          lessons: section.lessons.map((lesson) => ({
            lesson_id: lesson._id,
            title: lesson.title,
          })),
        }));

        setSections(loadedSections);
        setInitialSections(loadedSections);
      } catch (error) {
        console.error("Ошибка при загрузке секций:", error);
        toast.error("Не удалось загрузить секции курса");
        setSections([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleSave = useCallback(
    async (updatedSections: Section[]) => {
      try {
        setInitialSections(updatedSections);
        toast.success("Все изменения сохранены!");
      } catch (err) {
        console.error("Error saving course:", err);
      }
    },
    [toast],
  );

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#3b5bdb]" />
          <p className="text-sm font-black text-slate-400 tracking-[0.2em] uppercase animate-pulse">
            Загрузка редактора
          </p>
        </div>
      </div>
    );
  }

  return (
    <CourseEditorCore
      courseId={courseId}
      onSave={handleSave}
      initialSections={initialSections}
    />
  );
}
