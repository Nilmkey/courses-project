"use client";

import { ErrorState } from "@/components/ui/error-state";

/**
 * Error boundary для админ-панели.
 */
export default function AdminError({
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
      title="Ошибка в админ-панели"
      showHomeButton
    />
  );
}
