// models/Enrollment.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  user_id: Types.ObjectId;
  course_id: Types.ObjectId;
  enrolledAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'cancelled';
}

const EnrollmentSchema = new Schema<IEnrollment>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  enrolledAt: { type: Date, required: true, default: Date.now },
  completedAt: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    required: true,
    default: 'active',
  },
}, { timestamps: true });

// Уникальный индекс на пару user_id + course_id
EnrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);