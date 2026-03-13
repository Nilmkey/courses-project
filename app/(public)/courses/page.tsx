"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Code, ChevronRight, User, Sun, Moon, Loader2 } from "lucide-react";
import { coursesApi } from "@/lib/api/entities/api-courses";
import { CourseApiResponse, CourseLevel } from "@/types/types";

const iconMap: Record<string, React.ReactNode> = {
  Layout: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
  Server: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><path d="M6 6h.01" /><path d="M6 18h.01" /></svg>,
  Globe: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  Laptop: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M2 21h20" /><path d="M12 17v4" /></svg>,
  Zap: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Code: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
};

const getLevelLabel = (level: CourseLevel) => {
  switch (level) {
    case "beginner":
      return "Начальный";
    case "intermediate":
      return "Средний";
    case "advanced":
      return "Продвинутый";
    default:
      return level;
  }
};

const getLevelStyles = (level: CourseLevel) => {
  switch (level) {
    case "beginner":
      return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30";
    case "intermediate":
      return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900/30";
    case "advanced":
      return "bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-900/30";
    default:
      return "bg-slate-50 dark:bg-slate-900/20 text-slate-600 border-slate-100 dark:border-slate-900/30";
  }
};

const CoursesPage = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "career" | "language">("all");
  const [courses, setCourses] = useState<CourseApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getAll();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Ошибка загрузки курсов:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const filteredCourses =
    filter === "all" ? courses : courses.filter((c) => c.type === filter);

  // Фильтруем только опубликованные курсы для публичной страницы
  const publishedCourses = filteredCourses.filter((c) => c.isPublished);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
              <Code className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase dark:text-white">
              CodeLearn
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <Link href="/courses" className="text-blue-600">
              Курсы
            </Link>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Практика
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Сообщество
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}
            </button>

            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex-grow py-16 px-4 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Выбери свой путь в <span className="text-blue-600">IT</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto mb-10">
          Актуальные программы обучения из нашей базы данных. Начни учиться
          сегодня.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { value: "all", label: "Все курсы" },
            { value: "career", label: "Профессии" },
            { value: "language", label: "Языки" },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value as typeof filter)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                filter === t.value
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none scale-105"
                  : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {loading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-pulse flex items-center justify-center"
                >
                  <Loader2 className="animate-spin text-slate-300" />
                </div>
              ))
            : publishedCourses.map((course) => {
                return (
                  <div
                    key={course._id}
                    className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-8 flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/20 overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (course.slug) {
                        window.location.href = `/courses/${course.slug}`;
                      }
                    }}
                  >
                  <div className="mb-6 flex justify-between items-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest border ${getLevelStyles(course.level)}`}
                    >
                      {getLevelLabel(course.level)}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 dark:shadow-none group-hover:rotate-12 transition-transform duration-500`}
                    >
                      {iconMap[course.iconName || "Code"] || iconMap.Code}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-slate-400 dark:text-slate-500 font-medium text-sm leading-relaxed mb-6">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full animate-pulse ${course.isOpenForEnrollment ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        <span
                          className={`text-[11px] font-black uppercase tracking-tighter ${course.isOpenForEnrollment ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {course.isOpenForEnrollment
                            ? "Набор открыт"
                            : "Набор закрыт"}
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-1 font-bold text-sm transition-all ${
                          course.isOpenForEnrollment
                            ? "text-blue-600 group-hover:gap-3"
                            : "text-slate-300"
                        }`}
                      >
                        {course.isOpenForEnrollment
                          ? "Подробнее"
                          : "Ждем старта"}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`absolute -right-12 -bottom-12 w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 opacity-[0.03] rounded-full blur-2xl group-hover:scale-[3] transition-transform duration-700`}
                  />
                </div>
              );
            })}
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              CodeLearn
            </span>
          </div>
          <p>© {new Date().getFullYear()} CodeLearn. Все права защищены.</p>
          <div className="flex gap-6 text-slate-400 font-bold text-sm">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Политика
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Условия
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoursesPage;
