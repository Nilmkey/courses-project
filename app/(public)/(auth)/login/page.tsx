"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, AlertCircle, Loader2 } from "lucide-react";
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
      // ЛОГИН ЧЕРЕЗ BETTER AUTH
      const { data, error: authError } = await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: "/", // куда редиректить после входа
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
      // РЕГИСТРАЦИЯ ЧЕРЕЗ BETTER AUTH
      const { data, error: authError } = await authClient.signUp.email(
        {
          email,
          password,
          name,
          // role: "student" // если ты добавил это поле в additionalFields на бэке
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Code className="w-10 h-10 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">CodeLearn</span>
          </Link>
        </div>

        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl text-black">
              {isLogin ? "Вход" : "Регистрация"}
            </CardTitle>
            <CardDescription className="text-black">
              {isLogin
                ? "Войдите в свой аккаунт для продолжения обучения"
                : "Создайте аккаунт, чтобы начать обучение"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-black">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Войти" : "Зарегистрироваться"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin
                  ? "Нет аккаунта? Зарегистрироваться"
                  : "Уже есть аккаунт? Войти"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
