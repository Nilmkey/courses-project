"use client";

import { useEffect, useState, useCallback } from "react";
import { Section } from "@/types/types";
import { CourseEditorCore } from "./CourseEditorCore";

interface CourseEditorClientProps {
  courseId: string;
}

/**
 * Клиентская обертка для редактора курса
 * Отвечает за загрузку данных и обработку ошибок
 */
export function CourseEditorClient({ courseId }: CourseEditorClientProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных курса
  const loadCourseData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Заменить на реальный API endpoint
      const response = await fetch(`/api/courses/${courseId}`);

      if (!response.ok) {
        throw new Error(`Failed to load course: ${response.status}`);
      }

      const data = await response.json();

      // Преобразуем данные в формат Section[]
      // Ожидаем, что API вернёт { sections: Section[] } или массив секций
      if (Array.isArray(data)) {
        setSections(data);
      } else if (data.sections && Array.isArray(data.sections)) {
        setSections(data.sections);
      } else {
        // Демо-данные для разработки
        setSections(getDemoSections());
      }
    } catch (err) {
      console.error("Error loading course:", err);
      setError(err instanceof Error ? err.message : "Failed to load course");

      // Fallback к демо-данным
      setSections(getDemoSections());
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Обработчик сохранения
  const handleSave = useCallback(
    async (updatedSections: Section[]) => {
      try {
        // TODO: Заменить на реальный API endpoint
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

        // Показываем уведомление об успехе
        // TODO: Заменить на toast notification
        alert("Курс успешно сохранён!");
      } catch (err) {
        console.error("Error saving course:", err);
        // TODO: Заменить на toast notification
        alert("Ошибка при сохранении курса");
      }
    },
    [courseId],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Загрузка курса...</p>
        </div>
      </div>
    );
  }

  // Error state (с возможностью повторной попытки)
  if (error && sections.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Ошибка загрузки
            </h2>
            <p className="text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={loadCourseData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <CourseEditorCore
      initialSections={sections}
      courseId={courseId}
      onSave={handleSave}
    />
  );
}
