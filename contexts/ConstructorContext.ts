import { createContext } from "react";
import { CourseBlock } from "@/types/types";

interface ConstructorContextType {
  blocks: CourseBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<CourseBlock[]>>;
}

export const ConstructorContext = createContext<
  ConstructorContextType | undefined
>(undefined);
