import { z } from "zod";

// --- 1. ВАЛИДАЦИЯ ВОПРОСОВ (QuizQuestion) ---
const BaseQuestionSchema = z.object({
  id: z.string().optional(),
  questionText: z.string().min(1, "Текст вопроса обязателен"),
});

const SingleChoiceSchema = BaseQuestionSchema.extend({
  type: z.literal("single"),
  options: z.array(z.string()).min(2, "Минимум 2 варианта ответа"),
  correctAnswerIndex: z.number().min(0, "Индекс не может быть отрицательным"),
});

const MultipleChoiceSchema = BaseQuestionSchema.extend({
  type: z.literal("multiple"),
  options: z.array(z.string()).min(2, "Минимум 2 варианта ответа"),
  correctAnswerIndices: z
    .array(z.number())
    .min(1, "Выберите хотя бы 1 правильный ответ"),
});

const TextQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("text"),
  correctAnswerText: z.string().min(1, "Правильный ответ обязателен"),
});

const QuizQuestionSchema = z.discriminatedUnion("type", [
  SingleChoiceSchema,
  MultipleChoiceSchema,
  TextQuestionSchema,
]);

// --- 2. ВАЛИДАЦИЯ КОНТЕНТА И БЛОКА (Block) ---
const BlockContentSchema = z.object({
  titleVideo: z.string().optional(),
  text: z.string().optional(),
  url: z.string().url("Неверная ссылка").optional().or(z.literal("")),
  questions: z.array(QuizQuestionSchema).optional(),
});

const CourseBlockSchema = z.object({
  title: z.string().min(1, "Название блока обязательно"),
  type: z.enum(["text", "video", "quiz"]),
  content: BlockContentSchema,
  order_index: z.number().optional(),
});

// --- 3. ВАЛИДАЦИЯ УРОКА И СЕКЦИИ (Lesson & Section) ---
const LessonSchema = z.object({
  title: z.string().min(1, "Название урока обязательно"),
  slug: z.string().min(1, "Слаг урока обязателен"),
  order_index: z.number().optional(),
  is_free: z.boolean().default(false),
  // Ожидаем массив блоков прямо в JSON уроке
  content_blocks: z.array(CourseBlockSchema).optional().default([]),
});

const SectionSchema = z.object({
  title: z.string().min(1, "Название секции обязательно"),
  order_index: z.number().optional(),
  lessons: z.array(LessonSchema).optional().default([]),
});

// --- 4. ГЛАВНАЯ СХЕМА КУРСА (Course) ---
export const CourseCreateSchema = z.object({
  title: z.string().min(3, "Название слишком короткое"),
  slug: z.string().min(3, "Слаг обязателен"),
  description: z.string().optional(),
  thumbnail: z
    .string()
    .url("Неверная ссылка на картинку")
    .optional()
    .or(z.literal("")),
  author_id: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  sections: z.array(SectionSchema).optional().default([]),
});
