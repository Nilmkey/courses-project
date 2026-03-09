// api/v1/lessons/lessons.validation.ts
import { z } from "zod";

const LessonBlockSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Заголовок блока обязателен"),
  type: z.enum(["text", "video", "quiz"]),
  content: z.object({}).passthrough(), // Разрешаем любые дополнительные поля
  order_index: z.number().int().min(0).optional(),
});

export const createLessonSchema = z.object({
  params: z.object({
    sectionId: z.string().min(1, "ID секции обязателен"),
  }),
  body: z.object({
    title: z.string().min(1, "Название урока обязательно"),
    slug: z.string().min(1, "Slug обязателен"),
    order_index: z.number().int().min(0).optional(),
    is_free: z.boolean().optional(),
    content_blocks: z.array(LessonBlockSchema).optional(),
  }),
});

export const updateLessonSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID обязателен"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    order_index: z.number().int().min(0).optional(),
    is_free: z.boolean().optional(),
    content_blocks: z.array(LessonBlockSchema).optional(),
  }),
});

export const deleteLessonSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID обязателен"),
  }),
});

export const reorderLessonsSchema = z.object({
  params: z.object({
    sectionId: z.string().min(1, "ID секции обязателен"),
  }),
  body: z.object({
    lessonIds: z.array(z.string().min(1)),
  }),
});

export const getLessonsBySectionSchema = z.object({
  params: z.object({
    sectionId: z.string().min(1, "ID секции обязателен"),
  }),
});

export const getLessonByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID урока обязателен"),
  }),
});
