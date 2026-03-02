// models/Lesson.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBlockContent {
  titleVideo?: string;
  text?: string;
  url?: string;
  questions?: {
    id: string;
    questionText: string;
    type: 'single' | 'multiple' | 'text';
    options?: string[];
    correctAnswerIndex?: number;
    correctAnswerIndices?: number[];
    correctAnswerText?: string;
  }[];
}

export interface ILessonBlock {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz';
  content: IBlockContent;
}

export interface ILesson extends Document {
  section_id: Types.ObjectId;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: ILessonBlock[];
  custom_id: string;
}

const LessonBlockSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'video', 'quiz'],
    required: true,
  },
  content: {
    titleVideo: String,
    text: String,
    url: String,
    questions: [{
      id: String,
      questionText: String,
      type: { type: String, enum: ['single', 'multiple', 'text'] },
      options: [String],
      correctAnswerIndex: Number,
      correctAnswerIndices: [Number],
      correctAnswerText: String,
    }],
  },
}, { _id: false });

const LessonSchema = new Schema<ILesson>({
  custom_id: { type: String, unique: true, index: true, default: () => crypto.randomUUID() },
  section_id: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  is_free: { type: Boolean, required: true, default: false },
  order_index: { type: Number, required: true, default: 0 },
  content_blocks: { type: [LessonBlockSchema], default: [] },
}, { timestamps: true });

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);