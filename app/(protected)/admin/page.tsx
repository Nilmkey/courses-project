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
  Tags,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { coursesApi } from "@/lib/api/entities/api-courses";
import { useToast } from "@/hooks/useToast";
import { handleCreate } from "./newCourse";

interface AdminCourse {
  _id: string;
  title: string;
  slug: string;
  level: string;
  isPublished: boolean;
  isOpenForEnrollment: boolean;
  price: number;
}

export default function AdminDashboard() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesApi.getAll();
      setCourses(response.courses || []);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      toast.error("Не удалось загрузить курсы. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    toast.confirm("Удалить этот курс навсегда?", async () => {
      try {
        await coursesApi.delete(id);
        setCourses(courses.filter((c) => c._id !== id));
        toast.success("Курс успешно удалён.");
      } catch {
        toast.error("Ошибка при удалении.");
      }
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[10%] w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />

      <header className="border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-indigo-500/30">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                CodeLearn <span className="text-indigo-600 dark:text-indigo-400 font-medium">Admin</span>
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
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-inner"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="text-yellow-400" size={20} />
              ) : (
                <Moon className="text-slate-600" size={20} />
              )}
            </Button>
            <Link href="/admin/users">
              <Button
                variant="outline"
                className="font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl"
              >
                <Users className="w-4 h-4 mr-2" /> Пользователи
              </Button>
            </Link>
            <Link href="/admin/tags">
              <Button
                variant="outline"
                className="font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl"
              >
                <Tags className="w-4 h-4 mr-2" /> Теги
              </Button>
            </Link>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
              onClick={handleCreate}
            >
              <Plus className="w-4 h-4 mr-1" /> Создать курс
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl shadow-inner">
              <LayoutDashboard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Управление курсами
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Всего программ обучения: <span className="font-bold text-indigo-600 dark:text-indigo-400">{courses.length}</span>
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <span className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-sm">Загрузка данных...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {courses.length === 0 ? (
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-dashed border-2 border-slate-300 dark:border-slate-700 py-24 text-center rounded-[2.5rem]">
                <CardContent className="flex flex-col items-center">
                  <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-6" />
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Курсов пока нет. Создайте первый!</p>
                </CardContent>
              </Card>
            ) : (
              courses.map((course) => (
                <Card
                  key={course._id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                >
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6 relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                     
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                      <Code className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-center sm:text-left z-10">
                      <Link href={`/learn/${course.slug}`}>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer mb-2">
                          {course.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold font-mono">
                          /{course.slug}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${course.isPublished ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                      </div>
                    </div>
                    <div className="flex gap-3 z-10">
                      <Link href={`/editor/course/${course._id}`}>
                        <Button
                          variant="outline"
                          className="font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 hover:text-indigo-600 rounded-xl"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Редактировать
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => deleteCourse(course._id)}
                        className="text-rose-500 hover:bg-rose-500 hover:text-white font-bold transition-all rounded-xl shadow-inner bg-rose-50 dark:bg-rose-500/10"
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

      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl py-6 transition-colors z-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} CodeLearn Admin Dashboard</p>
          <div className="flex gap-4 normal-case tracking-normal">
            <span className="text-indigo-600 dark:text-indigo-400 font-black">v2.0.4</span>
            <span>CMS для обучения</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
