"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ExtendedUser } from "@/backend/auth";
import { authClient } from "@/lib/auth-client";
import { ApiError } from "@/lib/api/api-client";
import { API_BASE_URL } from "@/config/config";
import { Toaster } from "react-hot-toast";
import { useToast } from "@/hooks/useToast";
import { enrollmentApi, EnrollmentResponse } from "@/lib/api/entities/api-enrollment";
import {
  Code,
  Flame,
  Trophy,
  Target,
  ArrowLeft,
  User,
  Loader2,
  LogOut,
  BookOpen,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Camera,
  Trash2,
} from "lucide-react";

interface CourseInfo {
  title: string;
  gradient: string;
  text: string;
  shadow: string;
  icon: string;
}

const coursesInfo: Record<string, CourseInfo> = {
  html: {
    title: "HTML Основы",
    gradient: "from-orange-400 via-orange-500 to-amber-500",
    text: "text-orange-600",
    shadow: "shadow-orange-500/20",
    icon: "🌐",
  },
  css: {
    title: "CSS Стилизация",
    gradient: "from-blue-400 via-blue-500 to-cyan-500",
    text: "text-blue-600",
    shadow: "shadow-blue-500/20",
    icon: "🎨",
  },
  javascript: {
    title: "JavaScript",
    gradient: "from-yellow-400 via-yellow-500 to-orange-500",
    text: "text-yellow-700",
    shadow: "shadow-yellow-500/20",
    icon: "⚡",
  },
  python: {
    title: "Python",
    gradient: "from-emerald-400 via-emerald-500 to-teal-500",
    text: "text-emerald-600",
    shadow: "shadow-emerald-500/20",
    icon: "🐍",
  },
  csharp: {
    title: "C#",
    gradient: "from-purple-400 via-purple-500 to-violet-500",
    text: "text-purple-600",
    shadow: "shadow-purple-500/20",
    icon: "💜",
  },
  cpp: {
    title: "C++",
    gradient: "from-indigo-400 via-indigo-500 to-blue-600",
    text: "text-indigo-600",
    shadow: "shadow-indigo-500/20",
    icon: "⚙️",
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [_isUploading, setIsUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const toast = useToast();

  const user = session?.user as unknown as ExtendedUser | undefined;

  // Инициализируем currentAvatar при загрузке сессии
  useEffect(() => {
    if (session?.user) {
      const extendedUser = session.user as unknown as ExtendedUser;
      setCurrentAvatar(extendedUser.image ?? null);
    }
  }, [session]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user && enrolledCourses.length === 0 && !loadingCourses) {
      loadEnrolledCourses();
    }
  }, [session, isPending, router, enrolledCourses.length, loadingCourses]);

  const loadEnrolledCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const response = await enrollmentApi.getMyCourses();
      console.log("=== Enrolled Courses Debug ===", response);
      setEnrolledCourses(response.enrollments || []);
    } catch (error) {
      console.error("Ошибка загрузки курсов:", error);
      setEnrolledCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  if (!mounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f5ff] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#3b5bdb]" />
          <p className="text-sm font-medium text-slate-400 tracking-[0.2em] uppercase animate-pulse">
            Загрузка профиля
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userRole = (session.user as { role?: string }).role || "user";
  const startedCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(
    (e) => e.status === "completed",
  ).length;
  const totalPercentage =
    startedCourses > 0
      ? Math.round(
          enrolledCourses.reduce((sum, e) => sum + (e.status === "completed" ? 100 : 0), 0) /
            startedCourses,
        )
      : 0;

  const handleLogout = () => {
    toast.confirm(
      "Вы точно хотите выйти из аккаунта?",
      async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.success("Вы успешно вышли из аккаунта.");
              router.push("/");
            },
          },
        });
      },
      {
        confirmText: "Выйти",
        confirmClassName: "bg-red-600 hover:bg-red-500",
      },
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    // Сразу загружаем аватар
    handleUploadAvatar(file);
  };

  const handleUploadAvatar = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${API_BASE_URL}/v1/users/avatar`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }));
        throw new ApiError(errorData.message, response.status, errorData);
      }

      const data = await response.json();

      // Сразу обновляем аватар в UI
      setCurrentAvatar(data.avatar);
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast.success("Аватар успешно загружен");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Ошибка при загрузке аватара";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    toast.confirm(
      "Вы уверены, что хотите удалить аватар?",
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/v1/users/avatar`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: response.statusText,
            }));
            throw new ApiError(errorData.message, response.status, errorData);
          }

          // Сразу удаляем аватар из UI
          setCurrentAvatar(null);

          toast.success("Аватар успешно удалён");
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : "Ошибка при удалении аватара";
          toast.error(message);
        }
      },
      {
        confirmText: "Удалить",
        confirmClassName: "bg-red-600 hover:bg-red-500",
      },
    );
  };


  return (
    <div className="min-h-screen bg-[#f0f5ff] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
            color: resolvedTheme === "dark" ? "#f1f5f9" : "#0f172a",
            border:
              resolvedTheme === "dark"
                ? "1px solid #1e293b"
                : "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          },
        }}
      />
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-indigo-100/50 dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/courses"
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#3b5bdb] transition-colors"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-slate-800 transition-colors">
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
            </div>
            <span className="hidden sm:inline">К курсам</span>
          </Link>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 bg-[#3b5bdb] rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Code size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase dark:text-white">
              CodeLearn
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-full hover:bg-rose-100 transition-all active:scale-95"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 mt-8 space-y-8 grow pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-2rem shadow-xl shadow-indigo-900/5 border border-white dark:border-slate-800 overflow-hidden">
          <div className="h-32 bg-linear-to-br from-[#3b5bdb] via-[#5c7cfa] to-[#74c0fc] relative">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="px-6 pb-6 sm:px-10">
            <div className="flex flex-col items-center sm:flex-row sm:items-end -mt-12 gap-4">
              <div className="relative">
                <div className="p-1.5 rounded-full bg-white dark:bg-slate-900 shadow-xl shadow-indigo-900/10">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-indigo-100 dark:border-slate-700 overflow-hidden relative group">
                    {currentAvatar ? (
                      <Image
                        src={currentAvatar}
                        alt="User"
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={44} className="text-[#3b5bdb]" />
                    )}

                    {/* Оверлей для загрузки при наведении */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <Camera className="text-white" size={32} />
                    </div>
                  </div>
                </div>

                {/* Скрытый input для файла */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Кнопка удаления аватара */}
                {currentAvatar && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg border-2 border-white dark:border-slate-900 z-10"
                    title="Удалить аватар"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left mb-2 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight break-words">
                    {session.user.name}
                  </h1>

                  {userRole === "admin" ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-500/20 shrink-0">
                      <ShieldCheck size={12} /> Admin
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-[#3b5bdb] text-[10px] font-bold uppercase tracking-widest rounded-lg border border-indigo-100/50 dark:border-indigo-500/20 shrink-0">
                      <Sparkles size={12} /> Student
                    </div>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium break-all">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Flame size={22} className="text-orange-500" />}
            bg="bg-orange-50 dark:bg-orange-500/10"
            border="border-orange-100 dark:border-orange-500/20"
            value={user?.streak || 0}
            label="Дней подряд"
          />
          <StatCard
            icon={<Target size={22} className="text-[#3b5bdb]" />}
            bg="bg-indigo-50 dark:bg-indigo-500/10"
            border="border-indigo-100 dark:border-indigo-500/20"
            value={startedCourses}
            label="Активные курсы"
          />
          <StatCard
            icon={<Trophy size={22} className="text-emerald-500" />}
            bg="bg-emerald-50 dark:bg-emerald-500/10"
            border="border-emerald-100 dark:border-emerald-500/20"
            value={completedCourses}
            label="Завершено"
          />
          <StatCard
            icon={<Code size={22} className="text-violet-500" />}
            bg="bg-violet-50 dark:bg-violet-500/10"
            border="border-violet-100 dark:border-violet-500/20"
            value={`${totalPercentage}%`}
            label="Прогресс"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-white dark:border-slate-800 shadow-xl shadow-indigo-900/5 overflow-hidden">
          <div className="px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3b5bdb] to-[#5c7cfa] flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold dark:text-white">
                Моё обучение
              </h2>
            </div>
            {startedCourses > 0 && (
              <Link
                href="/courses"
                className="text-sm font-semibold text-[#3b5bdb] hover:underline decoration-2 underline-offset-4"
              >
                Каталог
              </Link>
            )}
          </div>

          <div className="p-6 sm:p-8 bg-slate-50/30 dark:bg-slate-900/30 min-h-[300px]">
            {loadingCourses ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-[#3b5bdb]" />
                <p className="text-sm font-medium text-slate-400 mt-4">
                  Загрузка курсов...
                </p>
              </div>
            ) : startedCourses === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100 dark:border-slate-700">
                  <BookOpen size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold mb-2 dark:text-white">
                  Курсы не найдены
                </h3>
                <Link
                  href="/courses"
                  className="px-8 py-3.5 text-sm font-bold text-white bg-[#3b5bdb] rounded-xl hover:bg-[#2f4bbf] transition-all"
                >
                  Начать обучение
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((enrollment) => {
                  const course = enrollment.course;
                  if (!course) return null;
                  
                  // Пытаемся найти информацию о курсе по slug или используем дефолтную
                  const courseId = course.slug || course._id;
                  const info = coursesInfo[courseId] || coursesInfo.html;
                  const isCompleted = enrollment.status === "completed";

                  return (
                    <div
                      key={enrollment._id}
                      className="group relative flex flex-col sm:flex-row sm:items-center gap-5 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 shadow-sm transition-all duration-300"
                    >
                      <div
                        className={`w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br ${info.gradient} p-[1px] ${info.shadow}`}
                      >
                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[11px] flex items-center justify-center text-2xl relative overflow-hidden">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-10`}
                          />
                          {info.icon}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-lg leading-tight group-hover:text-[#3b5bdb] transition-colors dark:text-white">
                            {course.title}
                          </h4>
                          <span className={`font-bold ${isCompleted ? 'text-emerald-600' : info.text}`}>
                            {isCompleted ? 'Завершён' : 'В процессе'}
                          </span>
                        </div>
                        <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full bg-gradient-to-r ${isCompleted ? 'from-emerald-500 to-teal-500' : info.gradient} transition-all duration-1000`}
                            style={{ width: isCompleted ? '100%' : '30%' }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Link
                          href={`/learn/${course.slug}`}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#3b5bdb] bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-[#3b5bdb] hover:text-white transition-all"
                        >
                          {isCompleted ? 'Повторить' : 'Продолжить'} <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              CodeLearn
            </span>
          </div>
          <p>© {new Date().getFullYear()} CodeLearn. Все права защищены.</p>
          <div className="flex gap-6 text-slate-400 font-bold text-sm">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Политика
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Условия
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  bg: string;
  border: string;
  value: string | number;
  label: string;
  suffix?: string;
}

function StatCard({ icon, bg, border, value, label, suffix }: StatCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-slate-900 border ${border} shadow-sm transition-all duration-300 hover:-translate-y-1 group`}
    >
      <div
        className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
        {value} {suffix && <span className="text-lg">{suffix}</span>}
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}
