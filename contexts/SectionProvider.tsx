"use client";

import { useState, useCallback, useMemo } from "react";
import { SectionContext } from "@/contexts/SectionContext";
import { Section, SectionLesson } from "@/types/types";

interface SectionProviderProps {
  children: React.ReactNode;
  initialSections?: Section[];
}

export function SectionProvider({
  children,
  initialSections = [],
}: SectionProviderProps) {
  const [sections, setSections] = useState<Section[]>(initialSections);

  // Операции с секциями
  const addSection = useCallback((title: string = "Новая секция") => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title,
      lessons: [],
    };
    setSections((prev) => [...prev, newSection]);
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
  }, []);

  const updateSectionTitle = useCallback((id: string, title: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, title } : section
      )
    );
  }, []);

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);
      return newSections;
    });
  }, []);

  // Операции с уроками
  const addLesson = useCallback((sectionId: string, lessonTitle: string = "Новый урок") => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                { lesson_id: crypto.randomUUID(), title: lessonTitle },
              ],
            }
          : section
      )
    );
  }, []);

  const linkLesson = useCallback((sectionId: string, lessonId: string, lessonTitle: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                { lesson_id: lessonId, title: lessonTitle },
              ],
            }
          : section
      )
    );
  }, []);

  const removeLesson = useCallback((sectionId: string, lessonId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.filter(
                (lesson) => lesson.lesson_id !== lessonId
              ),
            }
          : section
      )
    );
  }, []);

  const updateLessonTitle = useCallback((sectionId: string, lessonId: string, newTitle: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.lesson_id === lessonId
                  ? { ...lesson, title: newTitle }
                  : lesson
              ),
            }
          : section
      )
    );
  }, []);

  const updateSectionLessons = useCallback((sectionId: string, lessons: SectionLesson[]) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, lessons } : section
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      sections,
      setSections,
      addSection,
      removeSection,
      updateSectionTitle,
      moveSection,
      addLesson,
      linkLesson,
      removeLesson,
      updateLessonTitle,
      updateSectionLessons,
    }),
    [
      sections,
      addSection,
      removeSection,
      updateSectionTitle,
      moveSection,
      addLesson,
      linkLesson,
      removeLesson,
      updateLessonTitle,
      updateSectionLessons,
    ]
  );

  return (
    <SectionContext.Provider value={value}>
      {children}
    </SectionContext.Provider>
  );
}
