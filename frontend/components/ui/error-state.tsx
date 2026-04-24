"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  showHomeButton?: boolean;
}

export function ErrorState({
  error,
  reset,
  title = "Что-то пошло не так",
  showHomeButton = false,
}: ErrorStateProps) {
  useEffect(() => {
    console.error("[Error Boundary]", error);
  }, [error]);

  const isNotFound =
    error.message?.includes("404") || error.message?.includes("не найден");

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">
            {isNotFound ? "Не найдено" : title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {error.message ||
              "Произошла непредвиденная ошибка. Попробуйте обновить страницу."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </Button>

          {showHomeButton && (
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              <Home className="h-4 w-4" />
              На главную
            </Button>
          )}
        </div>

        {/* Error digest (development hint) */}
        {error.digest && process.env.NODE_ENV === "development" && (
          <p className="text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
