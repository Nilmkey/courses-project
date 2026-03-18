import { Progress, Lesson, Section, Course, Enrollment } from "../models";
import type { IProgress, IQuizAnswer } from "../models";
import { Types, Document } from "mongoose";
import { ApiError } from "../utils/ApiError";

export interface QuizAnswerInput {
  questionId: string;
  selectedAnswer: number | number[] | string;
  isCorrect: boolean;
}

export interface LessonProgressInput {
  lesson_id: string | Types.ObjectId;
  completed: boolean;
  quizAnswers?: QuizAnswerInput[];
}

export interface CourseProgressResult {
  totalLessons: number;
  completedLessons: number;
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
  }>;
  overallProgress: number;
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
 * Расчет общего прогресса курса
 */
async function calculateOverallProgress(
  userId: string,
  courseId: string,
): Promise<{ totalLessons: number; completedLessons: number; progress: number }> {
  // Получаем все секции курса
  const sections = await Section.find({ course_id: courseId });
  const sectionIds = sections.map((s) => s._id);

  // Получаем все уроки курса
  const lessons = await Lesson.find({ section_id: { $in: sectionIds } });
  const totalLessons = lessons.length;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0, progress: 0 };
  }

  // Получаем прогресс пользователя
  const progressDoc = await Progress.findOne({
    user_id: userId,
    course_id: courseId,
  });

  if (!progressDoc || !progressDoc.lessons || progressDoc.lessons.length === 0) {
    return { totalLessons, completedLessons: 0, progress: 0 };
  }

  // Считаем завершенные уроки
  const completedLessons = progressDoc.lessons.filter((l) => l.completed).length;
  const progress = (completedLessons / totalLessons) * 100;

  return {
    totalLessons,
    completedLessons,
    progress: Math.round(progress),
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
    await Progress.create({
      user_id: userId,
      course_id: courseId,
      lessons: [],
      overallProgress: 0,
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

    const progressDoc = await Progress.findOne({
      user_id: studentId,
      course_id: courseId,
    }).lean();

    if (!progressDoc) {
      await initializeProgressIfNotExists(studentId, courseId);
      return {
        _id: "",
        user_id: studentId,
        course_id: courseId,
        lessons: [],
        overallProgress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      _id: progressDoc._id.toString(),
      user_id: progressDoc.user_id.toString(),
      course_id: progressDoc.course_id.toString(),
      lessons: progressDoc.lessons.map((l) => ({
        lesson_id: l.lesson_id.toString(),
        completed: l.completed,
        completedAt: l.completedAt?.toISOString(),
        quizAnswers: l.quizAnswers?.map((a) => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect,
        })),
      })),
      overallProgress: progressDoc.overallProgress,
      createdAt: (progressDoc as any).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (progressDoc as any).updatedAt?.toISOString() || new Date().toISOString(),
    };
  },

  /**
   * Получить прогресс по конкретному уроку
   */
  async getLessonProgress(
    studentId: string,
    lessonId: string,
    courseId: string,
  ): Promise<IQuizAnswer[] | null> {
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

    return lessonProgress.quizAnswers || null;
  },

  /**
   * Отметить урок как пройденный
   */
  async markComplete(
    studentId: string,
    lessonId: string,
    courseId: string,
  ): Promise<IProgress | null> {
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    let progress: IProgress | null;

    // Проверяем существование прогресса
    const existingProgress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
    });

    if (existingProgress) {
      const lessonExists = existingProgress.lessons.some(
        (l) => l.lesson_id.toString() === lessonId,
      );

      if (lessonExists) {
        progress = await Progress.findOneAndUpdate(
          {
            user_id: studentId,
            course_id: courseObjId,
            "lessons.lesson_id": lessonObjId,
          },
          {
            $set: {
              "lessons.$.completed": true,
              "lessons.$.completedAt": new Date(),
            },
          },
          { returnDocument: "after" },
        ).lean();
      } else {
        progress = await Progress.findOneAndUpdate(
          { user_id: studentId, course_id: courseObjId },
          {
            $push: {
              lessons: {
                lesson_id: lessonObjId,
                completed: true,
                completedAt: new Date(),
              },
            },
          },
          { returnDocument: "after" },
        ).lean();
      }
    } else {
      const newProgress = await Progress.create({
        user_id: studentId,
        course_id: courseObjId,
        lessons: [
          {
            lesson_id: lessonObjId,
            completed: true,
            completedAt: new Date(),
          },
        ],
        overallProgress: 0,
      });
      progress = newProgress.toObject();
    }

    // Обновляем общий прогресс
    if (progress) {
      const progressData = await calculateOverallProgress(studentId, courseId);
      await Progress.findByIdAndUpdate(progress._id, {
        overallProgress: progressData.progress,
      });

      // Обновляем статус enrollment
      await updateEnrollmentStatus(studentId, courseId, progressData.progress);
    }

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

    const progress = await Progress.findOneAndUpdate(
      {
        user_id: studentId,
        course_id: courseObjId,
        "lessons.lesson_id": lessonObjId,
      },
      {
        $set: {
          "lessons.$.completed": false,
          "lessons.$.completedAt": undefined,
          "lessons.$.quizAnswers": [],
        },
      },
      { returnDocument: "after" },
    ).lean();

    if (progress) {
      const progressData = await calculateOverallProgress(studentId, courseId);
      await Progress.findByIdAndUpdate(progress._id, {
        overallProgress: progressData.progress,
      });

      await updateEnrollmentStatus(studentId, courseId, progressData.progress);
    }

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

    let progress: IProgress | null;

    const existingProgress = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
    });

    if (!existingProgress) {
      const newProgress = await Progress.create({
        user_id: studentId,
        course_id: courseObjId,
        lessons: [
          {
            lesson_id: lessonObjId,
            completed: data.completed,
            completedAt: data.completed ? new Date() : undefined,
            quizAnswers: data.quizAnswers?.map((a) => ({
              questionId: a.questionId,
              selectedAnswer: a.selectedAnswer,
              isCorrect: a.isCorrect,
            })),
          },
        ],
        overallProgress: 0,
      });
      progress = newProgress.toObject();
    } else {
      const lessonExists = existingProgress.lessons.some(
        (l) => l.lesson_id.toString() === lessonId,
      );

      if (lessonExists) {
        const updateData: Record<string, unknown> = {
          "lessons.$.completed": data.completed,
        };

        if (data.completed) {
          updateData["lessons.$.completedAt"] = new Date();
        }

        if (data.quizAnswers && data.quizAnswers.length > 0) {
          updateData["lessons.$.quizAnswers"] = data.quizAnswers.map((a) => ({
            questionId: a.questionId,
            selectedAnswer: a.selectedAnswer,
            isCorrect: a.isCorrect,
          }));
        }

        progress = await Progress.findOneAndUpdate(
          {
            user_id: studentId,
            course_id: courseObjId,
            "lessons.lesson_id": lessonObjId,
          },
          { $set: updateData },
          { returnDocument: "after" },
        ).lean();
      } else {
        progress = await Progress.findOneAndUpdate(
          { user_id: studentId, course_id: courseObjId },
          {
            $push: {
              lessons: {
                lesson_id: lessonObjId,
                completed: data.completed,
                completedAt: data.completed ? new Date() : undefined,
                quizAnswers: data.quizAnswers?.map((a) => ({
                  questionId: a.questionId,
                  selectedAnswer: a.selectedAnswer,
                  isCorrect: a.isCorrect,
                })),
              },
            },
          },
          { returnDocument: "after" },
        ).lean();
      }
    }

    if (progress) {
      const progressData = await calculateOverallProgress(studentId, courseId);
      await Progress.findByIdAndUpdate(progress._id, {
        overallProgress: progressData.progress,
      });

      await updateEnrollmentStatus(studentId, courseId, progressData.progress);
    }

    return progress;
  },

  /**
   * Инициализировать прогресс при записи на курс
   */
  async initializeProgress(
    studentId: string,
    courseId: string,
  ): Promise<void> {
    await initializeProgressIfNotExists(studentId, courseId);
  },
};
