// services/progress.service.ts
import { Progress, Lesson, Section, Course } from "../models";
import type { IProgress, IQuizAnswer } from "../models";
import { Types } from "mongoose";
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
    throw ApiError.notFound(
      `Секция для урока ${lessonId} не найдена`,
    );
  }

  if (section.course_id.toString() !== courseId) {
    throw ApiError.badRequest(
      `Урок ${lessonId} не принадлежит курсу ${courseId}`,
    );
  }
}

export const progressService = {
  async markComplete(
    studentId: string,
    lessonId: string,
    courseId: string,
  ): Promise<IProgress | null> {
    // Проверка целостности данных
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    const progress = await Progress.findOneAndUpdate(
      { user_id: studentId, course_id: courseObjId },
      {
        $set: {
          'lessons.$[lesson].completed': true,
          'lessons.$[lesson].completedAt': new Date(),
        },
        $addToSet: {
          lessons: {
            lesson_id: lessonObjId,
            completed: true,
            completedAt: new Date(),
          },
        },
      },
      {
        arrayFilters: [{ 'lesson.lesson_id': lessonObjId }],
        upsert: true,
        returnDocument: 'after',
      },
    ).lean();

    return progress;
  },

  async resetProgress(studentId: string, lessonId: string, courseId: string): Promise<IProgress | null> {
    // Проверка целостности данных
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    const progress = await Progress.findOneAndUpdate(
      { user_id: studentId, course_id: courseObjId },
      {
        $pull: {
          lessons: { lesson_id: lessonObjId },
        },
      },
      { returnDocument: 'after' },
    ).lean();

    return progress;
  },

  async getCourseProgress(
    studentId: string,
    courseId: string,
  ): Promise<CourseProgressResult | null> {
    // Проверка: существует ли курс
    const course = await Course.findById(courseId);
    if (!course) {
      return null;
    }

    const sections = await Section.find({ course_id: courseId });
    const sectionIds = sections.map((s) => s._id);

    const lessons = await Lesson.find({ section_id: { $in: sectionIds } });
    const lessonIds = lessons.map((l) => l._id);

    const progressDoc = await Progress.findOne({
      user_id: studentId,
      course_id: courseId,
    });

    if (!progressDoc || !progressDoc.lessons || progressDoc.lessons.length === 0) {
      return {
        totalLessons: lessonIds.length,
        completedLessons: 0,
        progress: 0,
      };
    }

    const completedLessonIds = progressDoc.lessons
      .filter((l) => l.completed)
      .map((l) => l.lesson_id.toString());

    const completedLessonsCount = lessonIds.filter((l) =>
      completedLessonIds.includes(l.toString()),
    ).length;

    const progress =
      lessonIds.length > 0
        ? (completedLessonsCount / lessonIds.length) * 100
        : 0;

    return {
      totalLessons: lessonIds.length,
      completedLessons: completedLessonsCount,
      progress: Math.round(progress),
    };
  },

  async updateLessonProgress(
    studentId: string,
    lessonId: string,
    courseId: string,
    data: LessonProgressInput,
  ): Promise<IProgress | null> {
    // Проверка целостности данных
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    const updateData: Record<string, unknown> = {
      'lessons.$[lesson].completed': data.completed,
    };

    if (data.completed) {
      updateData['lessons.$[lesson].completedAt'] = new Date();
    }

    if (data.quizAnswers && data.quizAnswers.length > 0) {
      updateData['lessons.$[lesson].quizAnswers'] = data.quizAnswers;
    }

    const progress = await Progress.findOneAndUpdate(
      { user_id: studentId, course_id: courseObjId },
      {
        $set: updateData,
        $addToSet: {
          lessons: {
            lesson_id: lessonObjId,
            completed: data.completed,
            completedAt: data.completed ? new Date() : undefined,
            quizAnswers: data.quizAnswers,
          },
        },
      },
      {
        arrayFilters: [{ 'lesson.lesson_id': lessonObjId }],
        upsert: true,
        returnDocument: 'after',
      },
    ).lean();

    return progress;
  },

  async getLessonProgress(
    studentId: string,
    lessonId: string,
    courseId: string,
  ): Promise<IQuizAnswer[] | null> {
    // Проверка целостности данных
    await validateLessonBelongsToCourse(lessonId, courseId);

    const lessonObjId = new Types.ObjectId(lessonId);
    const courseObjId = new Types.ObjectId(courseId);

    const progressDoc = await Progress.findOne({
      user_id: studentId,
      course_id: courseObjId,
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
};
