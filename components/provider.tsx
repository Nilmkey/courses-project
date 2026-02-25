"use client";

import { useState } from "react";
import { ConstructorContext } from "@/contexts/ConstructorContext";
import { CourseBlock, Section, infoLesson } from "@/types/types";
import { SectionContext } from "@/contexts/SectionContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [blocks, setBlocks] = useState<CourseBlock[]>([]);
  const [lessonInfo, setLessonInfo] = useState<infoLesson>({
    title: "",
    isDraft: true,
    order_index: 0,
  });
  const [sections, setSections] = useState<Section[]>([]);

  return (
    <ConstructorContext.Provider
      value={{ blocks, setBlocks, lessonInfo, setLessonInfo }}
    >
      <SectionContext.Provider value={{ sections, setSections }}>
        {children}
      </SectionContext.Provider>
    </ConstructorContext.Provider>
  );
}
