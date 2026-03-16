"use client";

import { useLearning } from "@/hooks/useLearning";
import { SectionItem } from "./SectionItem";
import { BookOpen } from "lucide-react";

export function CourseSidebar() {
  const { course, sections } = useLearning();

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок курса */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Курс
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
          {course.title}
        </h2>
      </div>

      {/* Список секций */}
      <div className="flex-1 overflow-y-auto divide-y">
        {sections.map((section) => (
          <SectionItem key={section._id} section={section} />
        ))}
      </div>

      {/* Статистика */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-500">
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
