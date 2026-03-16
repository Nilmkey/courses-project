"use client";

import { CheckCircle } from "lucide-react";
import { useLearning } from "@/hooks/useLearning";

export function CompletionButton() {
  const { currentLessonId, markLessonComplete } = useLearning();

  const handleClick = async () => {
    if (!currentLessonId) return;
    await markLessonComplete(currentLessonId);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/25 active:scale-95"
    >
      <CheckCircle size={20} />
      Отметить как пройденное
    </button>
  );
}
