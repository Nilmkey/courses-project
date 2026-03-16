import { useContext } from "react";
import { LearningContext } from "@/contexts/LearningContext";

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error(
      "useLearning must be used within a LearningContext.Provider"
    );
  }
  return context;
}
