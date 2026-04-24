"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { BlockItem } from "./BlockItem";
import { useLearning } from "@/hooks/useLearning";
import type { ILesson } from "@/types/types";

interface StatusConfig {
  icon: string;
  color: string;
  label: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  "not-started": { icon: "⚪", color: "text-gray-400", label: "Не начат" },
  "in-progress": {
    icon: "🟡",
    color: "text-yellow-500",
    label: "В процессе",
  },
  completed: { icon: "🟢", color: "text-green-500", label: "Завершён" },
};

export function LessonItem({
  lesson,
  sectionId,
}: {
  lesson: ILesson;
  sectionId: string;
}) {
  const { getLessonStatus, currentLessonId } = useLearning();
  const [isExpanded, setIsExpanded] = useState(false);

  const status = getLessonStatus(lesson._id);
  const { icon, color } = STATUS_CONFIG[status];
  const isActive = currentLessonId === lesson._id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-8 py-2.5 cursor-pointer transition-colors ${
          isActive
            ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-[#3b5bdb] dark:border-indigo-400"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 border-l-2 border-transparent"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span
          className={`text-sm ${color}`}
          title={STATUS_CONFIG[status].label}
        >
          {icon}
        </span>
        <span
          className={`text-sm font-medium ${
            isActive
              ? "text-blue-700 dark:text-blue-300"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {lesson.title}
        </span>
        {lesson.content_blocks.length > 0 && (
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
            {lesson.content_blocks.length}{" "}
            {lesson.content_blocks.length === 1 ? "блок" : "блоков"}
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="bg-white dark:bg-slate-800">
          {lesson.content_blocks.map((block, index) => {
            const blockId = block.id || block._id || "";
            return (
              <BlockItem
                key={`${lesson._id}-block-${blockId}-${index}`}
                block={block}
                sectionId={sectionId}
                lessonId={lesson._id}
                blockIndex={index}
                totalBlocks={lesson.content_blocks.length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
