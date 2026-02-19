import { createContext } from "react";
import { Section, SectionLesson } from "@/types/types";

interface SectionContextType {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  
  // Операции с секциями
  addSection: (title?: string) => void;
  removeSection: (id: string) => void;
  updateSectionTitle: (id: string, title: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  
  // Операции с уроками
  addLesson: (sectionId: string, lessonTitle?: string) => void;
  linkLesson: (sectionId: string, lessonId: string, lessonTitle: string) => void;
  removeLesson: (sectionId: string, lessonId: string) => void;
  updateLessonTitle: (sectionId: string, lessonId: string, newTitle: string) => void;
  updateSectionLessons: (sectionId: string, lessons: SectionLesson[]) => void;
}

export const SectionContext = createContext<SectionContextType | undefined>(
  undefined,
);
