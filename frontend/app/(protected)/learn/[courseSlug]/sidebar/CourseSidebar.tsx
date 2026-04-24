"use client";

import { useMounted } from "@/frontend/hooks/useMounted";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLearning } from "@/frontend/hooks/useLearning";
import { SectionItem } from "./SectionItem";
import { StreakFire } from "@/components/StreakFire";
import { BookOpen, ArrowLeft, Sun, Moon, Trophy } from "lucide-react";

export function CourseSidebar() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const { course, sections, overallProgress } = useLearning();

  return (
    <div className="h-full flex flex-col pt-4 sm:pt-6 pb-3 sm:pb-4">
      {/* Header Info */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
            title="Назад к курсам"
          >
            <ArrowLeft size={16} />
          </button>

          {mounted && (
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all shadow-inner"
              title="Переключить тему"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen size={14} />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Учебный План
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white line-clamp-2 tracking-tight">
          {course.title}
        </h2>
      </div>

      {/* Progress Box */}
      <div className="px-4 sm:px-6 py-3 sm:py-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy
              className={`w-5 h-5 ${
                overallProgress.progress === 100
                  ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Ваш прогресс
            </span>
          </div>
          <span
            className={`text-xl font-black tracking-tight ${
              overallProgress.progress === 100
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-indigo-600 dark:text-indigo-400"
            }`}
          >
            {overallProgress.progress}%
          </span>
        </div>

        <div className="relative h-3 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.2)] ${
              overallProgress.progress === 100
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                : "bg-gradient-to-r from-indigo-500 to-blue-600"
            }`}
            style={{ width: `${overallProgress.progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>
            <span className="font-bold text-slate-900 dark:text-white">
              {overallProgress.completedLessons}
            </span>{" "}
            из{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {overallProgress.totalLessons}
            </span>{" "}
            уроков
          </span>
          {overallProgress.progress === 100 && (
            <span className="text-xs font-black text-yellow-600 dark:text-yellow-400 animate-pulse uppercase tracking-widest">
              Курс пройден!
            </span>
          )}
        </div>
      </div>

      {/* Sections Box */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
        {sections.map((section) => (
          <div
            key={section._id}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-indigo-100 dark:hover:border-indigo-900/50"
          >
            <SectionItem section={section} />
          </div>
        ))}
      </div>

      <div className="px-6 pt-4 mt-auto border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>{sections.length} секций</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>
            {sections.reduce((acc, s) => acc + s.lessons.length, 0)} уроков
          </span>
        </div>
      </div>
    </div>
  );
}
