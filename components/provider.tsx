"use client";

import { useEffect, useState, useCallback } from "react";
import { ConstructorContext } from "@/contexts/ConstructorContext";
import { CourseBlock, Section, infoLesson } from "@/types/types";
import { SectionContext } from "@/contexts/SectionContext";
import { addErrorObserver } from "@/lib/api/api-client";
import { useRouter } from "next/navigation";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [blocks, setBlocks] = useState<CourseBlock[]>([]);
  const [lessonInfo, setLessonInfo] = useState<infoLesson>({
    title: "",
    order_index: 777,
    sectionId: "",
  });
  const [sections, setSections] = useState<Section[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Глобальная обработка ошибок
    addErrorObserver((error) => {
      if (error.status === 401) router.push("/login");
      if (error.status >= 500) console.error(error);
    });
  }, [router]);

  // ========== Optimistic UI методы ==========

  const addSectionOptimistic = useCallback((courseId: string): string => {
    const tempId = `temp_section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setSections((prev) => [
      ...prev,
      {
        id: tempId,
        title: "Новая секция",
        order_index: prev.length + 1,
        isDraft: true,
        courseId,
        lessons: [],
      },
    ]);
    
    return tempId;
  }, []);

  const addLessonOptimistic = useCallback((sectionId: string): string => {
    const tempId = `temp_lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                {
                  lesson_id: tempId,
                  title: "Новый урок",
                },
              ],
            }
          : section,
      ),
    );
    
    return tempId;
  }, []);

  const confirmOperation = useCallback((tempId: string, realId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        // Если это секция с временным ID
        if (section.id === tempId) {
          return { ...section, id: realId };
        }
        // Если это урок с временным ID внутри секции
        const lessonIndex = section.lessons.findIndex((l) => l.lesson_id === tempId);
        if (lessonIndex !== -1) {
          const newLessons = [...section.lessons];
          newLessons[lessonIndex] = { ...newLessons[lessonIndex], lesson_id: realId };
          return { ...section, lessons: newLessons };
        }
        return section;
      }),
    );
  }, []);

  const rollbackOperation = useCallback((tempId: string) => {
    setSections((prev) => {
      // Проверяем, не секция ли это
      const sectionIndex = prev.findIndex((s) => s.id === tempId);
      if (sectionIndex !== -1) {
        return prev.filter((s) => s.id !== tempId);
      }
      
      // Проверяем, не урок ли это внутри секции
      return prev.map((section) => ({
        ...section,
        lessons: section.lessons.filter((l) => l.lesson_id !== tempId),
      }));
    });
  }, []);

  return (
    <ConstructorContext.Provider
      value={{ blocks, setBlocks, lessonInfo, setLessonInfo }}
    >
      <SectionContext.Provider
        value={{
          sections,
          setSections,
          addSectionOptimistic,
          addLessonOptimistic,
          confirmOperation,
          rollbackOperation,
        }}
      >
        {children}
      </SectionContext.Provider>
    </ConstructorContext.Provider>
  );
}
