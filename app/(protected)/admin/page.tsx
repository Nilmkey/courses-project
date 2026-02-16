"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code,
  Plus,
  Trash2,
  Edit,
  Home,
  LayoutDashboard,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { courseApi } from "@/lib/api-service"; // Твой сервис запросов

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (confirm("Удалить этот курс навсегда?")) {
      await courseApi.delete(id);
      loadCourses();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Хедер Админки */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Code className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">
                CodeLearn{" "}
                <span className="text-gray-400 font-light">Admin</span>
              </h1>
            </div>

            {/* Кнопка возврата на главную */}
            <Link href="/">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-blue-600 flex gap-2"
              >
                <Home className="w-4 h-4" /> На главную
              </Button>
            </Link>
          </div>

          <Link href="/admin/courses/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">
              <Plus className="w-4 h-4 mr-2" /> Создать курс
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            Управление контентом
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.length === 0 ? (
              <Card className="border-dashed border-2 py-20 text-center">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Курсов пока нет. Создайте свой первый шедевр!
                  </p>
                </CardContent>
              </Card>
            ) : (
              courses.map((course: any) => (
                <Card
                  key={course._id}
                  className="border-2 border-blue-100 hover:border-blue-300 transition-all overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center p-4 gap-4">
                      {/* Thumbnail Placeholder */}
                      <div className="w-24 h-16 bg-blue-100 rounded-md flex items-center justify-center">
                        <Code className="w-8 h-8 text-blue-400" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          slug: /courses/{course.slug}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Изменить
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteCourse(course._id)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none shadow-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Футер такой же как на главной */}
      <footer className="bg-gray-50 border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} CodeLearn Admin Panel</p>
        </div>
      </footer>
    </div>
  );
}
