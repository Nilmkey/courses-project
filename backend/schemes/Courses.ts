import mongoose, { Schema } from "mongoose";

const ContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "video", "practice", "code"],
      required: true,
    },
    content: Schema.Types.Mixed,
    order_index: { type: Number, required: true },
  },
  { _id: true },
);

const LessonSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    is_free: { type: Boolean, default: false },
    order_index: { type: Number, required: true },
    content_blocks: [ContentBlockSchema],
  },
  { _id: true },
);

const SectionSchema = new Schema(
  {
    title: { type: String, required: true },
    order_index: { type: Number, required: true },
    lessons: [LessonSchema],
  },
  { _id: true },
);

const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    thumbnail: { type: String },
    author_id: { type: Schema.Types.ObjectId, ref: "User", index: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    sections: [SectionSchema],
  },
  {
    timestamps: true,
  },
);

export const Course = mongoose.model("Course", CourseSchema);
