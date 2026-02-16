"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Code,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
            setSuccess("Вход выполнен успешно!");
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
            setSuccess("Регистрация успешна! Теперь вы можете войти.");
            setIsLogin(true);
          },
        },
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f5ff] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-[440px] relative">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-[#3b5bdb] rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Code className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase text-black">
              CodeLearn
            </span>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-white p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
              {isLogin ? "С возвращением!" : "Создать аккаунт"}
            </h2>
            <p className="text-slate-500 font-medium">
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
                  className="text-sm font-bold text-slate-700 ml-1"
                >
                  Имя
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Имя"
                    className="h-14 pl-12 bg-white/50 border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3b5bdb] focus:border-transparent transition-all text-black"
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
                className="text-sm font-bold text-slate-700 ml-1"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-14 pl-12 bg-white/50 border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3b5bdb] focus:border-transparent transition-all text-black"
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
                  className="text-sm font-bold text-slate-700"
                >
                  Пароль
                </Label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs font-bold text-[#3b5bdb] hover:underline"
                  >
                    Забыли?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 pl-12 bg-white/50 border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3b5bdb] focus:border-transparent transition-all text-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="rounded-2xl bg-rose-50 border-rose-100 text-rose-600"
              >
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-medium ml-2">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="rounded-2xl bg-emerald-50 border-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <AlertDescription className="font-medium ml-2">
                  {success}
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
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Войти в аккаунт" : "Создать аккаунт"}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="text-slate-500 font-medium hover:text-[#3b5bdb] transition-colors"
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
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
