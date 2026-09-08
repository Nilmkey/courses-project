"use client";

import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

export interface CourseDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function CourseDescriptionInput({
  value,
  onChange,
  placeholder = "Опишите, чему научится студент после прохождения курса",
  rows = 4,
}: CourseDescriptionInputProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="course-description"
        className="text-base font-bold text-slate-700 dark:text-slate-300"
      >
        Описание курса
      </Label>
      <div className="relative">
        <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <textarea
          id="course-description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="
            w-full rounded-md border border-input 
            bg-transparent px-3 py-2 pl-10 text-base 
            shadow-sm transition-colors
            placeholder:text-muted-foreground 
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
            disabled:cursor-not-allowed disabled:opacity-50
            resize-none
          "
        />
      </div>
    </div>
  );
}
