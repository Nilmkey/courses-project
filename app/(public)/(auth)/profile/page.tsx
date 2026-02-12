"use client";

import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Code, Flame, Trophy, Target, ArrowLeft, User } from "lucide-react";

interface UserData {
  email: string;
  name: string;
  registeredAt?: string;
}

interface CourseProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface UserProgress {
  streak?: number;
  lastVisit?: string | null;
  courses?: Record<string, CourseProgress>;
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
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const userData: UserData = JSON.parse(currentUser);
    setUser(userData);

    const userProgress: UserProgress = JSON.parse(
      localStorage.getItem(`progress_${userData.email}`) || "{}",
    );
    setProgress(userProgress.courses || {});
    setStreak(userProgress.streak || 0);
  }, [router]);

  if (!user) return null;

  const totalCourses = Object.keys(coursesInfo).length;
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

  const handleLogout = (): void => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* хедер */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/courses" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-black" />
            <span className="font-semibold text-black">К курсам</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Code className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-600">CodeLearn</h1>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* инфо про юзера */}
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-black">{user.name}</CardTitle>
                  <CardDescription className="text-lg text-black">
                    {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* стата */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="pt-6 text-center">
                <Flame className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                <div className="text-4xl font-bold text-orange-600 mb-1">
                  {streak}
                </div>
                <div className="text-sm text-gray-600">Дней подряд</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6 text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {startedCourses}
                </div>
                <div className="text-sm text-gray-600">Начато курсов</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6 text-center">
                <Trophy className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {completedCourses}
                </div>
                <div className="text-sm text-gray-600">Завершено курсов</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6 text-center">
                <Code className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <div className="text-4xl font-bold text-purple-600 mb-1">
                  {totalPercentage}%
                </div>
                <div className="text-sm text-gray-600">Средний прогресс</div>
              </CardContent>
            </Card>
          </div>

          {/* прогрес курсов */}
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="text-2xl text-black">Прогресс по курсам</CardTitle>
              <CardDescription className="text-black">Ваши достижения в обучении</CardDescription>
            </CardHeader>
            <CardContent>
              {startedCourses === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Вы ещё не начали ни одного курса
                  </p>
                  <Link href="/courses">
                    <Button>Начать обучение</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6 text-black">
                  {Object.entries(progress).map(
                    ([courseId, courseProgress]) => {
                      const info = coursesInfo[courseId];
                      if (!info) return null;

                      return (
                        <div key={courseId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 ${info.color} rounded-lg flex items-center justify-center text-2xl`}
                              >
                                {info.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-lg">
                                  {info.title}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {courseProgress.completed} из{" "}
                                  {courseProgress.total} уроков
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {courseProgress.percentage}%
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={courseProgress.percentage}
                            className="h-3"
                          />
                          <div className="text-right">
                            <Link href={`/course/${courseId}`}>
                              <Button variant="ghost" size="sm" className="bg-blue-500 text-white">
                                Продолжить →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ачивки */}
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="text-2xl text-black">Достижения</CardTitle>
              <CardDescription className="text-black"> Ваши награды за успехи</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-black">
                <div
                  className={`p-4 rounded-lg text-center ${streak >= 1 ? "bg-orange-100" : "bg-gray-100 opacity-50"}`}
                >
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-sm font-semibold">Первый день</div>
                </div>
                <div
                  className={`p-4 rounded-lg text-center ${streak >= 3 ? "bg-orange-100" : "bg-gray-100 opacity-50"}`}
                >
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-sm font-semibold">3 дня подряд</div>
                </div>
                <div
                  className={`p-4 rounded-lg text-center ${streak >= 7 ? "bg-orange-100" : "bg-gray-100 opacity-50"}`}
                >
                  <div className="text-3xl mb-2">🚀</div>
                  <div className="text-sm font-semibold">Неделя</div>
                </div>
                <div
                  className={`p-4 rounded-lg text-center ${streak >= 30 ? "bg-orange-100" : "bg-gray-100 opacity-50"}`}
                >
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-sm font-semibold">Месяц</div>
                </div>
                <div
                  className={`p-4 rounded-lg text-center ${completedCourses >= 1 ? "bg-green-100" : "bg-gray-100 opacity-50"}`}
                >
                  <div className="text-3xl mb-2">🎓</div>
                  <div className="text-sm font-semibold">Первый курс</div>
                </div>
                <div
                  className={`p-4 rounded-lg text-center ${completedCourses >= 3 ? "bg-green-100" : "bg-gray-100 opacity-50"}`}
                >
                  <div className="text-3xl mb-2">🌟</div>
                  <div className="text-sm font-semibold">3 курса</div>
                </div>
                <div
                  className={`p-4 rounded-lg text-center ${completedCourses >= 6 ? "bg-green-100" : "bg-gray-100 opacity-50"}`}
                >
                  <div className="text-3xl mb-2">💎</div>
                  <div className="text-sm font-semibold">Все курсы</div>
                </div>
                <div
                  className={`p-4 rounded-lg text-center ${startedCourses >= 1 ? "bg-blue-100" : "bg-gray-100 opacity-50"}`}
                >
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm font-semibold">Начало пути</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
