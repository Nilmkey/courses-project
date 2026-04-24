"use client";

import { ErrorState } from "@/components/ui/error-state";

/**
 * Глобальный error boundary для всех страниц.
 * Перехватывает ошибки, не обработанные на уровне вложенных маршрутов.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} showHomeButton />;
}
