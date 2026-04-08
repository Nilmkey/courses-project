"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLearning } from "@/hooks/useLearning";
import { SectionItem } from "./sidebar/SectionItem";
import { BookOpen, X, Sun, Moon, Trophy, Menu } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { course, sections, overallProgress } = useLearning();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#3b5bdb]/10 dark:to-[#5c7cfa]/10 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => router.push("/courses")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Назад к курсам"
              >
                <Menu size={16} />
                <span className="font-medium">Курс</span>
              </button>

              <div className="flex items-center gap-2">
                {mounted && (
                  <button
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Переключить тему"
                  >
                    {resolvedTheme === "dark" ? (
                      <Sun className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <Moon className="h-4 w-4 text-slate-600" />
                    )}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Закрыть"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-[#3b5bdb]" />
              <span className="text-xs font-bold text-[#3b5bdb] uppercase tracking-wider">
                Курс
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
              {course.title}
            </h2>
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className={`w-4 h-4 ${
                  overallProgress.progress === 100
                    ? "text-yellow-500"
                    : "text-emerald-600"
                }`} />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Ваш прогресс
                </span>
              </div>
              <span className={`text-lg font-black ${
                overallProgress.progress === 100
                  ? "text-yellow-600"
                  : "text-emerald-600"
              }`}>
                {overallProgress.progress}%
              </span>
            </div>

            <div className="relative h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                  overallProgress.progress === 100
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    : "bg-gradient-to-r from-emerald-500 to-green-500"
                }`}
                style={{ width: `${overallProgress.progress}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {overallProgress.completedLessons}
                </span>{" "}
                из{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {overallProgress.totalLessons}
                </span>{" "}
                уроков
              </span>
              {overallProgress.progress === 100 && (
                <span className="text-xs font-bold text-yellow-600 animate-pulse">
                  🎉 Курс завершён!
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y dark:divide-slate-700">
            {sections.map((section) => (
              <SectionItem key={section._id} section={section} />
            ))}
          </div>

          <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">{sections.length}</span> секций •{" "}
              <span className="font-semibold">
                {sections.reduce((acc, s) => acc + s.lessons.length, 0)}
              </span>{" "}
              уроков
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
