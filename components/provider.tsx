"use client";

import { useState } from "react";
import { ConstructorContext } from "@/contexts/ConstructorContext";
import { CourseBlock, Section } from "@/types/types";
import { SectionContext } from "@/contexts/SectionContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [blocks, setBlocks] = useState<CourseBlock[]>([]);
  const [sections, setSections] = useState<Section[]>([
    {
      id: "section-1",
      title: "Введение",
      lessons: [
        { lesson_id: "lesson-1", title: "Приветствие" },
        { lesson_id: "lesson-2", title: "Описание курса" },
      ],
    },
    {
      id: "section-2",
      title: "Основы",
      lessons: [
        { lesson_id: "lesson-3", title: "Базовые концепции" },
        { lesson_id: "lesson-4", title: "Практика" },
      ],
    },
  ]);

  return (
    <ConstructorContext.Provider value={{ blocks, setBlocks }}>
      <SectionContext.Provider value={{ sections, setSections }}>
        {children}
      </SectionContext.Provider>
    </ConstructorContext.Provider>
  );
}
