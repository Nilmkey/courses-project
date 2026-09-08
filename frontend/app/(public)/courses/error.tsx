"use client";

import { ErrorState } from "@/components/ui/error-state";

/**
 * Error boundary для каталога курсов.
 */
export default function CoursesError({
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
      title="Ошибка загрузки каталога"
      showHomeButton
    />
  );
}
