import { Progress, Lesson, Section, Course, Enrollment } from "../models";
import type {
  IProgress,
  IQuizAnswer,
  IBlockProgress,
  ILessonProgress,
  ISectionProgress,
} from "../models";
import { Types, Document } from "mongoose";
import mongoose from "mongoose";
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
    .select("_id section_id title content_blocks")
    .lean();

  let totalBlocks = 0;
  const sectionsWithLessons = sections.map((section) => ({
    _id: section._id,
    title: section.title,
    lessons: lessons
      .filter((l) => l.section_id.toString() === section._id.toString())
      .map((lesson) => {
        totalBlocks += lesson.content_blocks?.length || 0;
        return {
          _id: lesson._id,
          title: lesson.title,
          content_blocks:
            lesson.content_blocks?.map((b) => ({
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
  const currentSectionIds = new Set(sections.map((s) => s._id.toString()));

  progressDoc.sections = progressDoc.sections.filter((s) => currentSectionIds.has(s.section_id.toString()));

  const currentLessonIds = new Set(
    sections.flatMap((s) => s.lessons.map((l) => l._id.toString())),
  );
  progressDoc.lessons = progressDoc.lessons.filter((l) => currentLessonIds.has(l.lesson_id.toString()));

  for (const section of sections) {
    let sectionProgress = progressDoc.sections.find(
      (s) => s.section_id.toString() === section._id.toString(),
    );

    if (!sectionProgress) {
      sectionProgress = {
        section_id: section._id,
        completed: false,
        completedLessonsCount: 0,
        totalLessonsCount: section.lessons.length,
        lessonProgress: [],
      };
      progressDoc.sections.push(sectionProgress);
    } else {
      sectionProgress.totalLessonsCount = section.lessons.length;
    }

    const currentLessonIdsInSection = new Set(
      section.lessons.map((l) => l._id.toString()),
    );
    sectionProgress.lessonProgress = sectionProgress.lessonProgress.filter(
      (l) => currentLessonIdsInSection.has(l.lesson_id.toString()),
    );

    for (const lesson of section.lessons) {
      let lessonProgress = sectionProgress.lessonProgress.find(
        (l) => l.lesson_id.toString() === lesson._id.toString(),
      );

      if (!lessonProgress) {
        lessonProgress = {
          lesson_id: lesson._id,
          completed: false,
          blocks: [],
          completedBlocksCount: 0,
          totalBlocksCount: lesson.content_blocks.length,
        };
        sectionProgress.lessonProgress.push(lessonProgress);

        const mainLessonProgress = progressDoc.lessons.find(
          (l) => l.lesson_id.toString() === lesson._id.toString(),
        );
        if (!mainLessonProgress) {
          progressDoc.lessons.push(lessonProgress);
        }
      } else {
        const currentBlockIds = new Set(lesson.content_blocks.map((b) => b.id));
        lessonProgress.blocks = lessonProgress.blocks.filter((b) => currentBlockIds.has(b.blockId));
        lessonProgress.totalBlocksCount = lesson.content_blocks.length;

        let newBlocksAdded = false;
        for (const block of lesson.content_blocks) {
          const blockId = block.id;
          let blockProgress = lessonProgress.blocks.find(
            (b) => b.blockId === blockId,
          );

          if (!blockProgress) {
            blockProgress = {
              blockId: blockId,
              completed: false,
            };
            lessonProgress.blocks.push(blockProgress);
            newBlocksAdded = true;
          }
        }

        if (newBlocksAdded && lessonProgress.completed) {
          lessonProgress.completed = false;
          lessonProgress.completedAt = undefined;
        }

        lessonProgress.completedBlocksCount = lessonProgress.blocks.filter(
          (b) => b.completed,
        ).length;
      }
    }

    sectionProgress.completedLessonsCount =
      sectionProgress.lessonProgress.filter((l) => l.completed).length;

    if (
      sectionProgress.completedLessonsCount <
        sectionProgress.totalLessonsCount &&
      sectionProgress.completed
    ) {
      sectionProgress.completed = false;
      sectionProgress.completedAt = undefined;
    }
  }

  progressDoc.stats.totalSections = sections.length;
  progressDoc.stats.totalLessons = courseStructure.totalLessons;
  progressDoc.stats.totalBlocks = courseStructure.totalBlocks;

  progressDoc.stats.completedSections = progressDoc.sections.filter(
    (s) => s.completed,
  ).length;
  progressDoc.stats.completedLessons = progressDoc.lessons.filter(
    (l) => l.completed,
  ).length;
  progressDoc.stats.completedBlocks = progressDoc.lessons.reduce(
    (acc, l) => acc + l.blocks.filter((b) => b.completed).length,
    0,
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

  const completedSections = progressDoc.sections.filter((s) => s.completed).length;
  const completedLessons = progressDoc.lessons.filter((l) => l.completed).length;
  const completedBlocks = progressDoc.lessons.reduce((acc, lesson) => {
    return acc + lesson.blocks.filter((b) => b.completed).length;
  }, 0);

  const progress =
    courseStructure.totalLessons > 0
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
  session?: mongoose.ClientSession,
): Promise<void> {
  const exists = await Progress.findOne({
    user_id: userId,
    course_id: courseId,
  }).session(session || null);

  if (!exists) {
    const courseStructure = await getCourseStructure(courseId);

    const sections: ISectionProgress[] = courseStructure.sections.map(
      (section) => ({
        section_id: section._id,
        completed: false,
        completedLessonsCount: 0,
        totalLessonsCount: section.lessons.length,
        lessonProgress: section.lessons.map((lesson) => ({
          lesson_id: lesson._id,
          completed: false,
          blocks: lesson.content_blocks.map((block) => ({
            blockId: block.id,
            completed: false,
          })),
          completedBlocksCount: 0,
          totalBlocksCount: lesson.content_blocks.length,
        })),
      }),
    );

    const lessons: ILessonProgress[] = sections.flatMap(
      (s) => s.lessonProgress,
    );

    await Progress.create([{
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
    }], { session });
  }
}

/**
 * Обновление статистики и прогресса документа
 */
function calculateProgressStats(
  progressDoc: IProgress,
  courseStructure: {
    totalLessons: number;
    totalBlocks: number;
    sections: Array<{ _id: Types.ObjectId }>;
  },
): void {
  const completedLessons = progressDoc.lessons.filter(
    (l) => l.completed,
  ).length;
  const completedBlocks = progressDoc.lessons.reduce(
    (acc, l) => acc + l.blocks.filter((b) => b.completed).length,
    0,
  );
  const completedSections = progressDoc.sections.filter(
    (s) => s.completed,
  ).length;

  progressDoc.stats.completedLessons = completedLessons;
  progressDoc.stats.completedBlocks = completedBlocks;
  progressDoc.stats.completedSections = completedSections;
  progressDoc.stats.totalLessons = courseStructure.totalLessons;
  progressDoc.stats.totalBlocks = courseStructure.totalBlocks;
  progressDoc.stats.totalSections = courseStructure.sections.length;

  progressDoc.overallProgress =
    courseStructure.totalLessons > 0
      ? Math.round((completedLessons / courseStructure.totalLessons) * 100)
      : 0;

  for (const section of progressDoc.sections) {
    section.completedLessonsCount = section.lessonProgress.filter(
      (l) => l.completed,
    ).length;
    section.totalLessonsCount = section.lessonProgress.length;
  }
}

async function updateProgressStats(
  progressDoc: IProgress,
  courseStructure: {
    totalLessons: number;
    totalBlocks: number;
    sections: Array<{ _id: Types.ObjectId }>;
  },
): Promise<void> {
  calculateProgressStats(progressDoc, courseStructure);
  await progressDoc.save();
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

    if (!progressDoc) {
      return null;
    }

    const lessons = progressDoc.lessons || [];
    const sections = progressDoc.sections || [];
    const stats = progressDoc.stats;

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
        blocks: l.blocks
          ? l.blocks.map((b) => ({
              blockId: b.blockId,
              completed: b.completed,
              completedAt: b.completedAt?.toISOString(),
              quizAnswers: b.quizAnswers?.map((a) => ({
                questionId: a.questionId,
                selectedAnswer: a.selectedAnswer,
                isCorrect: a.isCorrect,
              })),
            }))
          : [],
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

    const lessonProgress = progress.lessons.find(
      (l) => l.lesson_id.toString() === lessonId,
    );

    if (lessonProgress) {
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();

      for (const block of lessonProgress.blocks) {
        if (!block.completed) {
          block.completed = true;
          block.completedAt = new Date();
        }
      }
      lessonProgress.completedBlocksCount = lessonProgress.blocks.length;
    } else {
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        const newLessonProgress: ILessonProgress = {
          lesson_id: lessonObjId,
          completed: true,
          completedAt: new Date(),
          blocks: lesson.content_blocks.map((block) => ({
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

    try {
      await streakService.extendStreak(studentId, headers);
    } catch (error) {
      console.error("[Progress] Не удалось обновить стрик:", error);
    }

    const courseStructure = await getCourseStructure(courseId);
    await syncProgressWithCourseStructure(progress, courseStructure);
    await updateProgressStats(progress, courseStructure);

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
      (l) => l.lesson_id.toString() === lessonId,
    );

    if (lessonProgress) {
      lessonProgress.completed = false;
      lessonProgress.completedAt = undefined;
      lessonProgress.quizAnswers = [];
      lessonProgress.completedBlocksCount = 0;

      for (const block of lessonProgress.blocks) {
        block.completed = false;
        block.completedAt = undefined;
        block.quizAnswers = undefined;
      }
    }

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
   * Обновить прогресс урока
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
      (l) => l.lesson_id.toString() === lessonId,
    );

    if (!lessonProgress) {
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
        blocks: lesson.content_blocks.map((block) => ({
          blockId: block.id,
          completed: false,
        })),
        completedBlocksCount: 0,
        totalBlocksCount: lesson.content_blocks.length,
      };

      progress.lessons.push(lessonProgress);
    } else {
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
    headers?: Headers,
  ): Promise<IProgress | null> {
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    let progress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
      "lessons.lesson_id": lessonObjId,
    });

    if (progress) {
      const lessonProgress = progress.lessons.find(
        (l) => l.lesson_id.toString() === lessonId,
      );

      if (lessonProgress) {
        const blockProgress = lessonProgress.blocks.find(
          (b) => b.blockId === blockId,
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
            (b) => b.completed,
          ).length;

          if (
            lessonProgress.completedBlocksCount ===
              lessonProgress.totalBlocksCount &&
            lessonProgress.totalBlocksCount > 0
          ) {
            lessonProgress.completed = true;
            lessonProgress.completedAt = new Date();
          }

          await progress.save();

          try {
            await streakService.extendStreak(studentId, headers);
          } catch (error) {
            console.error("[Progress] Не удалось обновить стрик:", error);
          }

          recalculateUserProgress(studentId, courseId).catch(console.error);

          return progress;
        }
      }
    }

    await initializeProgressIfNotExists(studentId, courseId);

    const updatedProgress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
      "lessons.lesson_id": lessonObjId,
    });

    if (updatedProgress) {
      const lessonProgress = updatedProgress.lessons.find(
        (l) => l.lesson_id.toString() === lessonId,
      );

      if (lessonProgress) {
        const blockProgress = lessonProgress.blocks.find(
          (b) => b.blockId === blockId,
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
            (b) => b.completed,
          ).length;

          if (
            lessonProgress.completedBlocksCount ===
              lessonProgress.totalBlocksCount &&
            lessonProgress.totalBlocksCount > 0
          ) {
            lessonProgress.completed = true;
            lessonProgress.completedAt = new Date();
          }

          await updatedProgress.save();

          try {
            await streakService.extendStreak(studentId, headers);
          } catch (error) {
            console.error("[Progress] Не удалось обновить стрик:", error);
          }

          await recalculateUserProgress(studentId, courseId);

          return updatedProgress;
        }
      }
    }

    return null;
  },

  async initializeProgress(studentId: string, courseId: string, session?: mongoose.ClientSession): Promise<void> {
    await initializeProgressIfNotExists(studentId, courseId, session);
  },

  /**
   * Оптимизированный пересчет прогресса всех пользователей (Bulk)
   */
  async recalculateCourseProgress(courseId: string): Promise<{
    updatedUsers: number;
    message: string;
  }> {
    const courseStructure = await getCourseStructure(courseId);
    const allProgresses = await Progress.find({ course_id: courseId });

    if (allProgresses.length === 0) {
      return { updatedUsers: 0, message: "Нет активных пользователей" };
    }

    const progressBulkOps: any[] = [];
    const completedUserIds: Types.ObjectId[] = [];
    const activeUserIds: Types.ObjectId[] = [];

    for (const progress of allProgresses) {
      try {
        await syncProgressWithCourseStructure(progress, courseStructure);
        calculateProgressStats(progress, courseStructure);

        progressBulkOps.push({
          replaceOne: {
            filter: { _id: progress._id },
            replacement: progress.toObject(),
          },
        });

        if (progress.overallProgress === 100) {
          completedUserIds.push(progress.user_id as Types.ObjectId);
        } else {
          activeUserIds.push(progress.user_id as Types.ObjectId);
        }
      } catch (error) {
        console.error(`[Progress Bulk] Error for user ${progress.user_id}:`, error);
      }
    }

    if (progressBulkOps.length > 0) {
      await Progress.bulkWrite(progressBulkOps);
    }

    const courseObjId = new Types.ObjectId(courseId);

    if (completedUserIds.length > 0) {
      await Enrollment.updateMany(
        { user_id: { $in: completedUserIds }, course_id: courseObjId },
        { $set: { status: "completed", completedAt: new Date() } }
      );
    }

    if (activeUserIds.length > 0) {
      await Enrollment.updateMany(
        { user_id: { $in: activeUserIds }, course_id: courseObjId },
        { $set: { status: "active" }, $unset: { completedAt: "" } }
      );
    }

    return {
      updatedUsers: progressBulkOps.length,
      message: `Прогресс пересчитан для ${progressBulkOps.length} пользователей (Bulk)`,
    };
  },

  recalculateUserProgress,
};
