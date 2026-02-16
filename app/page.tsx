"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
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
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  number: string;
  label: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const features: Feature[] = [
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

  const stats: Stat[] = [
    { number: "6+", label: "Курсов", description: "На любой вкус" },
    { number: "100+", label: "Уроков", description: "Без лишней воды" },
    { number: "1000+", label: "Учеников", description: "Довольны обучением" },
  ];

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-900 selection:bg-blue-600 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-blue-100/50">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">
              CodeLearn
            </span>
          </div>

          <nav className="flex gap-3 items-center">
            {isPending ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : session ? (
              <>
                <Link href="/courses" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    className="font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
                  >
                    Курсы
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className="font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
                  >
                    Профиль
                  </Button>
                </Link>
                <Button
                  onClick={handleSignOut}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-md transition-all active:scale-95"
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="font-bold text-slate-600 hover:text-blue-600"
                  >
                    Войти
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 shadow-lg shadow-blue-500/25 transition-all active:scale-95">
                    Начать путь
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-8 animate-fade-in">
            <Sparkles size={16} />
            <span>Платформа №1 для будущих разработчиков</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
            Построй свой путь в IT <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              на реальной практике
            </span>
          </h2>

          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            {session ? (
              <>
                Рады видеть тебя снова,{" "}
                <span className="font-bold text-slate-900">
                  {session.user.name}
                </span>
                ! Твой прогресс ждет тебя. Давай продолжим взламывать этот код.
              </>
            ) : (
              "CodeLearn — это современная экосистема обучения. Мы не просто даем теорию, мы учим создавать реальные продукты через практику в браузере."
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

      <section className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 text-center group hover:border-blue-200 transition-colors"
            >
              <div className="text-5xl font-black text-blue-600 mb-2 tracking-tighter group-hover:scale-110 transition-transform">
                {stat.number}
              </div>
              <div className="text-lg font-bold text-slate-800 mb-1">
                {stat.label}
              </div>
              <div className="text-slate-500 text-sm font-medium">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Почему выбирают нас?
          </h3>
          <p className="text-slate-500 font-medium">
            Мы создали идеальные условия для твоего старта в разработке
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300"
            >
              <div
                className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}
              >
                {feature.icon}
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-2">
                {feature.title}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {!session && (
        <section className="container mx-auto px-4 py-20">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-2xl shadow-blue-500/40">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-12 translate-x-1/2" />
            <div className="relative z-10 max-w-2xl text-white">
              <h3 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Готов написать свой <br /> первый Hello World?
              </h3>
              <p className="text-xl text-blue-100 mb-10 font-medium leading-relaxed">
                Присоединяйся к нашему комьюнити. Начни учиться сегодня, чтобы
                завтра оффер нашел тебя сам.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-black text-lg px-10 h-16 rounded-2xl shadow-xl transition-all active:scale-95"
                >
                  Зарегистрироваться сейчас
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-white border-t border-slate-100 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-black tracking-tight text-slate-800">
                CodeLearn
              </span>
            </div>
            <p className="text-slate-400 font-medium">
              © {new Date().getFullYear()} CodeLearn. Все права защищены.
            </p>
            <div className="flex gap-6 text-slate-400 font-bold text-sm">
              <a href="#" className="hover:text-blue-600 transition-colors">
                Политика
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Условия
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Поддержка
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
