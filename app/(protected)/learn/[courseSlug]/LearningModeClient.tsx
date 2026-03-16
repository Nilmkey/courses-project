"use client";

import { LearningContextProvider } from "@/contexts/LearningContext";
import { CourseSidebar } from "./sidebar/CourseSidebar";
import { BlockContentRenderer } from "./content/BlockContentRenderer";
import { ProgressBar } from "@/components/learning/ProgressBar";
import { NavigationHeader } from "@/components/learning/NavigationHeader";
import type { ICourse, ISection } from "@/types/types";

interface LearningModeClientProps {
  course: ICourse;
  sections: ISection[];
  initialProgress: {
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
}

export default function LearningModeClient({
  course,
  sections,
  initialProgress,
}: LearningModeClientProps) {
  return (
    <LearningContextProvider
      course={course}
      sections={sections}
      initialProgress={initialProgress}
    >
      <div className="flex h-screen bg-gray-50">
        {/* Левая колонка — навигация */}
        <aside className="w-80 border-r bg-white overflow-y-auto flex-shrink-0">
          <CourseSidebar />
        </aside>

        {/* Правая часть — контент */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header с навигацией и прогрессом */}
          <NavigationHeader />

          {/* Контент блока */}
          <div className="flex-1 overflow-y-auto p-8">
            <BlockContentRenderer />
          </div>
        </main>
      </div>
    </LearningContextProvider>
  );
}
