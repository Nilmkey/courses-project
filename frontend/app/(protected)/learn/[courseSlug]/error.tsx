"use client";

import { ErrorState } from "@/components/ui/error-state";

/**
 * Error boundary для режима обучения.
 */
export default function LearnError({
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
      title="Ошибка загрузки курса"
      showHomeButton
    />
  );
}
