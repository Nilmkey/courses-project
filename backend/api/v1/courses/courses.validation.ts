// api/v1/courses/courses.validation.ts
import { z } from "zod";

const BlockContentSchema = z.object({
  titleVideo: z.string().optional(),
  text: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  questions: z
    .array(
      z.object({
        id: z.string(),
        questionText: z.string(),
        type: z.enum(["single", "multiple", "text"]),
        options: z.array(z.string()).optional(),
        correctAnswerIndex: z.number().optional(),
        correctAnswerIndices: z.array(z.number()).optional(),
        correctAnswerText: z.string().optional(),
      }),
    )
    .optional(),
});

const CourseBlockSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Заголовок блока обязателен"),
  type: z.enum(["text", "video", "quiz"]),
  content: BlockContentSchema,
  order_index: z.number().int().min(0).optional(),
});

const LessonSchema = z.object({
  title: z.string().min(1, "Название урока обязательно"),
  slug: z.string().min(1, "Slug обязателен"),
  order_index: z.number().int().min(0).optional(),
  is_free: z.boolean().optional(),
  content_blocks: z.array(CourseBlockSchema).optional().default([]),
});

const SectionSchema = z.object({
  title: z.string().min(1, "Название секции обязательно"),
  order_index: z.number().int().min(0).optional(),
  isDraft: z.boolean().optional(),
  lessons: z.array(LessonSchema).optional().default([]),
});

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Название должно содержать минимум 3 символа"),
    slug: z.string().min(3, "Slug должен содержать минимум 3 символа"),
    description: z.string().optional(),
    thumbnail: z.string().url().optional().or(z.literal("")),
    level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
    price: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
    sections: z.array(SectionSchema).optional().default([]),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    description: z.string().optional(),
    thumbnail: z.string().url().optional().or(z.literal("")),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    price: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const getCourseBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug обязателен"),
  }),
});

export const deleteCourseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
  }),
});

export const publishCourseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
  }),
});
