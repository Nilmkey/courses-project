import { useContext } from "react";
import { SectionContext } from "@/frontend/contexts/SectionContext";

export function useSection() {
  const context = useContext(SectionContext);
  if (context === undefined)
    throw new Error(
      "you need the SectionContext.Provider for use useSection!!!",
    );

  return context;
}
