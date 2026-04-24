"use client";

import Provider from "@/components/provider";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Клиентская обёртка для всех провайдеров.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider>{children}</Provider>
    </ThemeProvider>
  );
}
