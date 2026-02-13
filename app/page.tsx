"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // Убедись, что путь к клиенту верный
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
  Users,
  BookOpen,
  Play,
  Loader2,
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Stat {
  number: string;
  label: string;
  description: string;
}

export default function Home() {
  const router = useRouter();

  // Получаем данные сессии через Better Auth
  const { data: session, isPending } = authClient.useSession();

  // Функция для выхода из аккаунта
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // Перенаправляем на логин после выхода
        },
      },
    });
  };

  const features: Feature[] = [
    {
      icon: <Code className="w-12 h-12 text-blue-600" />,
      title: "Интерактивные уроки —",
      description:
        "Учитесь программированию на практике с встроенным редактором кода",
    },
    {
      icon: <Play className="w-12 h-12 text-blue-600" />,
      title: "Тестируйте свои навыки не выходя из браузера!",
      description: "Запускайте код прямо в браузере без установки программ",
    },
    {
      icon: <Trophy className="w-12 h-12 text-blue-600" />,
      title: "Отслеживание прогресса —",
      description: "Следите за своим прогрессом по каждому курсу",
    },
    {
      icon: <BookOpen className="w-12 h-12 text-blue-600" />,
      title: "Множество курсов —",
      description: "Выбирайте на свой вкус и цвет!",
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: "Бесплатное обучение —",
      description: "Все курсы доступны бесплатно после регистрации",
    },
    {
      icon: <Flame className="w-12 h-12 text-blue-600" />,
      title: "Тысячи отзывов —",
      description:
        "У всех пользователей осталось много положительных эмоций после прохождения наших курсов! ",
    },
  ];

  const stats: Stat[] = [
    {
      number: "6+",
      label: "Курсов",
      description: "Вы точно найдете на свой вкус!",
    },
    {
      number: "100+",
      label: "Уроков",
      description: "Никакой лишней информации!",
    },
    {
      number: "1000+",
      label: "Учеников",
      description: "И все они остались довольны!",
    },
  ];

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
            {isPending ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : session ? (
              /* Контент для авторизованного пользователя */
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
                    Профиль ({session.user.name?.split(" ")[0]})
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="bg-blue-500 text-white hover:bg-blue-700 active:bg-blue-900 border-none"
                >
                  Выйти
                </Button>
              </>
            ) : (
              /* Контент для гостя */
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
                  <Button className="text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-900">
                    Начать обучение
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* главная (Hero Section) */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Построй свой путь в IT благодаря{" "}
            <span className="text-blue-600">нашим курсам</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {session ? (
              <>
                Добро пожаловать обратно,{" "}
                <span className="font-bold text-blue-600">
                  {session.user.name}
                </span>
                ! Твой прогресс сохранен, давай продолжим обучение прямо сейчас.
              </>
            ) : (
              <>
                CodeLearn — это увлекательная платформа по IT-курсам, где ты
                сможешь понять как и из чего состоит программирование, а так же
                именно <span className="text-blue-600">ты</span> сможешь найти
                себя в данной сфере
              </>
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href={"/courses"}>
              <Button
                size="lg"
                className="text-lg px-8 bg-blue-500 active:bg-blue-900 hover:bg-blue-700 text-white"
              >
                {session ? "Продолжить обучение" : "Начать бесплатно"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-2 border-blue-100">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 mb-2">{stat.label}</div>
                <div className="text-gray-900">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Фишки */}
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

      {/* Выбор (Call to action) */}
      {!session && (
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-4xl font-bold text-white mb-6">
              Готов начать своё путешествие?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Присоединяйся к тысячам учеников, которые уже начали изучать
              программирование
            </p>
            <Link href={"/login"}>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 bg-white text-black hover:bg-gray-200 active:bg-gray-300"
              >
                Начать сейчас бесплатно
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Футер */}
      <footer className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} CodeLearn</p>
        </div>
      </footer>
    </div>
  );
}
