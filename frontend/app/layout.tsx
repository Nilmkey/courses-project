import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemedToaster } from "@/components/themed-toaster";
import "./globals.css";
import Provider from "@/components/provider";
import { ThemeProvider } from "next-themes";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeLearn — Интерактивная платформа для обучения IT",
    template: "%s | CodeLearn",
  },
  description:
    "Изучайте программирование с нуля до профессионального уровня. Практические курсы по HTML, CSS, JavaScript, Python, C++ и C#. Учитесь в своём темпе с сертификатом по окончании.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ThemedToaster />
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
