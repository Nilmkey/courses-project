"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLearning } from "@/hooks/useLearning";
import { SectionItem } from "./SectionItem";
import { StreakFire } from "@/components/StreakFire";
import { BookOpen, ArrowLeft, Sun, Moon } from "lucide-react";

export function CourseSidebar() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { course, sections } = useLearning();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок курса с кнопкой назад и переключателем темы */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-gray-700">
        {/* Верхняя строка: кнопка назад и переключатель темы */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Назад к курсам"
          >
            <ArrowLeft size={16} />
            <span className="font-medium">Назад</span>
          </button>
          
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Переключить тему"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
        </div>
        
        {/* Название курса */}
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Курс
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
          {course.title}
        </h2>
      </div>

      {/* Список секций */}
      <div className="flex-1 overflow-y-auto divide-y dark:divide-gray-700">
        {sections.map((section) => (
          <SectionItem key={section._id} section={section} />
        ))}
      </div>

      {/* Статистика */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
        {/* Стрик */}
        <div className="mb-3">
          <StreakFire size="sm" showCount={true} />
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold">{sections.length}</span> секций •{" "}
          <span className="font-semibold">
            {sections.reduce((acc, s) => acc + s.lessons.length, 0)}
          </span>{" "}
          уроков
        </div>
      </div>
    </div>
  );
}
