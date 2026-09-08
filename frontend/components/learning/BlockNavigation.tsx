"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { useLearning } from "@/hooks/useLearning";
import { authClient } from "@/lib/auth-client";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
}

interface BlockNavigationProps {
  canProceed?: boolean;
  onProceed?: () => Promise<void> | void;
  className?: string;
}

export function BlockNavigation({
  canProceed = true,
  onProceed,
  className = "",
}: BlockNavigationProps) {
  const router = useRouter();
  const {
    course,
    currentLessonId,
    currentBlockId,
    hasPreviousBlock,
    hasNextBlock,
    isLastBlockInLesson,
    isLastBlockInCourse,
    nextStepInfo,
    prevStepInfo,
    isCurrentBlockCompleted,
    currentBlockIndex,
    totalBlocksInCurrentLesson,
    navigateToPreviousBlock,
    navigateToNextBlock,
    completeBlock,
    markLessonComplete,
  } = useLearning();

  const [isLoading, setIsLoading] = useState(false);

  // Переход к странице сертификата
  const goToCertificate = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      const user = session?.data?.user as SessionUser | null;
      const queryParams = new URLSearchParams({
        courseName: course?.title || "Курс",
        userName: user?.name || user?.email?.split("@")[0] || "Пользователь",
      });
      router.push(`/courses/certificate?${queryParams.toString()}`);
    } catch (err) {
      console.error("Ошибка при переходе к сертификату:", err);
      router.push("/courses/certificate");
    }
  }, [course?.title, router]);

  // Обработчик кнопки «Вперёд / Завершить»
  const handleNextClick = useCallback(async () => {
    if (!canProceed || isLoading) return;

    setIsLoading(true);

    try {
      if (onProceed) {
        await onProceed();
      }

      // СЛУЧАЙ 1: Блок УЖЕ был пройден ранее
      if (isCurrentBlockCompleted) {
        if (isLastBlockInCourse) {
          await goToCertificate();
        } else {
          // Чистый переход БЕЗ вызова API завершения и БЕЗ триггера стрика!
          navigateToNextBlock();
        }
        setIsLoading(false);
        return;
      }

      // СЛУЧАЙ 2: Блок завершается ВПЕРВЫЕ
      if (!currentLessonId || !currentBlockId) {
        setIsLoading(false);
        return;
      }

      if (isLastBlockInCourse) {
        // Финал курса: отмечаем урок завершённым и идём к сертификату
        await markLessonComplete(currentLessonId);
        await goToCertificate();
      } else if (isLastBlockInLesson) {
        // Последний блок в уроке: отмечаем урок пройденным (он сам вызовет navigateToNextBlock)
        await markLessonComplete(currentLessonId);
      } else {
        // Обычный блок внутри урока: завершаем блок и переходим дальше
        await completeBlock(currentLessonId, currentBlockId);
        navigateToNextBlock();
      }
    } catch (error) {
      console.error("Ошибка при навигации:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    canProceed,
    isLoading,
    onProceed,
    isCurrentBlockCompleted,
    isLastBlockInCourse,
    isLastBlockInLesson,
    currentLessonId,
    currentBlockId,
    goToCertificate,
    navigateToNextBlock,
    markLessonComplete,
    completeBlock,
  ]);

  // Определение текста и внешнего вида кнопки действия
  const actionButtonConfig = useMemo(() => {
    if (!canProceed) {
      return {
        text: "Сначала выполните задание",
        icon: <Lock size={18} className="flex-shrink-0" />,
        className:
          "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/60 dark:border-slate-700/60",
        disabled: true,
      };
    }

    if (isLoading) {
      return {
        text: "Переход...",
        icon: <Loader2 size={18} className="animate-spin flex-shrink-0" />,
        className:
          "bg-indigo-600 text-white cursor-wait opacity-80 shadow-lg shadow-indigo-500/20",
        disabled: true,
      };
    }

    // Если блок уже пройден:
    if (isCurrentBlockCompleted) {
      if (isLastBlockInCourse) {
        return {
          text: "К сертификату 🎉",
          icon: <Trophy size={18} className="flex-shrink-0 text-yellow-300" />,
          className:
            "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/25 active:scale-95",
          disabled: false,
        };
      }
      if (isLastBlockInLesson) {
        return {
          text: "К следующему уроку",
          icon: <ArrowRight size={18} className="flex-shrink-0 ml-0.5" />,
          className:
            "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 active:scale-95",
          disabled: false,
        };
      }
      return {
        text: "К следующему шагу",
        icon: <ArrowRight size={18} className="flex-shrink-0 ml-0.5" />,
        className:
          "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 active:scale-95",
        disabled: false,
      };
    }

    // Если блок проходится впервые:
    if (isLastBlockInCourse) {
      return {
        text: "Завершить курс 🎉",
        icon: <Trophy size={18} className="flex-shrink-0 text-yellow-200" />,
        className:
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white shadow-xl shadow-emerald-500/25 active:scale-95",
        disabled: false,
      };
    }

    if (isLastBlockInLesson) {
      return {
        text: "Завершить урок и далее",
        icon: <ArrowRight size={18} className="flex-shrink-0 ml-0.5" />,
        className:
          "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 active:scale-95",
        disabled: false,
      };
    }

    return {
      text: "Завершить шаг и далее",
      icon: <ArrowRight size={18} className="flex-shrink-0 ml-0.5" />,
      className:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 active:scale-95",
      disabled: false,
    };
  }, [
    canProceed,
    isLoading,
    isCurrentBlockCompleted,
    isLastBlockInCourse,
    isLastBlockInLesson,
  ]);

  return (
    <div
      className={`mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Кнопка «Назад» */}
        <button
          onClick={navigateToPreviousBlock}
          disabled={!hasPreviousBlock || isLoading}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border w-full sm:w-auto justify-center ${
            hasPreviousBlock && !isLoading
              ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm active:scale-95"
              : "opacity-40 border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed"
          }`}
          title={
            prevStepInfo?.title
              ? `Предыдущий шаг: ${prevStepInfo.title}`
              : "Предыдущий шаг"
          }
        >
          <ChevronLeft size={18} className="flex-shrink-0" />
          <span>Назад</span>
          {prevStepInfo?.title && (
            <span className="hidden lg:inline text-xs font-normal text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
              ({prevStepInfo.title})
            </span>
          )}
        </button>

        {/* Индикатор текущего шага и статус */}
        <div className="flex items-center gap-2.5 text-center order-first sm:order-none">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Шаг {currentBlockIndex + 1} из {totalBlocksInCurrentLesson}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          {isCurrentBlockCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
              Пройдено
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
              <Sparkles size={12} className="text-slate-400" />
              В процессе
            </span>
          )}
        </div>

        {/* Кнопка «Вперёд / Завершить» */}
        <button
          onClick={handleNextClick}
          disabled={actionButtonConfig.disabled}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all w-full sm:w-auto ${actionButtonConfig.className}`}
          title={
            nextStepInfo?.title
              ? `Следующий шаг: ${nextStepInfo.title}`
              : actionButtonConfig.text
          }
        >
          <span>{actionButtonConfig.text}</span>
          {actionButtonConfig.icon}
        </button>
      </div>

      {/* Подсказка о следующем шаге */}
      {nextStepInfo?.title && canProceed && (
        <div className="mt-3 text-center sm:text-right">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {nextStepInfo.isCourseEnd
              ? "🎉 Финальный шаг курса"
              : nextStepInfo.isNewLesson
                ? `Далее новый урок: `
                : `Далее: `}
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              {nextStepInfo.title}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
