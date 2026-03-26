"use client";

import { useState } from "react";
import { LearningContextProvider } from "@/contexts/LearningContext";
import { CourseSidebar } from "./sidebar/CourseSidebar";
import { BlockContentRenderer } from "./content/BlockContentRenderer";
import { NavigationHeader } from "@/components/learning/NavigationHeader";
import { MobileSidebar } from "./MobileSidebar";
import { useCourseData } from "@/hooks/useCourseData";
import type { ICourse, ISection } from "@/types/types";

interface LearningModeClientProps {
  courseSlug: string;
}

function LoadingSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 animate-pulse">
      {/* Sidebar скелетон */}
      <aside className="hidden md:block w-80 border-r bg-white dark:bg-slate-900 dark:border-slate-700 flex-shrink-0">
        <div className="p-4 space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </aside>

      {/* Контент скелетон */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b bg-white dark:bg-slate-900 dark:border-slate-700" />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </main>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Ошибка загрузки курса
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

export default function LearningModeClient({ courseSlug }: LearningModeClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { course, sections, progress, isLoading, error } = useCourseData({
    courseSlug,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !course) {
    return (
      <ErrorState
        error={error || "Курс не найден"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <LearningContextProvider
      course={course}
      sections={sections}
      initialProgress={progress}
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
