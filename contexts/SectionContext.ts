import { createContext } from "react";
import { Section } from "@/types/types";

interface SectionContextType {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
}

export const SectionContext = createContext<SectionContextType | undefined>(
  undefined,
);
