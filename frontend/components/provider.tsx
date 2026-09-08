"use client";

import { useEffect, useState, useCallback } from "react";
import { ConstructorContext } from "@/contexts/ConstructorContext";
import { CourseBlock, Section, SectionLesson, infoLesson } from "@/types/types";
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
    addErrorObserver((error) => {
      if (error.status === 401) router.push("/login");
      if (error.status >= 500) console.error(error);
    });
  }, [router]);

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
        if (section.id === tempId) {
          return { ...section, id: realId };
        }
        const lessonIndex = section.lessons.findIndex(
          (l) => l.lesson_id === tempId,
        );
        if (lessonIndex !== -1) {
          const newLessons = [...section.lessons];
          newLessons[lessonIndex] = {
            ...newLessons[lessonIndex],
            lesson_id: realId,
          };
          return { ...section, lessons: newLessons };
        }
        return section;
      }),
    );
  }, []);

  const rollbackOperation = useCallback((tempId: string) => {
    setSections((prev) => {
      const sectionIndex = prev.findIndex((s) => s.id === tempId);
      if (sectionIndex !== -1) {
        return prev.filter((s) => s.id !== tempId);
      }

      return prev.map((section) => ({
        ...section,
        lessons: section.lessons.filter((l) => l.lesson_id !== tempId),
      }));
    });
  }, []);

  const removeSectionOptimistic = useCallback((sectionId: string) => {
    let removedSection: Section | undefined;
    let sectionIndex = -1;

    setSections((prev) => {
      sectionIndex = prev.findIndex((s) => s.id === sectionId);
      if (sectionIndex === -1) return prev;

      removedSection = prev[sectionIndex];
      return prev.filter((s) => s.id !== sectionId);
    });

    return { section: removedSection!, sectionIndex };
  }, []);

  const removeLessonOptimistic = useCallback(
    (sectionId: string, lessonId: string) => {
      let removedLesson: SectionLesson | undefined;
      let lessonIndex = -1;

      setSections((prev) => {
        return prev.map((section) => {
          if (section.id === sectionId) {
            lessonIndex = section.lessons.findIndex(
              (l) => l.lesson_id === lessonId,
            );
            if (lessonIndex === -1) return section;

            removedLesson = section.lessons[lessonIndex];
            return {
              ...section,
              lessons: section.lessons.filter((l) => l.lesson_id !== lessonId),
            };
          }
          return section;
        });
      });

      return { lesson: removedLesson!, lessonIndex };
    },
    [],
  );

  const restoreSection = useCallback((section: Section, index: number) => {
    setSections((prev) => {
      const newArray = [...prev];
      newArray.splice(index, 0, section);
      return newArray;
    });
  }, []);

  const restoreLesson = useCallback(
    (sectionId: string, lesson: SectionLesson, index: number) => {
      setSections((prev) => {
        return prev.map((section) => {
          if (section.id === sectionId) {
            const newLessons = [...section.lessons];
            newLessons.splice(index, 0, lesson);
            return { ...section, lessons: newLessons };
          }
          return section;
        });
      });
    },
    [],
  );

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
          removeSectionOptimistic,
          removeLessonOptimistic,
          restoreSection,
          restoreLesson,
        }}
      >
        {children}
      </SectionContext.Provider>
    </ConstructorContext.Provider>
  );
}
