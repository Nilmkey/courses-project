"use client";

import { useState } from "react";
import { ConstructorContext } from "@/contexts/ConstructorContext";
import { CourseBlock, Section } from "@/types/types";
import { SectionContext } from "@/contexts/SectionContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [blocks, setBlocks] = useState<CourseBlock[]>([]);
  const [sections, setSection] = useState<Section[]>([
    {
      id: "aloalo",
      title: "aloalo",
      lessons: [
        { lesson_id: "alo", title: "chotam" },
        { lesson_id: "chotam", title: "alo" },
      ],
    },
    {
      id: "chotam",
      title: "chotam",
      lessons: [
        { lesson_id: "alo", title: "chotam" },
        { lesson_id: "chotam", title: "alo" },
        { lesson_id: "aloaloalo", title: "alo" },
        { lesson_id: "chotam", title: "alo" },
      ],
    },
  ]);

  return (
    <ConstructorContext.Provider value={{ blocks, setBlocks }}>
      <SectionContext.Provider value={{ sections, setSection }}>
        {children}
      </SectionContext.Provider>
    </ConstructorContext.Provider>
  );
}
