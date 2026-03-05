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
    sectionId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID секции"),
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
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
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
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
  }),
});

export const reorderLessonsSchema = z.object({
  params: z.object({
    sectionId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID секции"),
  }),
  body: z.object({
    lessonIds: z.array(
      z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID урока"),
    ),
  }),
});

export const getLessonsBySectionSchema = z.object({
  params: z.object({
    sectionId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID секции"),
  }),
});
