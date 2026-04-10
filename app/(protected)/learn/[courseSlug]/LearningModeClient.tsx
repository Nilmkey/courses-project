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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <aside className="hidden md:block w-80 bg-white/70 dark:bg-slate-900/70 border-r border-slate-200/50 dark:border-slate-800/50 flex-shrink-0 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none animate-pulse z-20 relative">
        <div className="p-6 space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
          <div className="space-y-4">
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-[-20%] left-[20%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10 pointer-events-none" />
        <div className="h-20 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl" />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col items-center max-w-4xl mx-auto w-full mt-8">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/2 self-start" />
          <div className="h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]" />
          <div className="space-y-3 w-full">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-4/5" />
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[10%] w-[40rem] h-[40rem] bg-red-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="text-center p-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-red-500/10 max-w-md w-full mx-4">
        <h2 className="text-3xl font-black text-rose-600 dark:text-rose-400 mb-4 tracking-tight">
          Упс, ошибка!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">{error}</p>
        <button
          onClick={onRetry}
          className="w-full px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-rose-500/30 active:scale-95"
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
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans relative overflow-hidden">
        {/* Subtle Background Glow for main content */}
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10 absolute pointer-events-none" />

        <aside className="hidden md:block w-80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-r border-slate-200/50 dark:border-slate-800/50 flex-shrink-0 z-20 shadow-xl shadow-indigo-900/5 dark:shadow-none transition-all">
          <CourseSidebar />
        </aside>

        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          <NavigationHeader
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth will-change-scroll">
            <div className="max-w-4xl mx-auto w-full">
              <BlockContentRenderer />
            </div>
          </div>
        </main>
      </div>
    </LearningContextProvider>
  );
}
