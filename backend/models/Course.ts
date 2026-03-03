import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  slug: string;
  price: number;
  isPublished: boolean;
  description?: string;
  thumbnail?: string;
  author_id: mongoose.Types.ObjectId;
  level: "beginner" | "intermediate" | "advanced";
  custom_id: string;
}

const CourseSchema = new Schema<ICourse>(
  {
    custom_id: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(),
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, default: 0 },
    isPublished: { type: Boolean, required: true, default: false },
    description: String,
    thumbnail: String,
    author_id: { type: Schema.Types.ObjectId, ref: "User", index: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
  },
  { timestamps: true },
);

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
