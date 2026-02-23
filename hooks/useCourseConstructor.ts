"use client";

import { useCallback, useMemo } from "react";
import { Section, SectionLesson } from "@/types/types";

/**
 * Хук для управления состоянием конструктора курса
 * Инкапсулирует всю логику CRUD операций с секциями и уроками
 */
export function useCourseConstructor() {
  // ========== СЕКЦИИ ==========

  const addSection = useCallback(
    (sections: Section[], title: string = "Новая секция"): Section[] => {
      const newSection: Section = {
        id: crypto.randomUUID(),
        title,
        lessons: [],
      };
      return [...sections, newSection];
    },
    []
  );

  const removeSection = useCallback(
    (sections: Section[], sectionId: string): Section[] => {
      return sections.filter((section) => section.id !== sectionId);
    },
    []
  );

  const updateSectionTitle = useCallback(
    (
      sections: Section[],
      sectionId: string,
      title: string
    ): Section[] => {
      return sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      );
    },
    []
  );

  const moveSection = useCallback(
    (
      sections: Section[],
      fromIndex: number,
      toIndex: number
    ): Section[] => {
      const newSections = [...sections];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);
      return newSections;
    },
    []
  );

  // ========== УРОКИ ==========

  const addLesson = useCallback(
    (
      sections: Section[],
      sectionId: string,
      title: string = "Новый урок"
    ): Section[] => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;

        const newLesson: SectionLesson = {
          lesson_id: crypto.randomUUID(),
          title,
        };
        return {
          ...section,
          lessons: [...section.lessons, newLesson],
        };
      });
    },
    []
  );

  const removeLesson = useCallback(
    (
      sections: Section[],
      sectionId: string,
      lessonId: string
    ): Section[] => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          lessons: section.lessons.filter(
            (lesson) => lesson.lesson_id !== lessonId
          ),
        };
      });
    },
    []
  );

  const updateLessonTitle = useCallback(
    (
      sections: Section[],
      sectionId: string,
      lessonId: string,
      newTitle: string
    ): Section[] => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          lessons: section.lessons.map((lesson) =>
            lesson.lesson_id === lessonId
              ? { ...lesson, title: newTitle }
              : lesson
          ),
        };
      });
    },
    []
  );

  const moveLesson = useCallback(
    (
      sections: Section[],
      sectionId: string,
      fromIndex: number,
      toIndex: number
    ): Section[] => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;

        const newLessons = [...section.lessons];
        const [removed] = newLessons.splice(fromIndex, 1);
        newLessons.splice(toIndex, 0, removed);
        return {
          ...section,
          lessons: newLessons,
        };
      });
    },
    []
  );

  const updateSectionLessons = useCallback(
    (
      sections: Section[],
      sectionId: string,
      lessons: SectionLesson[]
    ): Section[] => {
      return sections.map((section) =>
        section.id === sectionId ? { ...section, lessons } : section
      );
    },
    []
  );

  // ========== УТИЛИТЫ ==========

  const getSectionByIndex = useCallback(
    (sections: Section[], index: number): Section | undefined => {
      return sections[index];
    },
    []
  );

  const getLessonByIndex = useCallback(
    (
      sections: Section[],
      sectionId: string,
      index: number
    ): SectionLesson | undefined => {
      const section = sections.find((s) => s.id === sectionId);
      return section?.lessons[index];
    },
    []
  );

  return useMemo(
    () => ({
      // Секции
      addSection,
      removeSection,
      updateSectionTitle,
      moveSection,
      // Уроки
      addLesson,
      removeLesson,
      updateLessonTitle,
      moveLesson,
      updateSectionLessons,
      // Утилиты
      getSectionByIndex,
      getLessonByIndex,
    }),
    [
      addSection,
      removeSection,
      updateSectionTitle,
      moveSection,
      addLesson,
      removeLesson,
      updateLessonTitle,
      moveLesson,
      updateSectionLessons,
      getSectionByIndex,
      getLessonByIndex,
    ]
  );
}
