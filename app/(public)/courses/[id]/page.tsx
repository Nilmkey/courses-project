"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { ICourse, ITag } from "@/types/types";
import { coursesApi } from "@/lib/api/entities/api-courses";
import { tagsApi } from "@/lib/api/entities/api-tags";
import {
  Code,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Clock,
  Trophy,
  Users,
  User,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";

const levelLabels: Record<string, string> = {
  beginner: "Начальный",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const durationMap: Record<string, string> = {
  beginner: "3 месяца",
  intermediate: "5 месяцев",
  advanced: "6 месяцев",
};

const gradientMap: Record<string, string> = {
  Layout: "from-blue-500 to-cyan-400",
  Server: "from-emerald-500 to-teal-400",
  Globe: "from-indigo-500 to-purple-400",
  Laptop: "from-violet-500 to-pink-400",
  Zap: "from-amber-500 to-orange-400",
  Code: "from-yellow-400 to-orange-500",
};

const iconColorMap: Record<string, string> = {
  Layout: "text-blue-500",
  Server: "text-emerald-500",
  Globe: "text-indigo-500",
  Laptop: "text-violet-500",
  Zap: "text-amber-500",
  Code: "text-yellow-500",
};

const iconMap: Record<string, React.ReactNode> = {
  Layout: <Code className="w-12 h-12" />,
  Server: <Code className="w-12 h-12" />,
  Globe: <Code className="w-12 h-12" />,
  Laptop: <Code className="w-12 h-12" />,
  Zap: <Code className="w-12 h-12" />,
  Code: <Code className="w-12 h-12" />,
};

export default function CoursePage() {
  const params = useParams();
  const toast = useToast();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [course, setCourse] = useState<ICourse | null>(null);
  const [tags, setTags] = useState<ITag[]>([]);
  const [loading, setLoading] = useState(true);

  const courseId = params.id as string;

  useEffect(() => {
    setMounted(true);
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesApi.getAll();
      const found = response.courses?.find((c) => c.slug === courseId);
      setCourse(found || null);
      
      // Загружаем теги курса
      if (found && found.tags && found.tags.length > 0) {
        const tagsResponse = await tagsApi.getAll();
        const courseTags = tagsResponse.tags.filter((tag) =>
          found.tags?.includes(tag._id)
        );
        setTags(courseTags);
      }
    } catch (err) {
      console.error("Ошибка загрузки курса:", err);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    if (!course) return;
    setIsBuying(true);
    setTimeout(() => {
      setIsBuying(false);
      toast.success(`Вы успешно приобрели курс: ${course.title}!`);
    }, 1500);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4">
          Курс не найден
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Похоже, вы перешли по неверной ссылке.
        </p>
        <Link href="/courses">
          <Button className="bg-[#3b5bdb] hover:bg-[#2f4bbf] text-white rounded-2xl">
            Вернуться к списку курсов
          </Button>
        </Link>
      </div>
    );
  }

  const gradient = gradientMap[course.iconName || "Code"];
  const iconColor = iconColorMap[course.iconName || "Code"];
  const duration = durationMap[course.level] || "3 месяца";

  const priceDisplay = course.price
    ? `${course.price.toLocaleString("ru-RU")} ₸`
    : "Бесплатно";

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
              <Code className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase dark:text-white">
              CodeLearn
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <Link href="/courses" className="text-blue-600">
              Курсы
            </Link>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Практика
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Сообщество
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}
            </button>

            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#3b5bdb] dark:text-slate-400 dark:hover:text-[#3b5bdb] font-bold text-sm transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Назад к курсам
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div
              className={`p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br ${gradient} relative overflow-hidden shadow-2xl shadow-blue-900/10 dark:shadow-none`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 flex flex-col items-start gap-6">
                <div className={`p-4 bg-white rounded-3xl shadow-lg ${iconColor}`}>
                  {course.iconName && iconMap[course.iconName]
                    ? iconMap[course.iconName]
                    : iconMap["Code"]}
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                    {course.title}
                  </h1>
                  
                  {/* Теги курса */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag._id}
                          className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold hover:bg-white/30 transition-colors cursor-default"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 shadow-sm">
                <Clock className="w-6 h-6 text-[#3b5bdb]" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Длительность
                </span>
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  {duration}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 shadow-sm">
                <Trophy className="w-6 h-6 text-[#3b5bdb]" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Сложность
                </span>
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  {levelLabels[course.level] || course.level}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 shadow-sm">
                <Users className="w-6 h-6 text-[#3b5bdb]" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Студентов
                </span>
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  {course._id ? "100+" : "0"}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">
                О курсе
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {course.description ||
                  "Этот курс поможет вам освоить новую профессию и начать карьеру в IT. Вы получите практические навыки и создадите проекты для портфолио."}
              </p>
            </div>
          </div>

          <div className="sticky top-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-900/10 dark:shadow-none flex flex-col gap-6">
              <div>
                <span className="text-sm font-black uppercase tracking-widest text-slate-400">
                  Стоимость курса
                </span>
                <div className="text-5xl font-black text-slate-800 dark:text-white mt-2 tracking-tight">
                  {priceDisplay}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#3b5bdb]" /> Полный
                  пожизненный доступ
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#3b5bdb]" /> Доступ с
                  любых устройств
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#3b5bdb]" /> Сертификат
                  об окончании
                </div>
              </div>

              {course.isPublished ? (
                <Button
                  onClick={handleBuy}
                  disabled={isBuying}
                  className="w-full h-16 bg-[#3b5bdb] hover:bg-[#2f4bbf] text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] mt-4"
                >
                  {isBuying ? (
                    "Обработка..."
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" /> Купить сейчас
                    </>
                  )}
                </Button>
              ) : (
                <div className="w-full h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-lg font-bold rounded-2xl flex items-center justify-center mt-4">
                  Ждем набора
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
