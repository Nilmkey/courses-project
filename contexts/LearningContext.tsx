"use client";

import { createContext, useState, useCallback, useMemo, useEffect } from "react";
import type {
  ICourse,
  ISection,
  ILesson,
  IBlock,
  IQuizAnswer,
} from "@/types/types";
import { progressApi } from "@/lib/api/entities/api-progress";
import { useToast } from "@/hooks/useToast";

export type LessonStatus = "not-started" | "in-progress" | "completed";

export interface LessonProgressData {
  lessonId: string;
  status: LessonStatus;
  completedBlocks: number;
  totalBlocks: number;
  quizAnswers?: IQuizAnswer[];
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
    progress: number;
  };

  // Текущий выбранный элемент
  currentSectionId: string | null;
  currentLessonId: string | null;
  currentBlockId: string | null;

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
  completeBlock: (lessonId: string, blockId: string) => Promise<void>;

  // Утилиты
  getLessonStatus: (lessonId: string) => LessonStatus;
  getLessonProgress: (lessonId: string) => LessonProgressData | undefined;
  getCurrentBlock: () => IBlock | null;
  getCurrentLesson: () => ILesson | null;
  getCurrentSection: () => ISection | null;
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

  const [currentSectionId, setCurrentSectionId] = useState<string | null>(
    sections[0]?._id || null
  );
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);

  const [lessonProgress, setLessonProgress] = useState<
    Record<string, LessonProgressData>
  >({});

  const [overallProgress, setOverallProgress] = useState(initialProgress);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Загрузка прогресса с сервера при монтировании
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setIsLoadingProgress(true);

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
            const totalBlocks = lesson.content_blocks.length;

            // Сохраняем прогресс
            let completedBlocks = 0;
            let status: LessonStatus = "not-started";
            let lessonIsCompleted = false;

            if (isCompleted) {
              // Урок завершен - все блоки пройдены
              completedBlocks = totalBlocks;
              status = "completed";
              lessonIsCompleted = true;
            } else if (lessonProgressData) {
              // Урок в процессе - начинаем с 0, пользователь продолжит прохождение
              completedBlocks = 0;
              status = "in-progress";
              lessonIsCompleted = false;
            }

            progress[lesson._id] = {
              lessonId: lesson._id,
              status,
              completedBlocks,
              totalBlocks,
              quizAnswers,
              isCompleted: lessonIsCompleted,
            };
          }
        }

        // Обновляем общий прогресс из сервера
        const completedLessons = progressDetail.lessons.filter(l => l.completed).length;
        const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        setOverallProgress({
          totalLessons,
          completedLessons,
          progress: progressPercent,
        });

        setLessonProgress(progress);
      } catch (error) {
        console.error("Ошибка загрузки прогресса:", error);
        // Инициализируем пустой прогресс при ошибке
        const progress: Record<string, LessonProgressData> = {};

        for (const section of sections) {
          for (const lesson of section.lessons) {
            progress[lesson._id] = {
              lessonId: lesson._id,
              status: "not-started",
              completedBlocks: 0,
              totalBlocks: lesson.content_blocks.length,
              quizAnswers: [],
              isCompleted: false,
            };
          }
        }

        setLessonProgress(progress);
        const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
        setOverallProgress({
          totalLessons,
          completedLessons: 0,
          progress: 0,
        });
      } finally {
        setIsLoadingProgress(false);
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

  // Поиск текущего блока в структуре
  const findBlockLocation = useCallback(() => {
    if (!currentLessonId || !currentBlockId) return null;

    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const section = sections[sIdx];
      if (section._id !== currentSectionId) continue;

      for (let lIdx = 0; lIdx < section.lessons.length; lIdx++) {
        const lesson = section.lessons[lIdx];
        if (lesson._id !== currentLessonId) continue;

        const blockIdx = lesson.content_blocks.findIndex(
          (b) => {
            const blockId = b.id || b._id;
            return blockId === currentBlockId;
          }
        );
        if (blockIdx === -1) continue;

        return {
          sectionIndex: sIdx,
          lessonIndex: lIdx,
          blockIndex: blockIdx,
          section,
          lesson,
          block: lesson.content_blocks[blockIdx],
        };
      }
    }
    return null;
  }, [sections, currentSectionId, currentLessonId, currentBlockId]);

  // Переход к следующему блоку
  const navigateToNextBlock = useCallback(() => {
    const location = findBlockLocation();
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
    const location = findBlockLocation();
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

  // Отметить урок как пройденный
  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      try {
        const courseId = course._id;

        // Отправляем на сервер
        await progressApi.markLessonComplete(lessonId, courseId);

        // Обновляем локальное состояние
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

          setOverallProgress({
            totalLessons,
            completedLessons,
            progress,
          });

          return {
            ...prev,
            [lessonId]: updated,
          };
        });

        toast.success("Урок отмечен как пройденный!");

        // Автоматический переход к следующему блоку
        setTimeout(() => {
          navigateToNextBlock();
        }, 500);
      } catch (error) {
        console.error("Ошибка при отметке урока:", error);
        toast.error("Не удалось сохранить прогресс");
      }
    },
    [course._id, navigateToNextBlock, toast]
  );

  // Обновить ответы на quiz
  const updateQuizAnswers = useCallback(
    async (lessonId: string, answers: IQuizAnswer[]) => {
      try {
        const courseId = course._id;

        // Отправляем на сервер
        await progressApi.updateLessonProgress(lessonId, {
          courseId,
          completed: false,
          quizAnswers: answers,
        });

        // Обновляем локальное состояние
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
      } catch (error) {
        console.error("Ошибка при сохранении ответов:", error);
        // Не показываем ошибку пользователю - это фоновое сохранение
      }
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

          setOverallProgress({
            totalLessons,
            completedLessons,
            progress,
          });

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

  // Завершить блок
  const completeBlock = useCallback(
    async (lessonId: string, blockId: string) => {
      // Обновляем локальное состояние - увеличиваем количество пройденных блоков
      setLessonProgress((prev) => {
        const current = prev[lessonId];
        if (!current) return prev;

        const newCompletedBlocks = Math.min(current.completedBlocks + 1, current.totalBlocks);
        
        // Проверяем, все ли блоки пройдены
        const allBlocksCompleted = newCompletedBlocks >= current.totalBlocks;

        return {
          ...prev,
          [lessonId]: {
            ...current,
            completedBlocks: newCompletedBlocks,
            status: allBlocksCompleted ? "completed" : current.status,
          },
        };
      });
    },
    []
  );

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

  // Получить текущий блок
  const getCurrentBlock = useCallback((): IBlock | null => {
    const location = findBlockLocation();
    return location?.block || null;
  }, [findBlockLocation]);

  // Получить текущий урок
  const getCurrentLesson = useCallback((): ILesson | null => {
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

  // Получить текущую секцию
  const getCurrentSection = useCallback((): ISection | null => {
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
    navigateToBlock,
    navigateToNextBlock,
    navigateToPreviousBlock,
    markLessonComplete,
    updateQuizAnswers,
    resetLessonProgress,
    completeBlock,
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
