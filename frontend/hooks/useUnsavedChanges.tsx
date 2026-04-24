"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useToast } from "@/frontend/hooks/useToast";

interface UseUnsavedChangesProps {
  hasUnsavedChanges: () => boolean;
  message?: string;
  enabled?: boolean;
}

export function useUnsavedChanges({
  hasUnsavedChanges,
  message = "У вас есть несохраненные изменения. Вы уверены, что хотите уйти?",
  enabled = true,
}: UseUnsavedChangesProps) {
  const router = useRouter();
  const { dismiss } = useToast();
  const hasChangesRef = useRef(false);
  const originalRouterPush = useRef<typeof router.push | null>(null);
  const originalRouterBack = useRef<typeof router.back | null>(null);
  const originalRouterReplace = useRef<typeof router.replace | null>(null);
  const isConfirmingRef = useRef(false);

  useEffect(() => {
    hasChangesRef.current = hasUnsavedChanges();
  }, [hasUnsavedChanges]);

  const confirmNavigation = useCallback(async (): Promise<boolean> => {
    if (!hasChangesRef.current || isConfirmingRef.current) {
      return true;
    }

    isConfirmingRef.current = true;

    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        toast.custom(
          (t) => (
            <UnsavedWarningToast
              message={message}
              onConfirm={() => {
                resolve(true);
                dismiss(t.id);
              }}
              onCancel={() => {
                resolve(false);
                dismiss(t.id);
              }}
            />
          ),
          { duration: 15000 },
        );
      });

      return confirmed;
    } finally {
      isConfirmingRef.current = false;
    }
  }, [message, dismiss]);

  useEffect(() => {
    if (!enabled) return undefined;

    originalRouterPush.current = router.push;
    originalRouterBack.current = router.back;
    originalRouterReplace.current = router.replace;

    const originalPush = router.push;
    router.push = async function (
      ...args: Parameters<typeof router.push>
    ): Promise<void> {
      if (hasChangesRef.current) {
        const confirmed = await confirmNavigation();
        if (!confirmed) {
          return;
        }
      }

      return originalPush(...args);
    };

    const originalBack = router.back;
    router.back = async function (): Promise<void> {
      if (hasChangesRef.current) {
        const confirmed = await confirmNavigation();
        if (!confirmed) {
          return;
        }
      }

      return originalBack();
    };

    const originalReplace = router.replace;
    router.replace = async function (
      ...args: Parameters<typeof router.replace>
    ): Promise<void> {
      if (hasChangesRef.current) {
        const confirmed = await confirmNavigation();
        if (!confirmed) {
          return;
        }
      }

      return originalReplace(...args);
    };

    return () => {
      router.push = originalPush;
      router.back = originalBack;
      router.replace = originalReplace;
    };
  }, [enabled, confirmNavigation, router]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);

  const resetChanges = useCallback(() => {
    hasChangesRef.current = false;
  }, []);

  return { resetChanges, hasUnsavedChanges: () => hasChangesRef.current };
}

interface UnsavedWarningToastProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function UnsavedWarningToast({
  message,
  onConfirm,
  onCancel,
}: UnsavedWarningToastProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <span className="font-bold text-slate-800 dark:text-slate-100 block">
            {message}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Все несохраненные изменения будут утеряны
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Остаться
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          Уйти
        </button>
      </div>
    </div>
  );
}
