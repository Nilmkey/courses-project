"use client";

import { useEffect, useState } from "react";
import { ConstructorContext } from "@/contexts/ConstructorContext";
import { CourseBlock, Section, infoLesson } from "@/types/types";
import { SectionContext } from "@/contexts/SectionContext";
import { addErrorObserver } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [blocks, setBlocks] = useState<CourseBlock[]>([]);
  const [lessonInfo, setLessonInfo] = useState<infoLesson>({
    title: "",
    order_index: 777,
    sectionId: "",
  });
  const [sections, setSections] = useState<Section[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Глобальная обработка ошибок
    addErrorObserver((error) => {
      if (error.status === 401) router.push("/login");
      if (error.status >= 500) console.error(error);
    });
  }, [router]);

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
