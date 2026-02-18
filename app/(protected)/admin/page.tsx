"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Code,
  Plus,
  Trash2,
  Edit,
  LayoutDashboard,
  BookOpen,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { courseApi } from "@/lib/api-service";

// Добавляем интерфейс для типизации курса
interface AdminCourse {
  _id: string;
  title: string;
  slug: string;
  gradient?: string;
}

export default function AdminDashboard() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Заменяем any на AdminCourse[]
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseApi.getAll();
      setCourses(data || []);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (confirm("Удалить этот курс навсегда?")) {
      try {
        await courseApi.delete(id);
        // Используем типизированный стейт без any
        setCourses(courses.filter((c) => c._id !== id));
      } catch {
        // Убрали неиспользуемую переменную err
        alert("Ошибка при удалении");
      }
    }
  };

  if (!mounted) return null;

  return (
    /* Добавляем flex и min-h-screen для управления высотой */
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* --- Хедер --- */}
      {/* --- Хедер --- */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {/* Логотип теперь обернут в Link и работает как кнопка "На главную" */}
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                CodeLearn <span className="text-blue-600">Admin</span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="rounded-full"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="text-yellow-400" size={20} />
              ) : (
                <Moon className="text-slate-600" size={20} />
              )}
            </Button>
            <Link href="/admin/courses/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                <Plus className="w-4 h-4 mr-1" /> Создать
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- Основной контент (flex-1 заставляет этот блок занимать все свободное место) --- */}
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Управление курсами
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Всего программ обучения: {courses.length}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.length === 0 ? (
              <Card className="border-dashed border-2 py-20 text-center">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Курсов пока нет.</p>
                </CardContent>
              </Card>
            ) : (
              // Убрали any из map
              courses.map((course) => (
                <Card
                  key={course._id}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.gradient || "from-slate-100 to-slate-200"} flex items-center justify-center`}
                    >
                      <Code className="w-8 h-8 text-white/80" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-black dark:text-white">
                        {course.title}
                      </h3>
                      <p className="text-xs font-mono text-blue-500 tracking-tight">
                        /{course.slug}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="font-bold">
                        <Edit className="w-4 h-4 mr-2" /> Редактировать
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCourse(course._id)}
                        className="text-rose-500 hover:bg-rose-500 hover:text-white font-bold transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* --- Футер (теперь всегда внизу) --- */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} CodeLearn Admin Dashboard</p>
          <div className="flex gap-4 normal-case tracking-normal">
            <span className="text-blue-600 font-black">v2.0.4</span>
            <span>CMS для обучения</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
