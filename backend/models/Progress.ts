// models/Progress.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Ответ на вопрос викторины
 */
export interface IQuizAnswer {
  questionId: string;
  selectedAnswer: number | number[] | string;
  isCorrect: boolean;
}

/**
 * Прогресс по отдельному блоку контента в уроке
 */
export interface IBlockProgress {
  blockId: string;
  completed: boolean;
  completedAt?: Date;
  quizAnswers?: IQuizAnswer[];
}

/**
 * Прогресс по уроку с детализацией по блокам
 */
export interface ILessonProgress {
  lesson_id: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  quizAnswers?: IQuizAnswer[];
  blocks: IBlockProgress[];
  completedBlocksCount: number;
  totalBlocksCount: number;
}

/**
 * Прогресс по секции
 */
export interface ISectionProgress {
  section_id: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lessonProgress: ILessonProgress[];
}

/**
 * Общий прогресс пользователя по курсу
 */
export interface IProgress extends Document {
  user_id: Types.ObjectId;
  course_id: Types.ObjectId;
  
  // Прогресс по урокам (для обратной совместимости и быстрого доступа)
  lessons: ILessonProgress[];
  
  // Прогресс по секциям (агрегированный)
  sections: ISectionProgress[];
  
  // Общий процент выполнения курса
  overallProgress: number;
  
  // Детальная статистика
  stats: {
    totalBlocks: number;
    completedBlocks: number;
    totalLessons: number;
    completedLessons: number;
    totalSections: number;
    completedSections: number;
  };
}

/**
 * Схема прогресса по блоку
 */
const BlockProgressSchema = new Schema({
  blockId: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
  completedAt: Date,
  quizAnswers: [{
    questionId: String,
    selectedAnswer: Schema.Types.Mixed,
    isCorrect: Boolean,
  }],
}, { _id: false });

/**
 * Схема прогресса по уроку
 */
const LessonProgressSchema = new Schema({
  lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, required: true, default: false },
  completedAt: Date,
  quizAnswers: [{
    questionId: String,
    selectedAnswer: Schema.Types.Mixed,
    isCorrect: Boolean,
  }],
  blocks: { type: [BlockProgressSchema], default: [] },
  completedBlocksCount: { type: Number, required: true, default: 0 },
  totalBlocksCount: { type: Number, required: true, default: 0 },
}, { _id: false });

/**
 * Схема прогресса по секции
 */
const SectionProgressSchema = new Schema({
  section_id: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  completed: { type: Boolean, required: true, default: false },
  completedAt: Date,
  completedLessonsCount: { type: Number, required: true, default: 0 },
  totalLessonsCount: { type: Number, required: true, default: 0 },
  lessonProgress: { type: [LessonProgressSchema], default: [] },
}, { _id: false });

/**
 * Основная схема прогресса
 */
const ProgressSchema = new Schema<IProgress>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  
  lessons: { type: [LessonProgressSchema], default: [] },
  
  sections: { type: [SectionProgressSchema], default: [] },
  
  overallProgress: { type: Number, required: true, default: 0 },
  
  stats: {
    totalBlocks: { type: Number, required: true, default: 0 },
    completedBlocks: { type: Number, required: true, default: 0 },
    totalLessons: { type: Number, required: true, default: 0 },
    completedLessons: { type: Number, required: true, default: 0 },
    totalSections: { type: Number, required: true, default: 0 },
    completedSections: { type: Number, required: true, default: 0 },
  },
}, { timestamps: true });

// Уникальный индекс на пару user_id + course_id
ProgressSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

// Индексы для быстрого поиска прогресса по урокам и секциям
ProgressSchema.index({ 'lessons.lesson_id': 1 });
ProgressSchema.index({ 'sections.section_id': 1 });

export const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);