"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";

export function ThemedToaster() {
  const { theme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  const bg = isDark ? "#0f172a" : "#ffffff";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const border = isDark ? "#1e293b" : "#e2e8f0";
  const successIcon = "#10b981";
  const errorIcon = "#ef4444";
  const iconSecondary = isDark ? "#0f172a" : "#ffffff";

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: bg,
          color: text,
          border: `1px solid ${border}`,
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        success: {
          duration: 2000,
          iconTheme: {
            primary: successIcon,
            secondary: iconSecondary,
          },
        },
        error: {
          iconTheme: {
            primary: errorIcon,
            secondary: iconSecondary,
          },
        },
      }}
    />
  );
}
