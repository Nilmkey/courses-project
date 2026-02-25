"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";

export interface CourseTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CourseTitleInput({
  value,
  onChange,
  placeholder = "Введите название курса",
}: CourseTitleInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="course-title" className="text-base font-bold text-slate-700 dark:text-slate-300">
        Название курса
      </Label>
      <div className="relative">
        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          id="course-title"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 h-12 text-base"
        />
      </div>
    </div>
  );
}
