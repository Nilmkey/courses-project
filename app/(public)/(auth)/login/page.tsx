"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import {
  Code,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const toast = useToast();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: "/",
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => setError(ctx.error.message || "Ошибка входа"),
          onSuccess: () => {
            toast.success("Вход выполнен успешно!");
            setTimeout(() => router.push("/"), 1000);
          },
        },
      );
    } else {
      await authClient.signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => setError(ctx.error.message || "Ошибка регистрации"),
          onSuccess: () => {
            toast.success("Регистрация успешна! Теперь вы можете войти.");
            setIsLogin(true);
          },
        },
      );
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 flex flex-col transition-colors duration-300 relative overflow-hidden">
      <Toaster />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 dark:bg-indigo-900/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 dark:bg-blue-900/10 rounded-full blur-[120px] -z-10" />

      <header className="p-6 relative max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="w-10 h-10" />
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 group"
        >
          <div className="w-11 h-11 bg-[#3b5bdb] rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <Code className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight uppercase dark:text-white">
            CodeLearn
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-full hover:bg-white dark:hover:bg-slate-900 shadow-sm"
        >
          {resolvedTheme === "dark" ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-slate-600" />
          )}
        </Button>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 dark:shadow-none border border-white dark:border-slate-800 p-8 md:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                {isLogin ? "С возвращением!" : "Создать аккаунт"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {isLogin
                  ? "Продолжай свой путь к вершинам IT"
                  : "Начни учиться программированию бесплатно"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
                  >
                    Имя
                  </Label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3b5bdb] transition-colors" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ваше имя"
                      className="h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#3b5bdb] transition-all dark:text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3b5bdb] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#3b5bdb] transition-all dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label
                    htmlFor="password"
                    className="text-xs font-black uppercase tracking-widest text-slate-400"
                  >
                    Пароль
                  </Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3b5bdb] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#3b5bdb] transition-all dark:text-white [&::-ms-reveal]:hidden [&::-webkit-password-reveal]:hidden"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3b5bdb] transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400"
                >
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="font-medium ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-[#3b5bdb] hover:bg-[#2f4bbf] text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isLogin ? (
                  "Войти в аккаунт"
                ) : (
                  "Создать аккаунт"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              {isLogin && (
                <button
                  type="button"
                  className="text-xs font-black uppercase tracking-wider text-[#3b5bdb] hover:underline outline-none focus:ring-1 focus:ring-blue-500 rounded p-1"
                >
                  Забыли пароль?
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#3b5bdb] transition-colors"
              >
                {isLogin ? (
                  <>
                    Нет аккаунта?{" "}
                    <span className="font-bold text-[#3b5bdb]">
                      Зарегистрироваться
                    </span>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{" "}
                    <span className="font-bold text-[#3b5bdb]">Войти</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#3b5bdb] font-bold text-sm transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Вернуться на главную
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
