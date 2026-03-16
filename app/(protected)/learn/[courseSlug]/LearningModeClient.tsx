"use client";

import { LearningContextProvider } from "@/contexts/LearningContext";
import { CourseSidebar } from "./sidebar/CourseSidebar";
import { BlockContentRenderer } from "./content/BlockContentRenderer";
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
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Левая колонка — навигация */}
        <aside className="w-80 border-r bg-white dark:bg-gray-800 dark:border-gray-700 overflow-y-auto flex-shrink-0">
          <CourseSidebar />
        </aside>

        {/* Правая часть — контент */}
        <main className="flex-1 flex flex-col overflow-hidden">
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
