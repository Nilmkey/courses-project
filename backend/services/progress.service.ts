import { Progress, Lesson, Section, Course, Enrollment } from "../models";
import type { IProgress, IQuizAnswer, IBlockProgress, ILessonProgress, ISectionProgress } from "../models";
import { Types, Document } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { streakService } from "./streak.service";

export interface QuizAnswerInput {
  questionId: string;
  selectedAnswer: number | number[] | string;
  isCorrect: boolean;
}

export interface BlockProgressInput {
  blockId: string;
  completed: boolean;
  quizAnswers?: QuizAnswerInput[];
}

export interface LessonProgressInput {
  lesson_id: string | Types.ObjectId;
  completed: boolean;
  quizAnswers?: QuizAnswerInput[];
  blocks?: BlockProgressInput[];
}

export interface CourseProgressResult {
  totalLessons: number;
  completedLessons: number;
  totalBlocks: number;
  completedBlocks: number;
  totalSections: number;
  completedSections: number;
  progress: number;
}

export interface CourseProgressDetail {
  _id: string;
  user_id: string;
  course_id: string;
  lessons: Array<{
    lesson_id: string;
    completed: boolean;
    completedAt?: string;
    quizAnswers?: QuizAnswerInput[];
    blocks?: Array<{
      blockId: string;
      completed: boolean;
      completedAt?: string;
      quizAnswers?: QuizAnswerInput[];
    }>;
    completedBlocksCount: number;
    totalBlocksCount: number;
  }>;
  sections: Array<{
    section_id: string;
    completed: boolean;
    completedAt?: string;
    completedLessonsCount: number;
    totalLessonsCount: number;
  }>;
  overallProgress: number;
  stats: {
    totalBlocks: number;
    completedBlocks: number;
    totalLessons: number;
    completedLessons: number;
    totalSections: number;
    completedSections: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Проверка: существует ли урок и принадлежит ли он курсу
 */
async function validateLessonBelongsToCourse(
  lessonId: string,
  courseId: string,
): Promise<void> {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw ApiError.notFound(`Урок с ID ${lessonId} не найден`);
  }

  const section = await Section.findById(lesson.section_id);
  if (!section) {
    throw ApiError.notFound(`Секция для урока ${lessonId} не найдена`);
  }

  if (section.course_id.toString() !== courseId) {
    throw ApiError.badRequest(
      `Урок ${lessonId} не принадлежит курсу ${courseId}`,
    );
  }
}

/**
 * Получить структуру курса (секции, уроки, блоки)
 */
async function getCourseStructure(courseId: string): Promise<{
  sections: Array<{
    _id: Types.ObjectId;
    title: string;
    lessons: Array<{
      _id: Types.ObjectId;
      title: string;
      content_blocks: Array<{ id: string; type: string }>;
    }>;
  }>;
  totalLessons: number;
  totalBlocks: number;
}> {
  const sections = await Section.find({ course_id: courseId }).lean();
  const sectionIds = sections.map((s) => s._id);

  const lessons = await Lesson.find({ section_id: { $in: sectionIds } })
    .select('_id section_id title content_blocks')
    .lean();

  let totalBlocks = 0;
  const sectionsWithLessons = sections.map(section => ({
    _id: section._id,
    title: section.title,
    lessons: lessons
      .filter(l => l.section_id.toString() === section._id.toString())
      .map(lesson => {
        totalBlocks += lesson.content_blocks?.length || 0;
        return {
          _id: lesson._id,
          title: lesson.title,
          content_blocks: lesson.content_blocks?.map(b => ({
            id: b.id,
            type: b.type,
          })) || [],
        };
      }),
  }));

  return {
    sections: sectionsWithLessons,
    totalLessons: lessons.length,
    totalBlocks,
  };
}

/**
 * Инициализация или обновление структуры прогресса при изменении курса
 * Добавляет новые секции, уроки и блоки, сохраняя существующий прогресс
 * Также удаляет секции, уроки и блоки, которых больше нет в курсе
 */
async function syncProgressWithCourseStructure(
  progressDoc: IProgress,
  courseStructure: {
    sections: Array<{
      _id: Types.ObjectId;
      lessons: Array<{
        _id: Types.ObjectId;
        content_blocks: Array<{ id: string; type: string }>;
      }>;
    }>;
    totalLessons: number;
    totalBlocks: number;
  },
): Promise<IProgress> {
  const sections = courseStructure.sections;
  const currentSectionIds = new Set(sections.map(s => s._id.toString()));
  
  // Удаляем секции, которых больше нет в курсе
  progressDoc.sections = progressDoc.sections.filter(s => {
    const exists = currentSectionIds.has(s.section_id.toString());
    if (!exists) {
      console.log(`[Progress Sync] Removed deleted section: ${s.section_id}`);
    }
    return exists;
  });

  // Удаляем уроки, которых больше нет в курсе (из основного массива lessons)
  const currentLessonIds = new Set(
    sections.flatMap(s => s.lessons.map(l => l._id.toString()))
  );
  progressDoc.lessons = progressDoc.lessons.filter(l => {
    const exists = currentLessonIds.has(l.lesson_id.toString());
    if (!exists) {
      console.log(`[Progress Sync] Removed deleted lesson: ${l.lesson_id}`);
    }
    return exists;
  });

  // Синхронизация секций
  for (const section of sections) {
    let sectionProgress = progressDoc.sections.find(
      (s) => s.section_id.toString() === section._id.toString()
    );

    if (!sectionProgress) {
      // Новая секция - создаем прогресс
      sectionProgress = {
        section_id: section._id,
        completed: false,
        completedLessonsCount: 0,
        totalLessonsCount: section.lessons.length,
        lessonProgress: [],
      };
      progressDoc.sections.push(sectionProgress);
    } else {
      // Обновляем количество уроков в секции
      sectionProgress.totalLessonsCount = section.lessons.length;
    }

    // Удаляем уроки, которых больше нет в этой секции
    const currentLessonIdsInSection = new Set(
      section.lessons.map(l => l._id.toString())
    );
    sectionProgress.lessonProgress = sectionProgress.lessonProgress.filter(l => {
      const exists = currentLessonIdsInSection.has(l.lesson_id.toString());
      if (!exists) {
        console.log(`[Progress Sync] Removed deleted lesson from section: ${l.lesson_id}`);
      }
      return exists;
    });

    // Синхронизация уроков в секции
    for (const lesson of section.lessons) {
      let lessonProgress = sectionProgress.lessonProgress.find(
        (l) => l.lesson_id.toString() === lesson._id.toString()
      );

      if (!lessonProgress) {
        // Новый урок - создаем прогресс
        lessonProgress = {
          lesson_id: lesson._id,
          completed: false,
          blocks: [],
          completedBlocksCount: 0,
          totalBlocksCount: lesson.content_blocks.length,
        };
        sectionProgress.lessonProgress.push(lessonProgress);

        // Добавляем также в основной массив lessons (для обратной совместимости)
        const mainLessonProgress = progressDoc.lessons.find(
          (l) => l.lesson_id.toString() === lesson._id.toString()
        );
        if (!mainLessonProgress) {
          progressDoc.lessons.push(lessonProgress);
        }
      } else {
        // Урок существует - обновляем количество блоков
        
        // Запоминаем, сколько блоков было до синхронизации
        const oldTotalBlocks = lessonProgress.totalBlocksCount;
        
        // Удаляем блоки, которых больше нет в уроке
        const currentBlockIds = new Set(lesson.content_blocks.map(b => b.id));
        lessonProgress.blocks = lessonProgress.blocks.filter(b => {
          const exists = currentBlockIds.has(b.blockId);
          if (!exists) {
            console.log(`[Progress Sync] Removed deleted block: ${b.blockId}`);
          }
          return exists;
        });
        
        // Обновляем количество блоков
        lessonProgress.totalBlocksCount = lesson.content_blocks.length;

        // Синхронизация блоков (добавляем новые)
        let newBlocksAdded = false;
        for (const block of lesson.content_blocks) {
          const blockId = block.id;
          let blockProgress = lessonProgress.blocks.find(
            (b) => b.blockId === blockId
          );

          if (!blockProgress) {
            // Новый блок - создаем прогресс
            blockProgress = {
              blockId: blockId,
              completed: false,
            };
            lessonProgress.blocks.push(blockProgress);
            newBlocksAdded = true;
          }
        }
        
        // Если добавлены новые блоки - сбрасываем статус завершенности урока
        if (newBlocksAdded && lessonProgress.completed) {
          console.log(`[Progress Sync] Lesson ${lesson._id} has new blocks, marking as incomplete`);
          lessonProgress.completed = false;
          lessonProgress.completedAt = undefined;
        }

        // Пересчитываем completedBlocksCount
        lessonProgress.completedBlocksCount = lessonProgress.blocks.filter(
          (b) => b.completed
        ).length;
      }
    }

    // Пересчитываем completedLessonsCount для секции
    sectionProgress.completedLessonsCount = sectionProgress.lessonProgress.filter(
      (l) => l.completed
    ).length;
    
    // Если в секции есть незавершенные уроки, сбрасываем завершенность секции
    if (sectionProgress.completedLessonsCount < sectionProgress.totalLessonsCount && sectionProgress.completed) {
      console.log(`[Progress Sync] Section ${sectionProgress.section_id} has incomplete lessons, marking as incomplete`);
      sectionProgress.completed = false;
      sectionProgress.completedAt = undefined;
    }
  }

  // Обновляем общую статистику
  progressDoc.stats.totalSections = sections.length;
  progressDoc.stats.totalLessons = courseStructure.totalLessons;
  progressDoc.stats.totalBlocks = courseStructure.totalBlocks;
  
  // Если в курсе есть незавершенные секции, пересчитываем общую завершенность
  progressDoc.stats.completedSections = progressDoc.sections.filter(
    (s) => s.completed
  ).length;
  progressDoc.stats.completedLessons = progressDoc.lessons.filter(
    (l) => l.completed
  ).length;
  progressDoc.stats.completedBlocks = progressDoc.lessons.reduce((acc, l) => 
    acc + l.blocks.filter((b) => b.completed).length, 0
  );

  return progressDoc;
}

/**
 * Расчет общего прогресса курса на основе структуры
 */
async function calculateOverallProgress(
  userId: string,
  courseId: string,
  courseStructure?: {
    sections: Array<{
      _id: Types.ObjectId;
      lessons: Array<{
        _id: Types.ObjectId;
        content_blocks: Array<{ id: string; type: string }>;
      }>;
    }>;
    totalLessons: number;
    totalBlocks: number;
  },
): Promise<CourseProgressResult> {
  if (!courseStructure) {
    courseStructure = await getCourseStructure(courseId);
  }

  const progressDoc = await Progress.findOne({
    user_id: userId,
    course_id: courseId,
  });

  if (!progressDoc) {
    return {
      totalLessons: courseStructure.totalLessons,
      completedLessons: 0,
      totalBlocks: courseStructure.totalBlocks,
      completedBlocks: 0,
      totalSections: courseStructure.sections.length,
      completedSections: 0,
      progress: 0,
    };
  }

  // Считаем завершенные секции
  const completedSections = progressDoc.sections.filter(
    (s) => s.completed
  ).length;

  // Считаем завершенные уроки
  const completedLessons = progressDoc.lessons.filter(
    (l) => l.completed
  ).length;

  // Считаем завершенные блоки
  const completedBlocks = progressDoc.lessons.reduce((acc, lesson) => {
    return acc + lesson.blocks.filter((b) => b.completed).length;
  }, 0);

  // Расчет прогресса на основе завершенных уроков (основная метрика)
  const progress = courseStructure.totalLessons > 0
    ? Math.round((completedLessons / courseStructure.totalLessons) * 100)
    : 0;

  return {
    totalLessons: courseStructure.totalLessons,
    completedLessons,
    totalBlocks: courseStructure.totalBlocks,
    completedBlocks,
    totalSections: courseStructure.sections.length,
    completedSections,
    progress,
  };
}

/**
 * Инициализация прогресса для пользователя при записи на курс
 */
async function initializeProgressIfNotExists(
  userId: string,
  courseId: string,
): Promise<void> {
  const exists = await Progress.findOne({
    user_id: userId,
    course_id: courseId,
  });

  if (!exists) {
    const courseStructure = await getCourseStructure(courseId);

    const sections: ISectionProgress[] = courseStructure.sections.map(section => ({
      section_id: section._id,
      completed: false,
      completedLessonsCount: 0,
      totalLessonsCount: section.lessons.length,
      lessonProgress: section.lessons.map(lesson => ({
        lesson_id: lesson._id,
        completed: false,
        blocks: lesson.content_blocks.map(block => ({
          blockId: block.id,
          completed: false,
        })),
        completedBlocksCount: 0,
        totalBlocksCount: lesson.content_blocks.length,
      })),
    }));

    const lessons: ILessonProgress[] = sections.flatMap(s => s.lessonProgress);

    await Progress.create({
      user_id: userId,
      course_id: courseId,
      lessons,
      sections,
      overallProgress: 0,
      stats: {
        totalBlocks: courseStructure.totalBlocks,
        completedBlocks: 0,
        totalLessons: courseStructure.totalLessons,
        completedLessons: 0,
        totalSections: courseStructure.sections.length,
        completedSections: 0,
      },
    });
  }
}

/**
 * Обновление статуса enrollment при изменении прогресса
 */
async function updateEnrollmentStatus(
  userId: string,
  courseId: string,
  progressPercent: number,
): Promise<void> {
  const courseObjId = new Types.ObjectId(courseId);

  if (progressPercent === 100) {
    await Enrollment.findOneAndUpdate(
      { user_id: userId, course_id: courseObjId },
      {
        status: "completed",
        completedAt: new Date(),
      },
    );
  } else {
    await Enrollment.findOneAndUpdate(
      { user_id: userId, course_id: courseObjId },
      {
        status: "active",
        completedAt: undefined,
      },
    );
  }
}

/**
 * Обновление статистики и прогресса документа
 */
async function updateProgressStats(
  progressDoc: IProgress,
  courseStructure: {
    totalLessons: number;
    totalBlocks: number;
    sections: Array<{ _id: Types.ObjectId }>;
  },
): Promise<void> {
  const completedLessons = progressDoc.lessons.filter(l => l.completed).length;
  const completedBlocks = progressDoc.lessons.reduce((acc, l) => 
    acc + l.blocks.filter(b => b.completed).length, 0
  );
  const completedSections = progressDoc.sections.filter(s => s.completed).length;

  progressDoc.stats.completedLessons = completedLessons;
  progressDoc.stats.completedBlocks = completedBlocks;
  progressDoc.stats.completedSections = completedSections;
  progressDoc.stats.totalLessons = courseStructure.totalLessons;
  progressDoc.stats.totalBlocks = courseStructure.totalBlocks;
  progressDoc.stats.totalSections = courseStructure.sections.length;

  progressDoc.overallProgress = courseStructure.totalLessons > 0
    ? Math.round((completedLessons / courseStructure.totalLessons) * 100)
    : 0;

  // Обновляем completedLessonsCount в каждой секции
  for (const section of progressDoc.sections) {
    section.completedLessonsCount = section.lessonProgress.filter(l => l.completed).length;
    section.totalLessonsCount = section.lessonProgress.length;
  }

  await progressDoc.save();
}

/**
 * Пересчитать прогресс конкретного пользователя при изменении курса
 */
async function recalculateUserProgress(
  studentId: string,
  courseId: string,
): Promise<IProgress | null> {
  const progress = await Progress.findOne({
    user_id: studentId,
    course_id: courseId,
  });

  if (!progress) {
    return null;
  }

  const courseStructure = await getCourseStructure(courseId);
  await syncProgressWithCourseStructure(progress, courseStructure);
  await updateProgressStats(progress, courseStructure);

  await updateEnrollmentStatus(studentId, courseId, progress.overallProgress);

  return progress;
}

export const progressService = {
  /**
   * Получить полный прогресс пользователя по курсу с деталями
   */
  async getFullCourseProgress(
    studentId: string,
    courseId: string,
  ): Promise<CourseProgressDetail | null> {
    const course = await Course.findById(courseId);
    if (!course) {
      return null;
    }

    const courseStructure = await getCourseStructure(courseId);

    let progressDoc = await Progress.findOne({
      user_id: studentId,
      course_id: courseId,
    }).lean();

    if (!progressDoc) {
      await initializeProgressIfNotExists(studentId, courseId);
      progressDoc = await Progress.findOne({
        user_id: studentId,
        course_id: courseId,
      }).lean();

      if (!progressDoc) {
        return null;
      }
    }

    // Синхронизируем структуру прогресса с актуальной структурой курса
    // Это добавит новые секции/уроки/блоки если они были добавлены
    const progressDocFull = await Progress.findOne({
      user_id: studentId,
      course_id: courseId,
    });

    if (progressDocFull) {
      await syncProgressWithCourseStructure(progressDocFull, courseStructure);
      await updateProgressStats(progressDocFull, courseStructure);
      progressDoc = await Progress.findOne({
        user_id: studentId,
        course_id: courseId,
      }).lean();
    }

    // Гарантируем наличие массивов
    const lessons = progressDoc?.lessons || [];
    const sections = progressDoc?.sections || [];
    const stats = progressDoc?.stats || {
      totalBlocks: 0,
      completedBlocks: 0,
      totalLessons: 0,
      completedLessons: 0,
      totalSections: 0,
      completedSections: 0,
    };

    if (!progressDoc) {
      return null;
    }

    return {
      _id: progressDoc._id.toString(),
      user_id: progressDoc.user_id.toString(),
      course_id: progressDoc.course_id.toString(),
      lessons: lessons.map((l) => ({
        lesson_id: l.lesson_id.toString(),
        completed: l.completed,
        completedAt: l.completedAt?.toISOString(),
        quizAnswers: l.quizAnswers?.map((a) => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect,
        })),
        blocks: l.blocks ? l.blocks.map((b) => ({
          blockId: b.blockId,
          completed: b.completed,
          completedAt: b.completedAt?.toISOString(),
          quizAnswers: b.quizAnswers?.map((a) => ({
            questionId: a.questionId,
            selectedAnswer: a.selectedAnswer,
            isCorrect: a.isCorrect,
          })),
        })) : [],
        completedBlocksCount: l.completedBlocksCount || 0,
        totalBlocksCount: l.totalBlocksCount || 0,
      })),
      sections: sections.map((s) => ({
        section_id: s.section_id.toString(),
        completed: s.completed,
        completedAt: s.completedAt?.toISOString(),
        completedLessonsCount: s.completedLessonsCount || 0,
        totalLessonsCount: s.totalLessonsCount || 0,
      })),
      overallProgress: progressDoc.overallProgress || 0,
      stats,
      createdAt:
        (progressDoc as any).createdAt?.toISOString() ||
        new Date().toISOString(),
      updatedAt:
        (progressDoc as any).updatedAt?.toISOString() ||
        new Date().toISOString(),
    };
  },

  /**
   * Получить прогресс по конкретному уроку
   */
  async getLessonProgress(
    studentId: string,
    lessonId: string,
    courseId: string,
  ): Promise<{ quizAnswers: IQuizAnswer[]; blocks: IBlockProgress[] } | null> {
    await validateLessonBelongsToCourse(lessonId, courseId);

    const progressDoc = await Progress.findOne({
      user_id: studentId,
      course_id: courseId,
    });

    if (!progressDoc || !progressDoc.lessons) {
      return null;
    }

    const lessonProgress = progressDoc.lessons.find(
      (l) => l.lesson_id.toString() === lessonId,
    );

    if (!lessonProgress) {
      return null;
    }

    return {
      quizAnswers: lessonProgress.quizAnswers || [],
      blocks: lessonProgress.blocks || [],
    };
  },

  /**
   * Отметить урок как пройденный
   */
  async markComplete(
    studentId: string,
    lessonId: string,
    courseId: string,
    headers?: Headers,
  ): Promise<IProgress | null> {
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    let progress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
    });

    if (!progress) {
      await initializeProgressIfNotExists(studentId, courseId);
      progress = await Progress.findOne({
        user_id: studentId,
        course_id: courseObjId,
      });
    }

    if (!progress) {
      return null;
    }

    // Находим урок в прогрессе
    const lessonProgress = progress.lessons.find(
      (l) => l.lesson_id.toString() === lessonId
    );

    if (lessonProgress) {
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
      
      // Отмечаем все блоки как завершенные
      for (const block of lessonProgress.blocks) {
        if (!block.completed) {
          block.completed = true;
          block.completedAt = new Date();
        }
      }
      lessonProgress.completedBlocksCount = lessonProgress.blocks.length;
    } else {
      // Урок не найден в прогрессе - создаем запись
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        const newLessonProgress: ILessonProgress = {
          lesson_id: lessonObjId,
          completed: true,
          completedAt: new Date(),
          blocks: lesson.content_blocks.map(block => ({
            blockId: block.id,
            completed: true,
            completedAt: new Date(),
          })),
          completedBlocksCount: lesson.content_blocks.length,
          totalBlocksCount: lesson.content_blocks.length,
        };
        progress.lessons.push(newLessonProgress);
      }
    }

    // Продлеваем стрик пользователя после успешного сохранения прогресса
    try {
      await streakService.extendStreak(studentId, headers);
    } catch (error) {
      // Логгируем ошибку, но не прерываем основной поток
      console.error("[Progress] Не удалось обновить стрик:", error);
    }

    // Синхронизируем со структурой курса и пересчитываем статистику
    const courseStructure = await getCourseStructure(courseId);
    await syncProgressWithCourseStructure(progress, courseStructure);
    await updateProgressStats(progress, courseStructure);

    // Обновляем статус enrollment
    await updateEnrollmentStatus(studentId, courseId, progress.overallProgress);

    return progress;
  },

  /**
   * Сбросить прогресс урока
   */
  async resetProgress(
    studentId: string,
    lessonId: string,
    courseId: string,
  ): Promise<IProgress | null> {
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    const progress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
      "lessons.lesson_id": lessonObjId,
    });

    if (!progress) {
      return null;
    }

    const lessonProgress = progress.lessons.find(
      (l) => l.lesson_id.toString() === lessonId
    );

    if (lessonProgress) {
      lessonProgress.completed = false;
      lessonProgress.completedAt = undefined;
      lessonProgress.quizAnswers = [];
      lessonProgress.completedBlocksCount = 0;
      
      // Сбрасываем все блоки
      for (const block of lessonProgress.blocks) {
        block.completed = false;
        block.completedAt = undefined;
        block.quizAnswers = undefined;
      }
    }

    // Синхронизируем со структурой курса и пересчитываем статистику
    const courseStructure = await getCourseStructure(courseId);
    await syncProgressWithCourseStructure(progress, courseStructure);
    await updateProgressStats(progress, courseStructure);

    await updateEnrollmentStatus(studentId, courseId, progress.overallProgress);

    return progress;
  },

  /**
   * Получить сводный прогресс курса
   */
  async getCourseProgress(
    studentId: string,
    courseId: string,
  ): Promise<CourseProgressResult | null> {
    const course = await Course.findById(courseId);
    if (!course) {
      return null;
    }

    return await calculateOverallProgress(studentId, courseId);
  },

  /**
   * Обновить прогресс урока (например, ответы на quiz)
   */
  async updateLessonProgress(
    studentId: string,
    lessonId: string,
    courseId: string,
    data: LessonProgressInput,
  ): Promise<IProgress | null> {
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    let progress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
    });

    if (!progress) {
      await initializeProgressIfNotExists(studentId, courseId);
      progress = await Progress.findOne({
        user_id: studentId,
        course_id: courseObjId,
      });
    }

    if (!progress) {
      return null;
    }

    let lessonProgress = progress.lessons.find(
      (l) => l.lesson_id.toString() === lessonId
    );

    if (!lessonProgress) {
      // Создаем новый прогресс урока
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return null;
      }

      lessonProgress = {
        lesson_id: lessonObjId,
        completed: data.completed,
        completedAt: data.completed ? new Date() : undefined,
        quizAnswers: data.quizAnswers?.map((a) => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect,
        })),
        blocks: lesson.content_blocks.map(block => ({
          blockId: block.id,
          completed: false,
        })),
        completedBlocksCount: 0,
        totalBlocksCount: lesson.content_blocks.length,
      };

      progress.lessons.push(lessonProgress);
    } else {
      // Обновляем существующий прогресс
      lessonProgress.completed = data.completed;
      if (data.completed) {
        lessonProgress.completedAt = new Date();
      }

      if (data.quizAnswers && data.quizAnswers.length > 0) {
        lessonProgress.quizAnswers = data.quizAnswers.map((a) => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect,
        }));
      }
    }

    // Синхронизируем со структурой курса и пересчитываем статистику
    const courseStructure = await getCourseStructure(courseId);
    await syncProgressWithCourseStructure(progress, courseStructure);
    await updateProgressStats(progress, courseStructure);

    await updateEnrollmentStatus(studentId, courseId, progress.overallProgress);

    return progress;
  },

  /**
   * Отметить блок как завершенный
   */
  async markBlockComplete(
    studentId: string,
    lessonId: string,
    courseId: string,
    blockId: string,
    quizAnswers?: QuizAnswerInput[],
  ): Promise<IProgress | null> {
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    // Сначала пробуем найти существующий прогресс и обновить блок
    let progress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
      'lessons.lesson_id': lessonObjId,
    });

    if (progress) {
      // Находим урок в прогрессе
      const lessonProgress = progress.lessons.find(
        (l) => l.lesson_id.toString() === lessonId
      );

      if (lessonProgress) {
        // Находим блок
        const blockProgress = lessonProgress.blocks.find(
          (b) => b.blockId === blockId
        );

        if (blockProgress) {
          // Отмечаем блок как завершенный
          blockProgress.completed = true;
          blockProgress.completedAt = new Date();
          
          if (quizAnswers && quizAnswers.length > 0) {
            blockProgress.quizAnswers = quizAnswers.map((a) => ({
              questionId: a.questionId,
              selectedAnswer: a.selectedAnswer,
              isCorrect: a.isCorrect,
            }));
          }

          // Пересчитываем completedBlocksCount
          lessonProgress.completedBlocksCount = lessonProgress.blocks.filter(
            (b) => b.completed
          ).length;

          // Если все блоки завершены - автоматически отмечаем урок как завершенный
          if (lessonProgress.completedBlocksCount === lessonProgress.totalBlocksCount && lessonProgress.totalBlocksCount > 0) {
            lessonProgress.completed = true;
            lessonProgress.completedAt = new Date();
          }

          await progress.save();

          // Пересчитываем общую статистику асинхронно
          recalculateUserProgress(studentId, courseId).catch(console.error);

          return progress;
        }
      }
    }

    // Если прогресс не найден или блок не найден, инициализируем
    await initializeProgressIfNotExists(studentId, courseId);
    
    // Теперь обновляем блок
    const updatedProgress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
      'lessons.lesson_id': lessonObjId,
    });

    if (updatedProgress) {
      const lessonProgress = updatedProgress.lessons.find(
        (l) => l.lesson_id.toString() === lessonId
      );

      if (lessonProgress) {
        const blockProgress = lessonProgress.blocks.find(
          (b) => b.blockId === blockId
        );

        if (blockProgress) {
          blockProgress.completed = true;
          blockProgress.completedAt = new Date();
          
          if (quizAnswers && quizAnswers.length > 0) {
            blockProgress.quizAnswers = quizAnswers.map((a) => ({
              questionId: a.questionId,
              selectedAnswer: a.selectedAnswer,
              isCorrect: a.isCorrect,
            }));
          }

          lessonProgress.completedBlocksCount = lessonProgress.blocks.filter(
            (b) => b.completed
          ).length;

          if (lessonProgress.completedBlocksCount === lessonProgress.totalBlocksCount && lessonProgress.totalBlocksCount > 0) {
            lessonProgress.completed = true;
            lessonProgress.completedAt = new Date();
          }

          await updatedProgress.save();
          await recalculateUserProgress(studentId, courseId);

          return updatedProgress;
        }
      }
    }

    return null;
  },

  /**
   * Инициализировать прогресс при записи на курс
   */
  async initializeProgress(studentId: string, courseId: string): Promise<void> {
    await initializeProgressIfNotExists(studentId, courseId);
  },

  /**
   * Пересчитать прогресс всех пользователей при изменении курса
   * (добавлены секции, уроки или блоки)
   * 
   * Ключевая особенность: сохраняет весь существующий прогресс пользователей,
   * добавляя только новые элементы с статусом "не начат"
   */
  async recalculateCourseProgress(courseId: string): Promise<{
    updatedUsers: number;
    message: string;
  }> {
    // Получаем актуальную структуру курса
    const courseStructure = await getCourseStructure(courseId);

    // Получаем все прогрессы пользователей по этому курсу
    const allProgresses = await Progress.find({ course_id: courseId });

    let updatedUsers = 0;

    for (const progress of allProgresses) {
      try {
        // Синхронизируем структуру прогресса с актуальной структурой курса
        await syncProgressWithCourseStructure(progress, courseStructure);
        
        // Пересчитываем статистику и общий прогресс
        await updateProgressStats(progress, courseStructure);

        // Если прогресс 100% - обновляем статус enrollment
        if (progress.overallProgress === 100) {
          await Enrollment.findOneAndUpdate(
            { user_id: progress.user_id, course_id: courseId },
            {
              status: 'completed',
              completedAt: new Date(),
            }
          );
        } else {
          // Если меньше 100% - ставим active
          await Enrollment.findOneAndUpdate(
            { user_id: progress.user_id, course_id: courseId },
            {
              status: 'active',
              completedAt: undefined,
            }
          );
        }

        updatedUsers++;
      } catch (error) {
        console.error(
          `[Progress] Ошибка пересчета прогресса для пользователя ${progress.user_id}:`,
          error
        );
      }
    }

    return {
      updatedUsers,
      message: `Прогресс пересчитан для ${updatedUsers} пользователей`,
    };
  },

  /**
   * Пересчитать прогресс конкретного пользователя при изменении курса
   * Использует внутреннюю функцию recalculateUserProgress
   */
  recalculateUserProgress,
};
