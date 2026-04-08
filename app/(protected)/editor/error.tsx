"use client";

import { ErrorState } from "@/components/ui/error-state";

/**
 * Error boundary для всех страниц редактора.
 * Применяется ко всем вложенным маршрутам: course, sections, lesson.
 */
export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Ошибка редактора"
      showHomeButton
    />
  );
}
