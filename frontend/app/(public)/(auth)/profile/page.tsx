"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ExtendedUser } from "../../../../../backend/auth";
import { authClient } from "@/lib/auth-client";
import { ApiError } from "@/lib/api/api-client";
import { API_BASE_URL } from "@/config/config";
import { useToast } from "@/hooks/useToast";
import {
  enrollmentApi,
  EnrollmentWithProgress,
} from "@/lib/api/entities/api-enrollment";
import { useStreak } from "@/hooks/useStreak";
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
  const [enrolledCourses, setEnrolledCourses] = useState<
    EnrollmentWithProgress[]
  >([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [_isUploading, setIsUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [hasLoadedCourses, setHasLoadedCourses] = useState(false);
  const toast = useToast();

  const user = session?.user as unknown as ExtendedUser | undefined;

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

    if (session?.user && !loadingCourses && !hasLoadedCourses) {
      loadEnrolledCourses();
    }
  }, [session, isPending, router, loadingCourses, hasLoadedCourses]);

  const loadEnrolledCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const enrollments = await enrollmentApi.getMyCoursesWithProgress();
      console.log("=== Enrolled Courses Debug ===", enrollments);
      setEnrolledCourses(enrollments || []);
      setHasLoadedCourses(true);
    } catch (error) {
      console.error("Ошибка загрузки курсов:", error);
      setEnrolledCourses([]);
      setHasLoadedCourses(true);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  if (!mounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase animate-pulse">
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
          enrolledCourses.reduce(
            (sum, e) => sum + (e.status === "completed" ? 100 : 0),
            0,
          ) / startedCourses,
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

    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5MB");
      return;
    }

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 flex flex-col selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/courses"
            className="group flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-colors">
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
            </div>
            <span className="hidden sm:inline tracking-wide">К курсам</span>
          </Link>

          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-2 ring-indigo-100 dark:ring-indigo-900">
              <Code size={18} className="text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight dark:text-white text-slate-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              CodeLearn
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-700 dark:hover:text-rose-300 transition-all duration-300 shadow-sm hover:shadow-rose-500/10"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline tracking-wide">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-10 grow pb-24">
        {/* The Profile Header Block */}
        <div className="relative rounded-[2.5rem] bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden group/header">
          {/* Banner Header */}
          <div className="h-48 md:h-64 w-full relative overflow-hidden bg-indigo-600">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mix-blend-multiply dark:mix-blend-normal opacity-90" />
            <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-blue-400/50 rounded-full blur-[100px] mix-blend-screen animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-0 right-0 w-[20rem] h-[20rem] bg-pink-400/50 rounded-full blur-[80px] mix-blend-screen block" />
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Content Below Banner */}
          <div className="px-6 pb-8 sm:px-10 sm:pb-10 relative">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end -mt-16 sm:-mt-20">
              {/* Avatar Container */}
              <div className="relative shrink-0 transition-transform duration-500 group-hover/header:translate-y-[-4px]">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-indigo-500/10 dark:shadow-[0_0_40px_rgba(79,70,229,0.15)] ring-1 ring-slate-100 dark:ring-slate-800">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative group">
                    {currentAvatar ? (
                      <Image
                        src={currentAvatar}
                        alt="User"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <User size={64} className="text-slate-400" />
                    )}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-indigo-900/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-lg transition-transform hover:scale-110">
                        <Camera size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {currentAvatar && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-transform hover:scale-110 shadow-lg shadow-red-500/30 ring-4 ring-white dark:ring-slate-900 z-10"
                    title="Удалить аватар"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 w-full mb-2 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2 drop-shadow-sm">
                      {session.user.name}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
                      {session.user.email}
                    </p>
                  </div>

                  {userRole === "admin" ? (
                    <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 hover:from-amber-500 to-orange-500 hover:to-orange-600 text-white text-sm font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-500/30 shrink-0 transition-colors">
                      <ShieldCheck size={20} /> Administrator
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest rounded-2xl ring-1 ring-indigo-200 dark:ring-indigo-500/30 shrink-0 transition-colors shadow-sm">
                      <Sparkles size={20} /> Student Target
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10">
          <div className="xl:col-span-4 flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <div className="col-span-2">
                <StreakStatCard />
              </div>
              <StatCard
                icon={
                  <Target
                    size={24}
                    className="text-indigo-600 dark:text-indigo-400 drop-shadow-sm"
                  />
                }
                bg="bg-indigo-100 dark:bg-indigo-500/20"
                value={startedCourses}
                label="Активные"
              />
              <StatCard
                icon={
                  <Trophy
                    size={24}
                    className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
                  />
                }
                bg="bg-emerald-100 dark:bg-emerald-500/20"
                value={completedCourses}
                label="Пройдено"
              />
              <div className="col-span-2">
                <StatCard
                  icon={
                    <Code
                      size={24}
                      className="text-violet-600 dark:text-violet-400 drop-shadow-sm"
                    />
                  }
                  bg="bg-violet-100 dark:bg-violet-500/20"
                  value={totalPercentage}
                  suffix="%"
                  label="Общий прогресс"
                />
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 flex flex-col">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white ring-4 ring-indigo-50 dark:ring-indigo-500/10">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Моё обучение
                </h2>
              </div>
              {startedCourses > 0 && (
                <Link href="/courses" className="group flex flex-col items-end">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                    Каталог{" "}
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </Link>
              )}
            </div>

            <div className="flex flex-col gap-4 sm:gap-5">
              {loadingCourses ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-[2rem] ring-1 ring-slate-200/50 dark:ring-slate-800/50 backdrop-blur-sm">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-6 animate-pulse">
                    Подготовка...
                  </p>
                </div>
              ) : startedCourses === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none min-h-[400px]">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center shadow-inner mb-6 ring-1 ring-slate-200 dark:ring-slate-700">
                    <BookOpen size={40} className="text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 dark:text-white text-slate-900 tracking-tight">
                    Нет активных курсов
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 max-w-xs text-center">
                    Вы еще не начали свое обучение. Выберите подходящий курс в
                    нашем каталоге.
                  </p>
                  <Link
                    href="/courses"
                    className="px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-600/40 active:scale-95"
                  >
                    Перейти в каталог
                  </Link>
                </div>
              ) : (
                enrolledCourses.map((enrollment) => {
                  const course = enrollment.course;
                  if (!course) return null;

                  const courseId = course.slug || course._id;
                  const info = coursesInfo[courseId] || coursesInfo.html;
                  const isCompleted = enrollment.status === "completed";
                  const progress = enrollment.progress?.progress || 0;

                  const totalSections = (course as any).sections?.length || 0;
                  const completedSections = isCompleted
                    ? totalSections
                    : Math.floor((progress / 100) * totalSections);

                  return (
                    <div
                      key={enrollment._id}
                      className="group relative p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-[2rem] ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-indigo-500/50 dark:hover:ring-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-6 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 w-full">
                        <div
                          className={`w-16 h-16 shrink-0 rounded-[1.5rem] bg-gradient-to-br ${info.gradient} p-[2px] shadow-lg ${info.shadow} group-hover:scale-105 transition-transform duration-300`}
                        >
                          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[1.4rem] flex items-center justify-center text-3xl relative overflow-hidden">
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-20`}
                            />
                            {info.icon}
                          </div>
                        </div>

                        <div className="flex-1 w-full min-w-0 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-extrabold text-xl text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-full">
                                {course.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1.5 text-sm font-bold text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <BookOpen
                                    size={16}
                                    className="text-slate-400 dark:text-slate-500"
                                  />
                                  <span>
                                    {enrollment.progress?.completedLessons || 0}{" "}
                                    / {enrollment.progress?.totalLessons || 0}{" "}
                                    уроков
                                  </span>
                                </span>
                                {totalSections > 0 && (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
                                    <span className="flex items-center gap-1.5">
                                      <Target
                                        size={16}
                                        className="text-slate-400 dark:text-slate-500"
                                      />
                                      <span>
                                        {completedSections} / {totalSections}{" "}
                                        секций
                                      </span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div
                              className={`shrink-0 px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm ring-1 ring-inset ${isCompleted ? "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/20" : "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ring-slate-200 dark:ring-slate-700"}`}
                            >
                              {isCompleted ? "Завершён" : `${progress}%`}
                            </div>
                          </div>

                          <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden self-end inset-shadow-sm">
                            <div
                              className={`absolute h-full bg-gradient-to-r ${isCompleted ? "from-emerald-400 to-emerald-500" : info.gradient} transition-all duration-1000 ease-out`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                          <Link
                            href={`/learn/${course.slug || course._id}`}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-wide rounded-2xl transition-all duration-300 active:scale-95 ${
                              isCompleted
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40"
                            }`}
                          >
                            {isCompleted ? "Повторить" : "Продолжить"}
                            <ChevronRight
                              size={18}
                              className={isCompleted ? "" : "text-indigo-200"}
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-auto z-10 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <div className="flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Code size={16} />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              CodeLearn
            </span>
          </div>
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} CodeLearn. Все права защищены.
          </p>
          <div className="flex gap-6 text-slate-400 font-bold text-xs">
            <a
              href="#"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Политика
            </a>
            <a
              href="#"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
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
  value?: string | number;
  label: string;
  suffix?: string;
  customContent?: React.ReactNode;
}

function StatCard({
  icon,
  bg,
  value,
  label,
  suffix,
  customContent,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden flex flex-col p-6 rounded-[2rem] bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:-translate-y-1 hover:ring-indigo-500/50 dark:hover:ring-indigo-500/50 transition-all duration-300 cursor-default">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div
        className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-6 ring-4 ring-white dark:ring-slate-900 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
      >
        {icon}
      </div>

      {customContent ? (
        customContent
      ) : (
        <div className="mt-auto">
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
            {value}{" "}
            {suffix && (
              <span className="text-xl font-bold text-slate-500 dark:text-slate-400">
                {suffix}
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1.5">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

function StreakStatCard() {
  const { count, isLoading } = useStreak();

  return (
    <div
      className={`relative overflow-hidden flex flex-col p-6 rounded-[2rem] bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:-translate-y-1 hover:ring-orange-500/50 dark:hover:ring-orange-500/50 transition-all duration-300 cursor-default`}
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div
        className={`w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-6 ring-4 ring-white dark:ring-slate-900 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
      >
        <Flame
          size={28}
          className="text-orange-500 dark:text-orange-400 drop-shadow-sm"
        />
      </div>

      <div className="mt-auto">
        <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
          {isLoading ? "..." : Number(count || 0)}
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1.5">
          дней подряд
        </div>
      </div>
    </div>
  );
}
