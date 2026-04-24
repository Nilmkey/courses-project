"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { useLearning } from "@/frontend/hooks/useLearning";
import { authClient } from "@/frontend/lib/auth-client";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
}

export function CompletionButton() {
  const router = useRouter();
  const {
    currentLessonId,
    currentBlockId,
    markLessonComplete,
    completeBlock,
    getCurrentLesson,
    navigateToNextBlock,
    overallProgress,
    course,
  } = useLearning();

  const [isCompleted, setIsCompleted] = useState(false);

  // Сбрасываем состояние при переходе к новому блоку
  useEffect(() => {
    setIsCompleted(false);
  }, [currentBlockId, currentLessonId]);

  // Кэшируем вычисления с useMemo
  const { isLastBlock, isCourseCompleted } = useMemo(() => {
    const lesson = getCurrentLesson;
    const totalBlocks = lesson?.content_blocks.length || 0;

    const currentBlockIndex = lesson?.content_blocks.findIndex(
      (b) => (b.id || b._id) === currentBlockId,
    );

    // Курс завершен, если прогресс 100% после завершения этого урока
    const willBeCourseCompleted = overallProgress.progress >= 100;

    return {
      isLastBlock:
        currentBlockIndex !== undefined &&
        currentBlockIndex === totalBlocks - 1,
      isCourseCompleted: willBeCourseCompleted,
    };
  }, [getCurrentLesson, currentBlockId, overallProgress.progress]);

  // Обработчик с useCallback
  const handleClick = useCallback(async () => {
    if (!currentLessonId || !currentBlockId || isCompleted) return;

    // Мгновенная визуальная обратная связь
    setIsCompleted(true);

    if (isLastBlock) {
      // Для последнего блока вызываем только markLessonComplete
      // completeBlock не нужен, чтобы избежать конфликта версий MongoDB
      markLessonComplete(currentLessonId).catch((error) => {
        console.error("Ошибка при завершении урока:", error);
      });

      // Если курс завершен - перенаправляем на страницу сертификата
      if (isCourseCompleted) {
        // Получаем данные пользователя из сессии
        const session = await authClient.getSession();

        // Отладка в консоли
        console.log("Session data:", session);

        // better-auth возвращает данные в формате { data: { user: ... }, error: null }
        const user = session?.data?.user as SessionUser | null;

        console.log("User data:", user);
        console.log("User name:", user?.name);

        // Формируем URL с параметрами
        const queryParams = new URLSearchParams({
          courseName: course?.title || "Курс",
          userName: user?.name || user?.email?.split("@")[0] || "Пользователь",
        });

        // Перенаправляем на страницу сертификата
        router.push(`/courses/certificate?${queryParams.toString()}`);
      } else {
        // Сбрасываем состояние через небольшую задержку
        setTimeout(() => setIsCompleted(false), 1000);
      }
    } else {
      // Для обычных блоков вызываем completeBlock + навигацию
      completeBlock(currentLessonId, currentBlockId);
      navigateToNextBlock();
    }
  }, [
    currentLessonId,
    currentBlockId,
    isCompleted,
    isLastBlock,
    isCourseCompleted,
    markLessonComplete,
    completeBlock,
    navigateToNextBlock,
    router,
    course,
  ]);

  // Кэшируем текст кнопки
  const buttonText = useMemo(() => {
    if (isCompleted) {
      if (isCourseCompleted) return "Поздравляем!";
      return isLastBlock ? "Завершение..." : "Переход...";
    }
    return isCourseCompleted
      ? "🎉 Завершить курс"
      : isLastBlock
        ? "Завершить блок и урок"
        : "Завершить блок";
  }, [isCompleted, isLastBlock, isCourseCompleted]);

  return (
    <button
      onClick={handleClick}
      disabled={isCompleted && !isCourseCompleted}
      className={`flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-3 bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/25 active:scale-95 disabled:active:scale-100 dark:bg-green-600 dark:hover:bg-green-700 w-full md:w-auto ${
        isCompleted && !isCourseCompleted
          ? "bg-green-700 cursor-wait"
          : isCourseCompleted
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 animate-pulse"
            : "hover:bg-green-700"
      }`}
    >
      {isCompleted && !isCourseCompleted ? (
        <>
          <Loader2 className="md:hidden animate-spin" size={18} />
          <Loader2 className="hidden md:block animate-spin" size={20} />
        </>
      ) : isCourseCompleted ? (
        <>
          <CheckCircle className="md:hidden" size={20} />
          <CheckCircle className="hidden md:block text-white" size={24} />
        </>
      ) : (
        <>
          <CheckCircle className="md:hidden" size={18} />
          <CheckCircle className="hidden md:block" size={20} />
        </>
      )}
      <span className="text-sm md:text-base">{buttonText}</span>
      {!isLastBlock && !isCompleted && !isCourseCompleted && (
        <ArrowRight size={16} className="hidden md:block ml-1" />
      )}
    </button>
  );
}
