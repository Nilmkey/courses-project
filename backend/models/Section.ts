// models/Section.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISection extends Document {
  course_id: Types.ObjectId;
  title: string;
  order_index: number;
  isDraft: boolean;
  custom_id: string;
}

const SectionSchema = new Schema<ISection>({
  custom_id: { type: String, unique: true, index: true, default: () => crypto.randomUUID() },
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  title: { type: String, required: true },
  order_index: { type: Number, required: true, default: 0 },
  isDraft: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const Section = mongoose.model<ISection>('Section', SectionSchema);