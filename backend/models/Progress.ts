// models/Progress.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuizAnswer {
  questionId: string;
  selectedAnswer: number | number[] | string;
  isCorrect: boolean;
}

export interface ILessonProgress {
  lesson_id: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  quizAnswers?: IQuizAnswer[];
}

export interface IProgress extends Document {
  user_id: Types.ObjectId;
  course_id: Types.ObjectId;
  lessons: ILessonProgress[];
  overallProgress: number;
}

const LessonProgressSchema = new Schema({
  lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, required: true, default: false },
  completedAt: Date,
  quizAnswers: [{
    questionId: String,
    selectedAnswer: Schema.Types.Mixed,
    isCorrect: Boolean,
  }],
}, { _id: false });

const ProgressSchema = new Schema<IProgress>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  lessons: { type: [LessonProgressSchema], default: [] },
  overallProgress: { type: Number, required: true, default: 0 },
}, { timestamps: true });

// Уникальный индекс на пару user_id + course_id
ProgressSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

export const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);