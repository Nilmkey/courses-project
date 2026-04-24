"use client";

import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useMounted } from "@/frontend/hooks/useMounted";

export const useToast = () => {
  const { theme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const getToastStyles = useCallback(() => {
    const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

    return {
      background: isDark ? "#0f172a" : "#ffffff",
      color: isDark ? "#f1f5f9" : "#0f172a",
      border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
      borderRadius: "0.75rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    };
  }, [mounted, resolvedTheme, theme]);

  const success = (message: string) => {
    toast.success(message, {
      style: getToastStyles(),
      duration: 2000,
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      style: getToastStyles(),
      duration: 2000,
    });
  };

  const loading = (message: string) => {
    return toast.loading(message, {
      style: getToastStyles(),
    });
  };

  const dismiss = (id?: string) => {
    toast.dismiss(id);
  };

  const confirm = (
    title: string,
    onConfirm: () => void,
    options?: { confirmText?: string; confirmClassName?: string },
  ) => {
    const {
      confirmText = "Удалить",
      confirmClassName = "bg-rose-500 hover:bg-rose-600",
    } = options || {};

    const styles = getToastStyles();

    toast(
      (t) => (
        <div className="flex flex-col gap-4 min-w-[280px] p-1">
          <div className="flex flex-col gap-1">
            <h3
              className="font-black text-sm uppercase tracking-tight"
              style={{ color: styles.color }}
            >
              Подтверждение
            </h3>
            <p
              className="text-sm font-medium"
              style={{
                color:
                  mounted && (resolvedTheme === "dark" || theme === "dark")
                    ? "#94a3b8"
                    : "#64748b",
              }}
            >
              {title}
            </p>
          </div>

          <div
            className="flex justify-end gap-2 pt-2"
            style={{
              borderTop: `1px solid ${mounted && (resolvedTheme === "dark" || theme === "dark") ? "#1e293b" : "#e2e8f0"}`,
            }}
          >
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-xs font-bold uppercase transition-colors"
              style={{
                color:
                  mounted && (resolvedTheme === "dark" || theme === "dark")
                    ? "#94a3b8"
                    : "#64748b",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color =
                  mounted && (resolvedTheme === "dark" || theme === "dark")
                    ? "#f1f5f9"
                    : "#0f172a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  mounted && (resolvedTheme === "dark" || theme === "dark")
                    ? "#94a3b8"
                    : "#64748b")
              }
            >
              Отмена
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }}
              className={`px-4 py-2 text-xs font-bold uppercase text-white rounded-lg shadow-lg transition-all active:scale-95 ${confirmClassName}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: styles,
      },
    );
  };

  const promise = <T,>(
    asyncFn: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) => {
    return toast.promise(
      asyncFn,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: getToastStyles(),
      },
    );
  };

  return { success, error, loading, dismiss, promise, confirm };
};
