import { useContext } from "react";
import { ZoomContext } from "@/contexts/ZoomContext";

export function useZoom() {
  const context = useContext(ZoomContext);
  if (context === undefined)
    throw new Error("you need the ZoomContext.Provider for use useZoom!!!");

  return context;
}
