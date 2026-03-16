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
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
      >
        {isExpanded ? (
          <ChevronDown
            size={16}
            className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors"
          />
        ) : (
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors"
          />
        )}
        <div className="flex-1 text-left">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {section.title}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {section.lessons.length}{" "}
            {section.lessons.length === 1 ? "урок" : "уроков"}
          </p>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-gray-50 dark:bg-gray-900">
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
