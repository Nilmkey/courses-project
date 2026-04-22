"use client";

import { createContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import type {
  ICourse,
  ISection,
  ILesson,
  IBlock,
  IQuizAnswer,
} from "@/types/types";
import { progressApi, type BlockProgressResponse } from "@/lib/api/entities/api-progress";
import { useToast } from "@/hooks/useToast";

export type LessonStatus = "not-started" | "in-progress" | "completed";

export interface LessonProgressData {
  lessonId: string;
  status: LessonStatus;
  completedBlocks: number;
  totalBlocks: number;
  quizAnswers?: IQuizAnswer[];
  blocks?: BlockProgressResponse[];
  isCompleted?: boolean;
}

export interface LearningContextType {
  // Данные курса
  course: ICourse;
  sections: ISection[];

  // Прогресс по урокам
  lessonProgress: Record<string, LessonProgressData>;
  overallProgress: {
    totalLessons: number;
    completedLessons: number;
    totalBlocks: number;
    completedBlocks: number;
    totalSections: number;
    completedSections: number;
    progress: number;
  };

  // Текущий выбранный элемент
  currentSectionId: string | null;
  currentLessonId: string | null;
  currentBlockId: string | null;

  // Состояние загрузки
  isCompletingBlock: boolean;

  // Методы навигации
  navigateToBlock: (
    sectionId: string,
    lessonId: string,
    blockId: string
  ) => void;
  navigateToNextBlock: () => void;
  navigateToPreviousBlock: () => void;

  // Методы прогресса
  markLessonComplete: (lessonId: string) => Promise<void>;
  updateQuizAnswers: (
    lessonId: string,
    answers: IQuizAnswer[]
  ) => Promise<void>;
  resetLessonProgress: (lessonId: string) => Promise<void>;
  completeBlock: (
    lessonId: string,
    blockId: string,
    quizAnswers?: IQuizAnswer[]
  ) => Promise<void>;
  recalculateProgress: () => Promise<void>;

  // Утилиты
  getLessonStatus: (lessonId: string) => LessonStatus;
  getLessonProgress: (lessonId: string) => LessonProgressData | undefined;
  getCurrentBlock: IBlock | null;
  getCurrentLesson: ILesson | null;
  getCurrentSection: ISection | null;
}

interface LearningContextProviderProps {
  course: ICourse;
  sections: ISection[];
  initialProgress: {
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
  children: React.ReactNode;
}

export const LearningContext = createContext<LearningContextType | undefined>(
  undefined
);

export function LearningContextProvider({
  course,
  sections,
  initialProgress,
  children,
}: LearningContextProviderProps) {
  const toast = useToast();
  
  // Ref для debounce таймеров quiz-ответов
  const quizDebounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const [currentSectionId, setCurrentSectionId] = useState<string | null>(
    sections[0]?._id || null
  );
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);

  const [lessonProgress, setLessonProgress] = useState<
    Record<string, LessonProgressData>
  >({});

  const [overallProgress, setOverallProgress] = useState({
    totalLessons: initialProgress.totalLessons,
    completedLessons: initialProgress.completedLessons,
    totalBlocks: 0,
    completedBlocks: 0,
    totalSections: sections.length,
    completedSections: 0,
    progress: initialProgress.progress,
  });
  const [isCompletingBlock, setIsCompletingBlock] = useState(false);

  // Cleanup для debounce таймеров при размонтировании
  useEffect(() => {
    return () => {
      // Очищаем все таймеры при размонтировании
      Object.values(quizDebounceTimers.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  // Загрузка прогресса с сервера при монтировании
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Загружаем полный прогресс курса
        const progressDetail = await progressApi.getFullCourseProgress(course._id);

        // Инициализируем прогресс для всех уроков
        const progress: Record<string, LessonProgressData> = {};

        for (const section of sections) {
          for (const lesson of section.lessons) {
            // Проверяем, есть ли прогресс для этого урока
            const lessonProgressData = progressDetail.lessons.find(
              (l) => l.lesson_id === lesson._id
            );

            const isCompleted = lessonProgressData?.completed || false;
            const quizAnswers = lessonProgressData?.quizAnswers || [];
            const blocks = lessonProgressData?.blocks || [];
            const totalBlocks = lesson.content_blocks.length;

            // Считаем завершенные блоки из серверных данных
            const completedBlocksCount = lessonProgressData?.completedBlocksCount || 0;

            // Сохраняем прогресс
            let completedBlocks = completedBlocksCount;
            let status: LessonStatus = "not-started";
            let lessonIsCompleted = false;

            if (isCompleted) {
              // Урок завершен - все блоки пройдены
              completedBlocks = totalBlocks;
              status = "completed";
              lessonIsCompleted = true;
            } else if (completedBlocks > 0) {
              // Урок в процессе
              status = "in-progress";
              lessonIsCompleted = false;
            }

            progress[lesson._id] = {
              lessonId: lesson._id,
              status,
              completedBlocks,
              totalBlocks,
              quizAnswers,
              blocks,
              isCompleted: lessonIsCompleted,
            };
          }
        }

        // Обновляем общий прогресс из сервера
        setOverallProgress({
          totalLessons: progressDetail.stats.totalLessons,
          completedLessons: progressDetail.stats.completedLessons,
          totalBlocks: progressDetail.stats.totalBlocks,
          completedBlocks: progressDetail.stats.completedBlocks,
          totalSections: progressDetail.stats.totalSections,
          completedSections: progressDetail.stats.completedSections,
          progress: progressDetail.overallProgress,
        });

        setLessonProgress(progress);
      } catch (error) {
        console.error("Ошибка загрузки прогресса:", error);
        const progress: Record<string, LessonProgressData> = {};

        for (const section of sections) {
          for (const lesson of section.lessons) {
            progress[lesson._id] = {
              lessonId: lesson._id,
              status: "not-started",
              completedBlocks: 0,
              totalBlocks: lesson.content_blocks.length,
              quizAnswers: [],
              blocks: [],
              isCompleted: false,
            };
          }
        }

        setLessonProgress(progress);
        setOverallProgress({
          totalLessons: sections.reduce((acc, s) => acc + s.lessons.length, 0),
          completedLessons: 0,
          totalBlocks: 0,
          completedBlocks: 0,
          totalSections: sections.length,
          completedSections: 0,
          progress: 0,
        });
      }
    };

    loadProgress();
  }, [course._id, sections]);

  // Навигация к блоку
  const navigateToBlock = useCallback(
    (sectionId: string, lessonId: string, blockId: string) => {
      setCurrentSectionId(sectionId);
      setCurrentLessonId(lessonId);
      setCurrentBlockId(blockId);

      // Обновляем статус урока на "in-progress" если это первый блок
      setLessonProgress((prev) => {
        const current = prev[lessonId];
        if (current && current.status === "not-started") {
          return {
            ...prev,
            [lessonId]: {
              ...current,
              status: "in-progress",
            },
          };
        }
        return prev;
      });
    },
    []
  );

  // Поиск текущего блока в структуре - оптимизировано с useMemo
  const findBlockLocation = useMemo(() => {
    if (!currentLessonId || !currentBlockId || !currentSectionId) return null;

    const sIdx = sections.findIndex((s) => s._id === currentSectionId);
    if (sIdx === -1) return null;

    const section = sections[sIdx];
    const lIdx = section.lessons.findIndex((l) => l._id === currentLessonId);
    if (lIdx === -1) return null;

    const lesson = section.lessons[lIdx];
    const blockIdx = lesson.content_blocks.findIndex((b) => {
      const blockId = b.id || b._id;
      return blockId === currentBlockId;
    });
    if (blockIdx === -1) return null;

    return {
      sectionIndex: sIdx,
      lessonIndex: lIdx,
      blockIndex: blockIdx,
      section,
      lesson,
      block: lesson.content_blocks[blockIdx],
    };
  }, [sections, currentSectionId, currentLessonId, currentBlockId]);

  // Переход к следующему блоку
  const navigateToNextBlock = useCallback(() => {
    const location = findBlockLocation;
    if (!location) return;

    const { sectionIndex, lessonIndex, blockIndex, section, lesson } = location;

    // Есть ли следующий блок в этом же уроке?
    if (blockIndex < lesson.content_blocks.length - 1) {
      const nextBlock = lesson.content_blocks[blockIndex + 1];
      const nextBlockId = nextBlock.id || nextBlock._id || '';
      navigateToBlock(section._id, lesson._id, nextBlockId);
      return;
    }

    // Ищем следующий урок в этой секции
    if (lessonIndex < section.lessons.length - 1) {
      const nextLesson = section.lessons[lessonIndex + 1];
      if (nextLesson.content_blocks.length > 0) {
        const nextBlock = nextLesson.content_blocks[0];
        const nextBlockId = nextBlock.id || nextBlock._id || '';
        navigateToBlock(section._id, nextLesson._id, nextBlockId);
      }
      return;
    }

    // Ищем следующую секцию
    if (sectionIndex < sections.length - 1) {
      const nextSection = sections[sectionIndex + 1];
      if (nextSection.lessons.length > 0) {
        const nextLesson = nextSection.lessons[0];
        if (nextLesson.content_blocks.length > 0) {
          const nextBlock = nextLesson.content_blocks[0];
          const nextBlockId = nextBlock.id || nextBlock._id || '';
          navigateToBlock(nextSection._id, nextLesson._id, nextBlockId);
        }
      }
    }
  }, [findBlockLocation, navigateToBlock, sections]);

  // Переход к предыдущему блоку
  const navigateToPreviousBlock = useCallback(() => {
    const location = findBlockLocation;
    if (!location) return;

    const { sectionIndex, lessonIndex, blockIndex, section, lesson } = location;

    // Есть ли предыдущий блок в этом же уроке?
    if (blockIndex > 0) {
      const prevBlock = lesson.content_blocks[blockIndex - 1];
      const prevBlockId = prevBlock.id || prevBlock._id || '';
      navigateToBlock(section._id, lesson._id, prevBlockId);
      return;
    }

    // Ищем предыдущий урок в этой секции
    if (lessonIndex > 0) {
      const prevLesson = section.lessons[lessonIndex - 1];
      if (prevLesson.content_blocks.length > 0) {
        const prevBlock =
          prevLesson.content_blocks[prevLesson.content_blocks.length - 1];
        const prevBlockId = prevBlock.id || prevBlock._id || '';
        navigateToBlock(section._id, prevLesson._id, prevBlockId);
      }
      return;
    }

    // Ищем предыдущую секцию
    if (sectionIndex > 0) {
      const prevSection = sections[sectionIndex - 1];
      if (prevSection.lessons.length > 0) {
        const prevLesson =
          prevSection.lessons[prevSection.lessons.length - 1];
        if (prevLesson.content_blocks.length > 0) {
          const prevBlock =
            prevLesson.content_blocks[prevLesson.content_blocks.length - 1];
          const prevBlockId = prevBlock.id || prevBlock._id || '';
          navigateToBlock(prevSection._id, prevLesson._id, prevBlockId);
        }
      }
    }
  }, [findBlockLocation, navigateToBlock, sections]);

  // Отметить урок как пройденный (оптимистичное обновление)
  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      try {
        const courseId = course._id;

        // Обновляем локальное состояние СРАЗУ (оптимистичное обновление)
        setLessonProgress((prev) => {
          const current = prev[lessonId];
          if (!current) return prev;

          const updated = {
            ...current,
            status: "completed" as LessonStatus,
            isCompleted: true,
            completedBlocks: current.totalBlocks,
          };

          // Подсчитываем завершенные уроки
          const completedLessons = Object.values(prev).filter(
            (l) => l.isCompleted || l.lessonId === lessonId
          ).length;

          const totalLessons = Object.keys(prev).length;
          const progress = Math.round((completedLessons / totalLessons) * 100);

          setOverallProgress((prevProgress) => ({
            ...prevProgress,
            totalLessons,
            completedLessons,
            progress,
          }));

          return {
            ...prev,
            [lessonId]: updated,
          };
        });

        toast.success("Урок отмечен как пройденный!");

        // Отправляем на сервер (без await, чтобы не блокировать UI)
        progressApi.markLessonComplete(lessonId, courseId)
          .then((response) => {
            // Обновляем данные о блоках из ответа сервера
            if (response.blocks && response.blocks.length > 0) {
              setLessonProgress((prev) => {
                const current = prev[lessonId];
                if (!current) return prev;

                return {
                  ...prev,
                  [lessonId]: {
                    ...current,
                    blocks: response.blocks?.map((b) => ({
                      ...b,
                      completed: true,
                    })),
                  },
                };
              });
            }
          })
          .catch((error) => {
            // Игнорируем ошибки оптимистической блокировки MongoDB
            // Данные уже обновлены локально
            if (error?.data?.code === 'VERSION_ERROR' || error?.message?.includes('version')) {
              console.log("Конфликт версий MongoDB при завершении урока (ожидаемое поведение)");
            } else {
              console.error("Ошибка при сохранении урока:", error);
            }
          });

        // Автоматический переход к следующему блоку
        navigateToNextBlock();
      } catch (error) {
        console.error("Ошибка при отметке урока:", error);
        toast.error("Не удалось сохранить прогресс");
      }
    },
    [course._id, navigateToNextBlock, toast]
  );

  // Обновить ответы на quiz (с debounce для оптимизации)
  const updateQuizAnswers = useCallback(
    async (lessonId: string, answers: IQuizAnswer[]) => {
      // Очищаем предыдущий таймер для этого урока
      if (quizDebounceTimers.current[lessonId]) {
        clearTimeout(quizDebounceTimers.current[lessonId]);
      }

      // Обновляем локальное состояние СРАЗУ (оптимистичное обновление)
      setLessonProgress((prev) => {
        const current = prev[lessonId];
        if (!current) return prev;

        return {
          ...prev,
          [lessonId]: {
            ...current,
            quizAnswers: answers,
            status:
              current.status === "not-started"
                ? "in-progress"
                : current.status,
          },
        };
      });

      // Отправляем на сервер с задержкой (debounce 500мс)
      quizDebounceTimers.current[lessonId] = setTimeout(async () => {
        try {
          const courseId = course._id;

          await progressApi.updateLessonProgress(lessonId, {
            courseId,
            completed: false,
            quizAnswers: answers,
          });
        } catch (error) {
          console.error("Ошибка при сохранении ответов:", error);
          // Не показываем ошибку пользователю - это фоновое сохранение
        }
      }, 500);
    },
    [course._id]
  );

  // Сбросить прогресс урока
  const resetLessonProgress = useCallback(
    async (lessonId: string) => {
      try {
        const courseId = course._id;

        // Отправляем на сервер
        await progressApi.resetLessonProgress(lessonId, courseId);

        // Обновляем локальное состояние
        setLessonProgress((prev) => {
          const current = prev[lessonId];
          if (!current) return prev;

          const updated = {
            ...current,
            status: "not-started" as LessonStatus,
            isCompleted: false,
            completedBlocks: 0,
            quizAnswers: [],
          };

          // Подсчитываем завершенные уроки
          const completedLessons = Object.values(prev).filter(
            (l) => l.isCompleted && l.lessonId !== lessonId
          ).length;

          const totalLessons = Object.keys(prev).length;
          const progress = Math.round((completedLessons / totalLessons) * 100);

          setOverallProgress((prevProgress) => ({
            ...prevProgress,
            totalLessons,
            completedLessons,
            progress,
          }));

          return {
            ...prev,
            [lessonId]: updated,
          };
        });

        toast.success("Прогресс урока сброшен");
      } catch (error) {
        console.error("Ошибка при сбросе прогресса:", error);
        toast.error("Не удалось сбросить прогресс");
      }
    },
    [course._id, toast]
  );

  // Завершить блок (оптимистичное обновление UI)
  const completeBlock = useCallback(
    async (lessonId: string, blockId: string, quizAnswers?: IQuizAnswer[]) => {
      const courseId = course._id;

      // Обновляем локальное состояние СРАЗУ (без ожидания API)
      setLessonProgress((prev) => {
        const current = prev[lessonId];
        if (!current) return prev;

        // Проверяем, не был ли уже завершен этот блок
        const blockAlreadyCompleted = current.blocks?.some(
          (b) => b.blockId === blockId && b.completed
        );

        if (blockAlreadyCompleted) {
          // Блок уже завершен, не обновляем
          return prev;
        }

        const newCompletedBlocks = Math.min(current.completedBlocks + 1, current.totalBlocks);

        // Проверяем, все ли блоки пройдены
        const allBlocksCompleted = newCompletedBlocks >= current.totalBlocks;

        // Обновляем информацию о блоках
        const updatedBlocks = current.blocks?.map((b) =>
          b.blockId === blockId
            ? { ...b, completed: true, completedAt: new Date().toISOString() }
            : b
        );

        return {
          ...prev,
          [lessonId]: {
            ...current,
            completedBlocks: newCompletedBlocks,
            status: allBlocksCompleted ? "completed" : current.status,
            blocks: updatedBlocks,
          },
        };
      });

      // Отправляем на сервер (без await, чтобы не блокировать UI)
      progressApi.markBlockComplete(lessonId, courseId, {
        courseId,
        blockId,
        quizAnswers,
      })
        .catch((error) => {
          // Игнорируем ошибки оптимистической блокировки MongoDB
          // Это фоновое сохранение, данные уже обновлены локально
          if (error?.data?.code === 'VERSION_ERROR' || error?.message?.includes('version')) {
            console.log("Конфликт версий MongoDB (ожидаемое поведение):", blockId);
          } else {
            console.error("Ошибка при сохранении прогресса блока:", error);
          }
        });
    },
    [course._id]
  );

  // Пересчитать прогресс курса (при добавлении нового контента)
  const recalculateProgress = useCallback(async () => {
    try {
      const courseId = course._id;

      // Запрашиваем пересчет прогресса на сервере
      await progressApi.recalculateProgress(courseId);

      // Перезагружаем прогресс
      const progressDetail = await progressApi.getFullCourseProgress(courseId);

      // Обновляем локальное состояние
      const progress: Record<string, LessonProgressData> = {};

      for (const section of sections) {
        for (const lesson of section.lessons) {
          const lessonProgressData = progressDetail.lessons.find(
            (l) => l.lesson_id === lesson._id
          );

          const isCompleted = lessonProgressData?.completed || false;
          const quizAnswers = lessonProgressData?.quizAnswers || [];
          const blocks = lessonProgressData?.blocks || [];
          const totalBlocks = lesson.content_blocks.length;
          const completedBlocksCount = lessonProgressData?.completedBlocksCount || 0;

          let completedBlocks = completedBlocksCount;
          let status: LessonStatus = "not-started";
          let lessonIsCompleted = false;

          if (isCompleted) {
            completedBlocks = totalBlocks;
            status = "completed";
            lessonIsCompleted = true;
          } else if (completedBlocks > 0) {
            status = "in-progress";
            lessonIsCompleted = false;
          }

          progress[lesson._id] = {
            lessonId: lesson._id,
            status,
            completedBlocks,
            totalBlocks,
            quizAnswers,
            blocks,
            isCompleted: lessonIsCompleted,
          };
        }
      }

      setLessonProgress(progress);
      setOverallProgress({
        totalLessons: progressDetail.stats.totalLessons,
        completedLessons: progressDetail.stats.completedLessons,
        totalBlocks: progressDetail.stats.totalBlocks,
        completedBlocks: progressDetail.stats.completedBlocks,
        totalSections: progressDetail.stats.totalSections,
        completedSections: progressDetail.stats.completedSections,
        progress: progressDetail.overallProgress,
      });

      toast.success("Прогресс обновлен с учетом новых материалов");
    } catch (error) {
      console.error("Ошибка при пересчете прогресса:", error);
      toast.error("Не удалось обновить прогресс");
    }
  }, [course._id, sections, toast]);

  // Получить статус урока
  const getLessonStatus = useCallback(
    (lessonId: string): LessonStatus => {
      const progress = lessonProgress[lessonId];
      if (!progress) return "not-started";
      if (progress.isCompleted) return "completed";
      if (progress.status === "in-progress") return "in-progress";
      return "not-started";
    },
    [lessonProgress]
  );

  // Получить прогресс урока
  const getLessonProgress = useCallback(
    (lessonId: string): LessonProgressData | undefined => {
      return lessonProgress[lessonId];
    },
    [lessonProgress]
  );

  // Получить текущий блок (оптимизировано с useMemo)
  const getCurrentBlock = useMemo((): IBlock | null => {
    return findBlockLocation?.block || null;
  }, [findBlockLocation]);

  // Получить текущий урок (оптимизировано с useMemo)
  const getCurrentLesson = useMemo((): ILesson | null => {
    if (!currentLessonId) return null;

    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (lesson._id === currentLessonId) {
          return lesson;
        }
      }
    }
    return null;
  }, [sections, currentLessonId]);

  // Получить текущую секцию (оптимизировано с useMemo)
  const getCurrentSection = useMemo((): ISection | null => {
    return sections.find((s) => s._id === currentSectionId) || null;
  }, [sections, currentSectionId]);

  const value: LearningContextType = {
    course,
    sections,
    lessonProgress,
    overallProgress,
    currentSectionId,
    currentLessonId,
    currentBlockId,
    isCompletingBlock,
    navigateToBlock,
    navigateToNextBlock,
    navigateToPreviousBlock,
    markLessonComplete,
    updateQuizAnswers,
    resetLessonProgress,
    completeBlock,
    recalculateProgress,
    getLessonStatus,
    getLessonProgress,
    getCurrentBlock,
    getCurrentLesson,
    getCurrentSection,
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}
