"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { LessonItem } from "./LessonItem";
import type { ISection } from "@/types/types";

export function SectionItem({ section }: { section: ISection }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
      >
        {isExpanded ? (
          <ChevronDown
            size={16}
            className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors"
          />
        ) : (
          <ChevronRight
            size={16}
            className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors"
          />
        )}
        <div className="flex-1 text-left">
          <span className="font-semibold text-sm text-slate-900 dark:text-white">
            {section.title}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {section.lessons.length}{" "}
            {section.lessons.length === 1 ? "урок" : "уроков"}
          </p>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-slate-50 dark:bg-slate-900">
          {section.lessons.map((lesson) => (
            <LessonItem
              key={lesson._id}
              lesson={lesson}
              sectionId={section._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
