import mongoose, { Schema } from "mongoose";

// --- 1. BLOCK (Блок контента - теперь это ВЛОЖЕННАЯ СХЕМА) ---
// Мы больше не экспортируем модель Block, так как это не отдельная таблица.
// И мы удалили `lesson_id`, так как блок и так лежит внутри урока.
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
    // УБРАЛИ required: true, чтобы избежать ошибки валидации Mongoose
    // при создании урока (контроллер сам подставит индекс)
    order_index: { type: Number },
  },
  { _id: true, timestamps: true }, // Оставляем _id блокам для удобства редактирования на фронте
);

// --- 2. LESSON (Урок) ---
// Ссылается на Section
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
    is_free: { type: Boolean, default: false },
    order_index: { type: Number, required: true },
    // ВОТ ОНО: Блоки теперь живут массивом прямо внутри урока
    content_blocks: [BlockSchema],
  },
  { timestamps: true },
);

export const Lesson = mongoose.model("Lesson", LessonSchema);

// --- 3. SECTION (Секция/Модуль) ---
// Ссылается на Course
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
  },
  { timestamps: true },
);

export const Section = mongoose.model("Section", SectionSchema);

// --- 4. COURSE (Курс) ---
// Верхний уровень
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
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", CourseSchema);


