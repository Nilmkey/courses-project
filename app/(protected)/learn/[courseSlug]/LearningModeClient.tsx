"use client";

import { useState } from "react";
import { LearningContextProvider } from "@/contexts/LearningContext";
import { CourseSidebar } from "./sidebar/CourseSidebar";
import { BlockContentRenderer } from "./content/BlockContentRenderer";
import { NavigationHeader } from "@/components/learning/NavigationHeader";
import { MobileSidebar } from "./MobileSidebar";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <LearningContextProvider
      course={course}
      sections={sections}
      initialProgress={initialProgress}
    >
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        {/* Левая колонка — навигация (скрыта на мобильных) */}
        <aside className="hidden md:block w-80 border-r bg-white dark:bg-slate-900 dark:border-slate-700 overflow-y-auto flex-shrink-0">
          <CourseSidebar />
        </aside>

        {/* Мобильная боковая панель (выезжающая) */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Правая часть — контент */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <NavigationHeader 
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />

          {/* Контент блока */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <BlockContentRenderer />
          </div>
        </main>
      </div>
    </LearningContextProvider>
  );
}
