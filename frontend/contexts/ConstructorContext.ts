import { createContext } from "react";
import { CourseBlock, infoLesson } from "@/types/types";

interface ConstructorContextType {
  blocks: CourseBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<CourseBlock[]>>;
  lessonInfo: infoLesson;
  setLessonInfo: React.Dispatch<React.SetStateAction<infoLesson>>;
}

export const ConstructorContext = createContext<
  ConstructorContextType | undefined
>(undefined);
