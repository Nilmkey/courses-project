"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Section } from "@/types/types";
import { useSection } from "@/hooks/useSection";
import { db } from "@/lib/db";
import debounce from "lodash/debounce";
import { useParams } from "next/navigation";

export function CourseEditorClient() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { sections, setSections } = useSection();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    db.courses
      .get(sectionId)
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
  }, [sectionId, setSections]);

  const debouncedSave = useMemo(
    () =>
      debounce(
        async (payload: {
          sectionId: string;
          sections: typeof sections;
          now: number;
        }) => {
          await db.courses.put({
            sectionId,
            sections: payload.sections,
            updatedAt: payload.now,
          });
        },
        500,
      ),
    [sectionId],
  );

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  useEffect(() => {
    if (!isLoaded) return;
    debouncedSave({ sectionId, sections, now: Date.now() });
  }, [sections, isLoaded, debouncedSave, sectionId]);

  const handleSave = useCallback(
    async (updatedSections: Section[]) => {
      try {
        const response = await fetch(`/api/courses/${sectionId}/sections`, {
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
    [sectionId],
  );

  return (
    <CourseEditorCore
      initialSections={sections}
      sectionId={sectionId}
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
