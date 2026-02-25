"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Section } from "@/types/types";
import { useSection } from "@/hooks/useSection";
import { db } from "@/lib/db";
import debounce from "lodash/debounce";
import { useParams } from "next/navigation";

export function CourseEditorClient() {
  const { courseId } = useParams<{ courseId: string }>();
  const { sections, setSections } = useSection();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    db.courses
      .get(courseId)
      .then((course) => {
        const loadedSections = course?.sections ?? [];
        // Нормализуем данные: добавляем isDraft=true, если поле отсутствует
        const normalizedSections = loadedSections.map((section, index) => ({
          ...section,
          isDraft: section.isDraft ?? true,
          order_index: section.order_index ?? index,
        }));
        setSections(normalizedSections);
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));
  }, [courseId, setSections]);

  const debouncedSave = useMemo(
    () =>
      debounce(async (payload: { sections: typeof sections; now: number }) => {
        await db.courses.put({
          courseId,
          sections: payload.sections,
          updatedAt: payload.now,
        });
      }, 500),
    [courseId],
  );

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  useEffect(() => {
    if (!isLoaded) return;
    debouncedSave({ sections, now: Date.now() });
  }, [sections, isLoaded, debouncedSave]);

  const handleSave = useCallback(
    async (updatedSections: Section[]) => {
      try {
        const response = await fetch(`/api/courses/${courseId}/sections`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sections: updatedSections }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save: ${response.status}`);
        }

        alert("Курс успешно сохранён!");
      } catch (err) {
        console.error("Error saving course:", err);
        alert("Ошибка при сохранении курса");
      }
    },
    [courseId],
  );

  return (
    <CourseEditorCore
      initialSections={sections}
      courseId={courseId}
      onSave={handleSave}
    />
  );
}

const CourseEditorCore = dynamic(
  () => import("./CourseEditorCore").then((mod) => mod.CourseEditorCore),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Загрузка редактора...</p>
        </div>
      </div>
    ),
  },
);
