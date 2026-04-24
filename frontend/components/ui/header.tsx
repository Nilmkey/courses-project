"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { authClient } from "@/frontend/lib/auth-client";
import { Button } from "@/components/ui/button";
import { StreakFire } from "@/components/StreakFire";
import { useToast } from "@/frontend/hooks/useToast";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
}
import {
  Code,
  BookOpen,
  Loader2,
  User,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const toast = useToast();

  const user = session?.user as SessionUser | undefined;

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
        confirmClassName:
          "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30",
      },
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
          <div
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-2 ring-indigo-100 dark:ring-indigo-900">
              <Code className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              CodeLearn
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {mounted && user && <StreakFire showCount={true} size="sm" />}

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                )}
              </Button>
            )}

            <nav className="hidden md:flex gap-4 items-center ml-2">
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
              ) : user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        className="border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl px-5 gap-2 font-bold shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4" /> Админ
                      </Button>
                    </Link>
                  )}
                  <Link href="/courses">
                    <Button
                      variant="ghost"
                      className="font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl px-5"
                    >
                      Курсы
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <div className="w-10 h-10 rounded-[0.8rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 dark:hover:ring-offset-slate-950 transition-all overflow-hidden shadow-inner group relative">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt="Profile"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl px-6 font-bold shadow-sm active:scale-95 transition-all"
                  >
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl px-5"
                    >
                      Войти
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all">
                      Начать путь
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center ml-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
              aria-label="Открыть меню"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-20 left-0 right-0 z-50 md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl rounded-b-[2rem] overflow-hidden animate-in slide-in-from-top-2">
              <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
                {isPending ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  </div>
                ) : user ? (
                  <>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 font-bold text-indigo-600 dark:text-indigo-400 active:scale-95 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShieldCheck className="w-6 h-6" /> Админ-панель
                      </Link>
                    )}
                    <Link
                      href="/courses"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen className="w-6 h-6 text-indigo-500" /> Каталог
                      курсов
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 active:scale-95 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
                        Мой Профиль
                      </span>
                    </Link>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl py-6 font-bold shadow-sm active:scale-95 mt-4 transition-all"
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
                        className="w-full font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 py-6 text-lg rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                      >
                        Войти
                      </Button>
                    </Link>
                    <Link
                      href="/login"
                      className="w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl py-6 text-lg shadow-xl shadow-indigo-500/30 active:scale-95 transition-all">
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
