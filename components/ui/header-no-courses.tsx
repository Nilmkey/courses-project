"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { ExtendedUser } from "@/backend/auth";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { useToast } from "@/hooks/useToast";
import {
  Code,
  Flame,
  Loader2,
  User,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

export default function HeaderNoCourses() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const toast = useToast();

  const user = session?.user as unknown as ExtendedUser | undefined;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSignOut = () => {
    toast.confirm(
      "Вы точно хотите выйти из аккаунта?",
      async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.success("Вы успешно вышли из аккаунта.");
              router.push("/login");
            },
          },
        });
      },
      {
        confirmText: "Выйти",
        confirmClassName: "bg-red-500 hover:bg-red-600",
      },
    );
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
            color: resolvedTheme === "dark" ? "#f1f5f9" : "#0f172a",
            border:
              resolvedTheme === "dark"
                ? "1px solid #1e293b"
                : "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          },
        }}
      />
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-blue-100/50 dark:border-slate-800">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase dark:text-white">
              CodeLearn
            </span>
          </div>

          <div className="flex items-center gap-2">
            {mounted && user && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-100 dark:border-orange-800/50 group transition-all hover:scale-105">
                <Flame
                  className={`w-5 h-5 ${user.streak.count > 0 ? "text-orange-500 animate-pulse" : "text-orange-500"}`}
                />
                <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                  {user.streak.count || 0}
                </span>
              </div>
            )}

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="rounded-full hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </Button>
            )}

            <nav className="hidden md:flex gap-3 items-center ml-2">
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              ) : user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full px-5 gap-2 font-bold"
                      >
                        <ShieldCheck className="w-4 h-4" /> Админ
                      </Button>
                    </Link>
                  )}
                  <Link href="/profile">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden shadow-inner">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white rounded-full px-6 shadow-md active:scale-95 font-bold"
                  >
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                    >
                      Войти
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 shadow-lg shadow-blue-500/25 active:scale-95">
                      Начать путь
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 ml-1 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Открыть меню"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-20 left-0 right-0 z-50 md:hidden border-t border-blue-100/50 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl">
              <div className="container mx-auto px-4 py-6 flex flex-col gap-3">
                {isPending ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : user ? (
                  <>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 font-bold text-blue-600 dark:text-blue-400"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShieldCheck className="w-5 h-5" /> Админ-панель
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        )}
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Профиль
                      </span>
                    </Link>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-6 font-bold shadow-md active:scale-95 mt-2"
                    >
                      Выйти из аккаунта
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 py-6"
                      >
                        Войти
                      </Button>
                    </Link>
                    <Link
                      href="/login"
                      className="w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-6 shadow-lg shadow-blue-500/25 active:scale-95">
                        Начать путь
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
