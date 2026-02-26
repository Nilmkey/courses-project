// models/Section.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISection extends Document {
  course_id: Types.ObjectId;
  title: string;
  order_index: number;
  isDraft: boolean;
}

const SectionSchema = new Schema<ISection>({
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  title: { type: String, required: true },
  order_index: { type: Number, required: true, default: 0 },
  isDraft: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const Section = mongoose.model<ISection>('Section', SectionSchema);