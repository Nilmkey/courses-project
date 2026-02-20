"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { Section } from "@/types/types";
import { useSection } from "@/hooks/useSection";

interface CourseEditorClientProps {
  courseId: string;
}

export function CourseEditorClient({ courseId }: CourseEditorClientProps) {
  const { sections } = useSection();

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
        // TODO: Заменить на toast notification
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
