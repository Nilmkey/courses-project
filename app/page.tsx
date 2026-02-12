"use client";

import React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Code,
  Flame,
  Trophy,
  TrendingUp,
  Users,
  BookOpen,
  Play,
} from "lucide-react";

interface User {
  email: string;
  name?: string;
}

interface UserProgress {
  streak?: number;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Stat {
  number: string;
  label: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const userData: User = JSON.parse(currentUser);
      setUser(userData);
      const userProgress: UserProgress = JSON.parse(
        localStorage.getItem(`progress_${userData.email}`) || "{}",
      );
      setStreak(userProgress.streak || 0);
    }
  }, []);

  const features: Feature[] = [
    {
      icon: <Code className="w-12 h-12 text-blue-600" />,
      title: "Интерактивные уроки",
      description:
        "Учитесь программированию на практике с встроенным редактором кода",
    },
    {
      icon: <Play className="w-12 h-12 text-blue-600" />,
      title: "Компилятор в браузере",
      description: "Запускайте код прямо в браузере без установки программ",
    },
    {
      icon: <Flame className="w-12 h-12 text-blue-600" />,
      title: "Геймификация",
      description: "Поддерживайте огонек и зарабатывайте достижения",
    },
    {
      icon: <Trophy className="w-12 h-12 text-blue-600" />,
      title: "Отслеживание прогресса",
      description: "Следите за своим прогрессом по каждому курсу",
    },
    {
      icon: <BookOpen className="w-12 h-12 text-blue-600" />,
      title: "Множество курсов",
      description: "HTML, CSS, JavaScript, C#, C++, Python и другие",
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: "Бесплатное обучение",
      description: "Все курсы доступны бесплатно после регистрации",
    },
  ];

  const stats: Stat[] = [
    { number: "6+", label: "Курсов" },
    { number: "100+", label: "Уроков" },
    { number: "1000+", label: "Учеников" },
  ];

  const handleLogout = (): void => {
    localStorage.removeItem("currentUser");
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* хедер */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-600">CodeLearn</h1>
          </div>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <Link href="/courses">
                  <Button
                    className="transition-colors duration-300 hover:bg-blue-500 hover:text-white active:bg-blue-900 text-black"
                    variant="ghost"
                  >
                    Курсы
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button
                    className="transition-colors duration-300 hover:bg-blue-500 hover:text-white active:bg-blue-900 text-black"
                    variant="ghost"
                  >
                    Профиль
                  </Button>
                </Link>
                {streak > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">
                      {streak}
                    </span>
                  </div>
                )}
                <Button variant="outline" onClick={handleLogout} className="bg-blue-500 active:bg-blue-900">
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="transition-colors duration-300 hover:bg-blue-600 hover:text-white active:bg-blue-900 text-black"
                  >
                    Войти
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="text-black active:bg-gray-300">Начать обучение</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* главная */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Научись программировать{" "}
            <span className="text-blue-600">правильно</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Интерактивная платформа для изучения программирования с компилятором
            в браузере. Учись на практике, отслеживай прогресс и достигай целей!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href={user ? "/courses" : "/login"}>
              <Button
                size="lg"
                className="text-lg px-8 bg-blue-500 active:bg-blue-900"
              >
                Начать бесплатно
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-white text-black active:bg-gray-300"
              >
                Посмотреть курсы
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-2 border-blue-100">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* фишки */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Почему выбирают нас?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg text-black"
            >
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* выбор */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Готов начать своё путешествие?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Присоединяйся к тысячам учеников, которые уже начали изучать
            программирование
          </p>
          <Link href={user ? "/courses" : "/login"}>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-black active:bg-gray-300"
            >
              Начать сейчас бесплатно
            </Button>
          </Link>
        </div>
      </section>

      {/* футер */}
      <footer className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 CodeLearn. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
