"use client";

import { Eye, EyeOff } from "lucide-react";

export interface CoursePublishToggleProps {
  isPublished: boolean;
  onToggle: () => void;
}

export function CoursePublishToggle({
  isPublished,
  onToggle,
}: CoursePublishToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        w-full p-6 rounded-2xl border-2 transition-all duration-300
        flex items-center justify-between gap-4
        ${
          isPublished
            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
        }
        hover:shadow-lg
      `}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
            p-3 rounded-xl transition-colors
            ${
              isPublished
                ? "bg-green-500 text-white"
                : "bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
            }
          `}
        >
          {isPublished ? (
            <Eye className="h-6 w-6" />
          ) : (
            <EyeOff className="h-6 w-6" />
          )}
        </div>
        <div className="text-left">
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">
            {isPublished ? "Опубликовано" : "Черновик"}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isPublished
              ? "Курс виден всем пользователям"
              : "Курс виден только вам"}
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          className={`
            w-14 h-8 rounded-full transition-colors
            ${
              isPublished
                ? "bg-green-500"
                : "bg-slate-300 dark:bg-slate-600"
            }
          `}
        >
          <div
            className={`
              absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
              transition-transform duration-200
              ${
                isPublished
                  ? "left-7"
                  : "left-1"
              }
            `}
          />
        </div>
      </div>
    </button>
  );
}
