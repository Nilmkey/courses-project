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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { coursesApi } from "@/lib/api/entities/api-courses";
import { Toaster } from "react-hot-toast";
import { useToast } from "@/hooks/useToast";
import { handleCreate } from "./newCourse";

interface AdminCourse {
  _id: string;
  title: string;
  slug: string;
  level: string;
  isPublished: boolean;
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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
            color: resolvedTheme === "dark" ? "#f1f5f9" : "#0f172a",
            border:
              resolvedTheme === "dark"
                ? "1px solid #1e293b"
                : "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          },
        }}
      />

      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
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
            <Link href="/admin/tags">
              <Button
                variant="outline"
                className="font-bold border-[#3b5bdb] text-[#3b5bdb] hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                <Tags className="w-4 h-4 mr-2" /> Теги
              </Button>
            </Link>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={handleCreate}
            >
              <Plus className="w-4 h-4 mr-1" /> Создать
            </Button>
          </div>
        </div>
      </header>

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
              courses.map((course) => (
                <Card
                  key={course._id}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg--to-linear-br from-blue-500 to-indigo-600 flex items-center justify-center">
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
                      <Link href={`/editor/course/${course._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Редактировать
                        </Button>
                      </Link>
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
