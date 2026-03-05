// services/progress.service.ts
import { Progress, Lesson, Section, Course } from "../models";
import type { IProgress} from "../models";
import type { Types } from "mongoose";

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

export interface ProgressUpdateInput {
  lesson_id: string | Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  quizAnswers?: QuizAnswerInput[];
}

export interface CourseProgressResult {
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

export const progressService = {
  async markComplete(
    studentId: string,
    lessonId: string,
  ): Promise<IProgress | null> {
    return await Progress.findOneAndUpdate(
      { student_id: studentId, lesson_id: lessonId },
      { completed: true, completedAt: new Date() },
      { upsert: true, returnDocument: 'after' },
    ).lean();
  },

  async resetProgress(studentId: string, lessonId: string): Promise<void> {
    await Progress.findOneAndDelete({
      student_id: studentId,
      lesson_id: lessonId,
    });
  },

  async getCourseProgress(
    studentId: string,
    courseId: string,
  ): Promise<CourseProgressResult | null> {
    const course = await Course.findById(courseId);
    if (!course) {
      return null;
    }

    const sections = await Section.find({ course_id: courseId });
    const sectionIds = sections.map((s) => s._id);

    const lessons = await Lesson.find({ section_id: { $in: sectionIds } });
    const lessonIds = lessons.map((l) => l._id);

    const completedLessons = await Progress.find({
      student_id: studentId,
      lesson_id: { $in: lessonIds },
      completed: true,
    });

    const progress =
      lessonIds.length > 0
        ? (completedLessons.length / lessonIds.length) * 100
        : 0;

    return {
      totalLessons: lessonIds.length,
      completedLessons: completedLessons.length,
      progress: Math.round(progress),
    };
  },

  async updateLessonProgress(
    studentId: string,
    lessonId: string,
    data: ProgressUpdateInput,
  ): Promise<IProgress | null> {
    return await Progress.findOneAndUpdate(
      { student_id: studentId, lesson_id: lessonId },
      {
        ...data,
        completedAt: data.completed ?? new Date(),
      },
      { upsert: true, returnDocument: 'after' },
    ).lean();
  },
};
