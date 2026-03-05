import { createContext } from "react";
import { Section } from "@/types/types";

interface PendingOperation {
  id: string;
  type: 'create_section' | 'create_lesson' | 'delete_section' | 'delete_lesson';
  timestamp: number;
}

interface SectionContextType {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  // Optimistic UI методы
  addSectionOptimistic: (courseId: string) => string;
  addLessonOptimistic: (sectionId: string) => string;
  confirmOperation: (tempId: string, realId: string) => void;
  rollbackOperation: (tempId: string) => void;
}

export const SectionContext = createContext<SectionContextType | undefined>(
  undefined,
);
