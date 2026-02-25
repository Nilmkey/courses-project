import mongoose, { Schema } from "mongoose";

const BlockSchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "video", "quiz"],
      required: true,
    },
    content: {
      titleVideo: { type: String },
      text: { type: String },
      url: { type: String },
      questions: [{ type: Schema.Types.Mixed }],
    },

    order_index: { type: Number },
  },
  { _id: true, timestamps: true },
);

const LessonSchema = new Schema(
  {
    section_id: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order_index: { type: Number, required: true },
    //опубликована ли урок в общий доступ или он остается черновиком
    //пускай останется здесь до лучших времен
    // isDraft: { type: Boolean, default: true, required: true },
    // order_index: { type: Number, required: true },
    content_blocks: [BlockSchema],
  },
  { timestamps: true },
);

export const Lesson = mongoose.model("Lesson", LessonSchema);

const SectionSchema = new Schema(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    order_index: { type: Number, required: true },
    //опубликована ли секция в общий доступ или он остается черновиком
    isDraft: { type: Boolean, default: true, required: true },
    //я тут добавил массив с уроками. если нужно получить title урока используй .populate()
    lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true },
);

export const Section = mongoose.model("Section", SectionSchema);

//цена, isPublished
const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true, default: 0 },
    isPublished: { type: Boolean, required: true, default: false },
    description: { type: String },
    thumbnail: { type: String },
    author_id: { type: Schema.Types.ObjectId, ref: "User", index: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", CourseSchema);
