"use client";

import { Label } from "@/components/ui/label";
import { Target, TrendingUp, Zap } from "lucide-react";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface CourseLevelSelectProps {
  value: CourseLevel;
  onChange: (value: CourseLevel) => void;
}

const levelOptions: {
  value: CourseLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "beginner",
    label: "Новичок",
    description: "Для тех, кто начинает с нуля",
    icon: <Target className="h-5 w-5" />,
    color: "bg-green-500",
  },
  {
    value: "intermediate",
    label: "Продвинутый",
    description: "Для тех, кто уже знаком с основами",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "bg-blue-500",
  },
  {
    value: "advanced",
    label: "Эксперт",
    description: "Для опытных разработчиков",
    icon: <Zap className="h-5 w-5" />,
    color: "bg-purple-500",
  },
];

export function CourseLevelSelect({
  value,
  onChange,
}: CourseLevelSelectProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-bold text-slate-700 dark:text-slate-300">
        Уровень подготовки
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {levelOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              flex flex-col items-center gap-2 text-center
              ${
                value === option.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }
            `}
          >
            <div
              className={`
                p-2 rounded-lg text-white
                ${option.color}
                ${value === option.value ? "scale-110" : ""}
                transition-transform
              `}
            >
              {option.icon}
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {option.label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {option.description}
            </span>
            {value === option.value && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
