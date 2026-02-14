"use client";
import { useEffect, useState } from "react";
import { courseApi } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await courseApi.getAll();
    setCourses(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Точно удаляем?")) {
      await courseApi.delete(id);
      loadCourses(); // Обновляем список
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление курсами</h1>
        <Link href="/admin/courses/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Добавить курс
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Название</th>
              <th className="p-4">Slug</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course: any) => (
              <tr key={course._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{course.title}</td>
                <td className="p-4 text-gray-500">{course.slug}</td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(course._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
