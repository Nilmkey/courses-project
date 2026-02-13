"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client"; // Твой клиент Better Auth
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Code,
  Flame,
  Trophy,
  Target,
  ArrowLeft,
  User,
  Loader2,
} from "lucide-react";

interface CourseProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface CourseInfo {
  title: string;
  color: string;
  icon: string;
}

const coursesInfo: Record<string, CourseInfo> = {
  html: { title: "HTML Основы", color: "bg-orange-500", icon: "🌐" },
  css: { title: "CSS Стилизация", color: "bg-blue-500", icon: "🎨" },
  javascript: { title: "JavaScript", color: "bg-yellow-500", icon: "⚡" },
  python: { title: "Python", color: "bg-green-500", icon: "🐍" },
  csharp: { title: "C#", color: "bg-purple-500", icon: "💜" },
  cpp: { title: "C++", color: "bg-indigo-500", icon: "⚙️" },
};

export default function ProfilePage() {
  const router = useRouter();

  // 1. Получаем реальную сессию
  const { data: session, isPending } = authClient.useSession();

  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    // Если загрузка завершена и юзера нет — на выход
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    // Если юзер есть, подтягиваем его прогресс из localStorage (пока он там)
    if (session?.user?.email) {
      const savedProgress = localStorage.getItem(
        `progress_${session.user.email}`,
      );
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed.courses || {});
        setStreak(parsed.streak || 0);
      }
    }
  }, [session, isPending, router]);

  // Пока проверяем сессию — показываем экран загрузки
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Если сессии нет, не рендерим ничего (useEffect сделает редирект)
  if (!session) return null;

  const startedCourses = Object.keys(progress).length;
  const completedCourses = Object.values(progress).filter(
    (p) => p.percentage === 100,
  ).length;

  const totalPercentage =
    startedCourses > 0
      ? Math.round(
          Object.values(progress).reduce((sum, p) => sum + p.percentage, 0) /
            startedCourses,
        )
      : 0;

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* хедер */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/courses" className="flex items-center gap-2 group">
            <ArrowLeft className="w-5 h-5 text-black group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-black">К курсам</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Code className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-600">CodeLearn</h1>
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Выйти
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* инфо про юзера */}
          <Card className="border-2 border-blue-100 overflow-hidden">
            <div className="h-24 bg-blue-600 w-full" />
            <CardHeader className="relative pt-0">
              <div className="flex flex-col md:flex-row items-end md:items-center gap-4 -mt-10">
                <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                  <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left pt-2">
                  <CardTitle className="text-3xl font-bold text-black">
                    {session.user.name}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-500">
                    {session.user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* стата */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              icon={<Flame className="text-orange-500" />}
              value={streak}
              label="Дней подряд"
              color="orange"
            />
            <StatsCard
              icon={<Target className="text-blue-600" />}
              value={startedCourses}
              label="Начато курсов"
              color="blue"
            />
            <StatsCard
              icon={<Trophy className="text-green-600" />}
              value={completedCourses}
              label="Завершено"
              color="green"
            />
            <StatsCard
              icon={<Code className="text-purple-600" />}
              value={`${totalPercentage}%`}
              label="Прогресс"
              color="purple"
            />
          </div>

          {/* прогресс курсов */}
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="text-2xl text-black">
                Твое обучение
              </CardTitle>
            </CardHeader>
            <CardContent>
              {startedCourses === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-6 text-lg">
                    Вы ещё не начали ни одного курса. Пора это исправить!
                  </p>
                  <Link href="/courses">
                    <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                      Выбрать курс
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {Object.entries(progress).map(
                    ([courseId, courseProgress]) => {
                      const info = coursesInfo[courseId];
                      if (!info) return null;
                      return (
                        <div
                          key={courseId}
                          className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-white"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <span
                                className={`text-3xl p-3 rounded-lg ${info.color} bg-opacity-10`}
                              >
                                {info.icon}
                              </span>
                              <div>
                                <h4 className="font-bold text-lg text-black">
                                  {info.title}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {courseProgress.completed} из{" "}
                                  {courseProgress.total} уроков
                                </p>
                              </div>
                            </div>
                            <span className="text-2xl font-black text-blue-600">
                              {courseProgress.percentage}%
                            </span>
                          </div>
                          <Progress
                            value={courseProgress.percentage}
                            className="h-2 mb-4"
                          />
                          <Link href={`/course/${courseId}`}>
                            <Button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                              Продолжить обучение
                            </Button>
                          </Link>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Маленький вспомогательный компонент для карточек статистики
function StatsCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    orange: "border-orange-100 from-orange-50",
    blue: "border-blue-100 from-blue-50",
    green: "border-green-100 from-green-50",
    purple: "border-purple-100 from-purple-50",
  };
  return (
    <Card className={`border-2 bg-gradient-to-br ${colors[color]} to-white`}>
      <CardContent className="pt-6 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900">
          {value}
        </div>
        <div className="text-xs md:text-sm text-gray-500 font-medium uppercase">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
