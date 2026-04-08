"use client";

import Provider from "@/components/provider";

/**
 * Клиентская обёртка для всех провайдеров.
 * ThemeProvider вынесен внутрь Provider чтобы избежать
 * бага Next.js 16 + next-themes при SSR _global-error page.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
    </Provider>
  );
}

/**
 * Обёртка для ThemeProvider с обработкой SSR ошибок.
 */
function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  try {
    const { ThemeProvider } = require("@/components/theme-provider");
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    );
  } catch {
    // Fallback если ThemeProvider недоступен
    return <>{children}</>;
  }
}
