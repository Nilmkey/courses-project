"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Code,
  Flame,
  Trophy,
  Users,
  BookOpen,
  Play,
  Loader2,
  ChevronRight,
  ArrowRight,
  User,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Интерактивность",
      description:
        "Учитесь программированию на практике с встроенным редактором кода прямо в браузере",
      color: "bg-blue-500",
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Мгновенный запуск",
      description:
        "Тестируйте свои навыки моментально без установки тяжелых IDE и программ",
      color: "bg-indigo-500",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Геймификация",
      description:
        "Следите за своим прогрессом, получайте достижения и бейджи за каждый курс",
      color: "bg-cyan-500",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Каталог курсов",
      description:
        "Широкий выбор направлений: от веб-разработки до нейросетей на любой вкус",
      color: "bg-violet-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Доступность",
      description:
        "Качественное IT-образование доступно абсолютно бесплатно после регистрации",
      color: "bg-sky-500",
    },
    {
      icon: <Flame className="w-8 h-8" />,
      title: "Сообщество",
      description:
        "Тысячи довольных учеников уже изменили свою жизнь вместе с нами",
      color: "bg-orange-500",
    },
  ];

  const stats = [
    { number: "6+", label: "Курсов", description: "На любой вкус" },
    { number: "100+", label: "Уроков", description: "Без лишней воды" },
    { number: "1000+", label: "Учеников", description: "Довольны обучением" },
  ];

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Хедер */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-blue-100/50 dark:border-slate-800">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase dark:text-white">
              CodeLearn
            </span>
          </div>

          <nav className="flex gap-3 items-center">
            {/* Переключатель темы в стиле старого дизайна */}
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

            {isPending ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : session ? (
              <>
                {(session.user as any).role === "admin" && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="hidden md:flex border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full px-5 gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Админ
                    </Button>
                  </Link>
                )}
                <Link href="/courses" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    className="font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                  >
                    Курсы
                  </Button>
                </Link>
                <Link href="/profile">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                </Link>
                <Button
                  onClick={handleSignOut}
                  className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white rounded-full px-6 shadow-md active:scale-95"
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Платформа №1 для будущих разработчиков</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1]">
            Построй свой путь в IT <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              на реальной практике
            </span>
          </h2>

          <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {session ? (
              <>
                Рады видеть тебя снова,{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {session.user.name}
                </span>
                ! Твой прогресс ждет тебя.
              </>
            ) : (
              "CodeLearn — это современная экосистема обучения. Мы учим создавать реальные продукты через практику в браузере."
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/courses">
              <Button
                size="lg"
                className="h-16 px-10 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto"
              >
                {session ? "Продолжить обучение" : "Начать обучение бесплатно"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl text-center group hover:border-blue-200 transition-colors"
            >
              <div className="text-5xl font-black text-blue-600 mb-2 tracking-tighter group-hover:scale-110 transition-transform">
                {stat.number}
              </div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                {stat.label}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Фичи */}
      <section className="container mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Почему выбирают нас?
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Мы создали идеальные условия для твоего старта в разработке
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300"
            >
              <div
                className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}
              >
                {feature.icon}
              </div>
              <h4 className="text-xl font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                {feature.title}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-black text-slate-800 dark:text-white uppercase">
              CodeLearn
            </span>
          </div>
          <p>© {new Date().getFullYear()} CodeLearn. Все права защищены.</p>
          <div className="flex gap-6 text-sm font-bold">
            <a href="#" className="hover:text-blue-600">
              Политика
            </a>
            <a href="#" className="hover:text-blue-600">
              Условия
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
