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
            setTimeout(() => router.push("/"), 500);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300 relative overflow-hidden font-sans">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
            color: resolvedTheme === "dark" ? "#f8fafc" : "#0f172a",
            border: resolvedTheme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            padding: "16px 20px",
            fontWeight: "600",
          },
        }}
      />
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[20%] right-[10%] w-[35rem] h-[35rem] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <header className="p-6 relative max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="w-10 h-10" />
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-2 ring-indigo-100 dark:ring-indigo-900">
            <Code className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            CodeLearn
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm"
        >
          {resolvedTheme === "dark" ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-slate-600" />
          )}
        </Button>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pb-20 relative z-10">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 dark:shadow-none border border-white dark:border-slate-800/50 p-8 md:p-10 relative overflow-hidden">
             
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full" />

            <div className="mb-8 text-center relative z-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {isLogin ? "С возвращением!" : "Создать аккаунт"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {isLogin
                  ? "Продолжай путь к вершинам IT"
                  : "Начни учиться программированию бесплатно"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {!isLogin && (
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1"
                  >
                    Имя
                  </Label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Александр"
                      className="h-14 pl-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white"
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
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-14 pl-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white"
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
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-14 pl-12 pr-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white [&::-ms-reveal]:hidden [&::-webkit-password-reveal]:hidden"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors p-1 bg-transparent"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
                >
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="font-bold ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
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

            <div className="mt-8 text-center relative z-10">
              {isLogin && (
                <button
                  type="button"
                  className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 outline-none p-1 transition-colors block mx-auto mb-4"
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
                className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {isLogin ? (
                  <>
                    Нет аккаунта?{" "}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Зарегистрироваться
                    </span>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{" "}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Войти</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors group px-4 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-slate-900/50"
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
