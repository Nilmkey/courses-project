// models/Course.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  slug: string;
  price: number;
  isPublished: boolean;
  description?: string;
  thumbnail?: string;
  author_id: mongoose.Types.ObjectId;
  level: 'beginner' | 'intermediate' | 'advanced';
  iconName?: string;
  status?: 'open' | 'closed';
  type?: 'career' | 'language';
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  isPublished: { type: Boolean, required: true, default: false },
  description: String,
  thumbnail: String,
  author_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  iconName: { type: String, default: 'Code' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  type: { type: String, enum: ['career', 'language'], default: 'career' },
}, { timestamps: true });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);