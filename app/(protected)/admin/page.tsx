"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Code,
  ChevronRight,
  Layout,
  Server,
  Globe,
  Laptop,
  Users,
  Zap,
  User,
  Sun,
  Moon,
  Loader2,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseApi } from "@/lib/api-service"; // Используем твой сервис

// Маппинг иконок (чтобы строка из БД превратилась в иконку)
const iconMap: Record<string, React.ElementType> = {
  Layout,
  Server,
  Globe,
  Laptop,
  Zap,
  Code,
};

export default function CoursesPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Вызываем твой метод, который уже настроен в админке
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (err) {
      console.error("Ошибка при получении курсов:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const filteredCourses =
    filter === "all" ? courses : courses.filter((c: any) => c.type === filter);

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      {/* --- Навигация --- */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <div className="w-10 h-10 bg-[#3b5bdb] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase dark:text-white">
              CodeLearn
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <Link href="/courses" className="text-[#3b5bdb]">
              Курсы
            </Link>
            <a href="#" className="hover:text-[#3b5bdb] transition-colors">
              Практика
            </a>
            <a href="#" className="hover:text-[#3b5bdb] transition-colors">
              Сообщество
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="text-yellow-400" size={20} />
              ) : (
                <Moon className="text-slate-600" size={20} />
              )}
            </Button>

            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center hover:ring-2 ring-[#3b5bdb] transition-all">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Основной контент --- */}
      <main className="py-16 px-4 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight dark:text-white">
          Выбери свой путь в <span className="text-[#3b5bdb]">IT</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto mb-10">
          Актуальные программы обучения, подгруженные из твоей MongoDB.
        </p>

        {/* Фильтры */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["all", "career", "language"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                filter === t
                  ? "bg-[#3b5bdb] text-white shadow-lg shadow-blue-500/20 scale-105"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-[#3b5bdb]"
              }`}
            >
              {t === "all"
                ? "Все курсы"
                : t === "career"
                  ? "Профессии"
                  : "Языки"}
            </button>
          ))}
        </div>

        {/* Сетка курсов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {loading ? (
            // Загрузка
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-[2.5rem] bg-white dark:bg-slate-900 border dark:border-slate-800 animate-pulse flex items-center justify-center"
                >
                  <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                </div>
              ))
          ) : filteredCourses.length === 0 ? (
            // Если курсов нет
            <div className="col-span-full py-20 flex flex-col items-center gap-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed dark:border-slate-800">
              <Database className="w-12 h-12 text-slate-300" />
              <p className="text-slate-500 font-bold">
                В базе данных пока пусто...
              </p>
            </div>
          ) : (
            // Вывод курсов
            filteredCourses.map((course: any) => {
              const IconComponent = iconMap[course.iconName] || Code;
              return (
                <div
                  key={course._id}
                  className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="mb-6 flex justify-between items-center">
                    <span className="px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest bg-blue-50 dark:bg-blue-500/10 text-[#3b5bdb] dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                      {course.difficulty}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.gradient || "from-blue-500 to-indigo-600"} flex items-center justify-center text-white shadow-lg`}
                    >
                      <IconComponent size={28} />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 leading-tight group-hover:text-[#3b5bdb] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 font-medium text-sm leading-relaxed mb-6">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {course.target}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                          Набор открыт
                        </span>
                      </div>

                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex items-center gap-1 font-bold text-sm text-[#3b5bdb] dark:text-blue-400 hover:gap-2 transition-all"
                      >
                        Подробнее <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
