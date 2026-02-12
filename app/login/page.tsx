"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Code, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  email: string;
  password: string;
  name: string;
  registeredAt: string;
}

interface UserProgress {
  streak: number;
  lastVisit: string | null;
  courses: Record<string, CourseProgress>;
}

interface CourseProgress {
  completed: number;
  total: number;
  percentage: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || (!isLogin && !name)) {
      setError("Заполните все поля");
      return;
    }

    if (isLogin) {
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(
        (u) => u.email === email && u.password === password,
      );

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        setSuccess("Вход выполнен успешно!");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
        //позже поменять на setTimeout(() => router.push("/courses"), 1000);!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      } else {
        setError("Неверный email или пароль");
      }
    } else {
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

      if (users.find((u) => u.email === email)) {
        setError("Пользователь с таким email уже существует");
        return;
      }

      const newUser: User = {
        email,
        password,
        name,
        registeredAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      const initialProgress: UserProgress = {
        streak: 0,
        lastVisit: null,
        courses: {},
      };
      localStorage.setItem(
        `progress_${email}`,
        JSON.stringify(initialProgress),
      );

      setSuccess("Регистрация успешна! Теперь войдите");
      setTimeout(() => {
        setIsLogin(true);
        setPassword("");
      }, 1500);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      if (!users.find((u) => u.email === "test@test.com")) {
        const testUser: User = {
          email: "test@test.com",
          password: "password",
          name: "Тестовый пользователь",
          registeredAt: new Date().toISOString(),
        };
        users.push(testUser);
        localStorage.setItem("users", JSON.stringify(users));

        const testProgress: UserProgress = {
          streak: 5,
          lastVisit: new Date().toISOString(),
          courses: {
            html: { completed: 2, total: 5, percentage: 40 },
            javascript: { completed: 1, total: 6, percentage: 16 },
          },
        };
        localStorage.setItem(
          `progress_test@test.com`,
          JSON.stringify(testProgress),
        );
      }
    }
  }, []);

  const toggleMode = (): void => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* логотип */}
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

              <Button type="submit" className="w-full" size="lg">
                {isLogin ? "Войти" : "Зарегистрироваться"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin
                  ? "Нет аккаунта? Зарегистрироваться"
                  : "Уже есть аккаунт? Войти"}
              </button>
            </div>

            {/* инфа про тест аккаунт */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Тестовый аккаунт:
              </p>
              <p className="text-xs text-blue-700">Email: test@test.com</p>
              <p className="text-xs text-blue-700">Пароль: password</p>
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
