"use client";

import { ResultContext } from "@/contexts/ResultContext";
import { useState } from "react";
import { ConstructorContext } from "@/contexts/ConstructorContext";
import { CourseBlock } from "@/types/types";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState("");
  const [blocks, setBlocks] = useState<CourseBlock[]>([]);

  return (
    <ResultContext.Provider
      value={{
        result,
        setResult,
      }}
    >
      <ConstructorContext.Provider value={{ blocks, setBlocks }}>
        {children}
      </ConstructorContext.Provider>
    </ResultContext.Provider>
  );
}
