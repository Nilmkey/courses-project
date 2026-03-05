"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Section } from "@/types/types";
import { CourseEditorCore } from "./CourseEditorCore";
import { useSection } from "@/hooks/useSection";
import { sectionsApi } from "@/lib/api/entities/api-sections";
import { useToast } from "@/hooks/useToast";

export function CourseEditorClient() {
  const { courseId } = useParams<{ courseId: string }>();
  const { setSections } = useSection();
  const [isLoaded, setIsLoaded] = useState(false);
  const toast = useToast();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!courseId || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadSections = async () => {
      try {
        const response = await sectionsApi.getByCourse(courseId);

        // Преобразуем ответ сервера в формат Section
        const loadedSections: Section[] = response.sections.map((section) => ({
          id: section._id,
          title: section.title,
          order_index: section.order_index,
          isDraft: section.isDraft,
          courseId,
          lessons: section.lessons.map((lessonId) => ({
            lesson_id: lessonId,
            title: "", // Название урока загрузится отдельно при редактировании
          })),
        }));

        setSections(loadedSections);
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
  }, [courseId]); // Убрали setSections и toast из зависимостей

  const handleSave = useCallback(
    async (updatedSections: Section[]) => {
      try {
        // Сохранение происходит в CourseEditorCore через sectionsApi
        // Здесь просто показываем уведомление
        toast.success("Все изменения сохранены!");
      } catch (err) {
        console.error("Error saving course:", err);
      }
    },
    [toast],
  );

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Загрузка редактора...</p>
        </div>
      </div>
    );
  }

  return (
    <CourseEditorCore
      courseId={courseId}
      onSave={handleSave}
    />
  );
}
