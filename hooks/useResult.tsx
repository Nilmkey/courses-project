import { useContext } from "react";
import { ResultContext } from "@/contexts/ResultContext";

export function useResult() {
  const context = useContext(ResultContext);
  if (context === undefined)
    throw new Error("you need the ResultContext.Provider for use UseResult!!!");

  return context;
}
