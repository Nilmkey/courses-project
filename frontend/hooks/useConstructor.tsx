import { useContext } from "react";
import { ConstructorContext } from "@/contexts/ConstructorContext";

export function useConstructor() {
  const context = useContext(ConstructorContext);
  if (context === undefined)
    throw new Error(
      "you need the ConstructorContext.Provider for use useContext!!!",
    );

  return context;
}
