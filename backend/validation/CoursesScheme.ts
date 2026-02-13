import { z } from "zod";

export const CourseCreateSchema = z.object({
  title: z.string().min(3, "Название слишком короткое"),
  slug: z.string().min(3, "Слаг обязателен"),
  description: z.string().optional(),
  thumbnail: z.string().url("Неверная ссылка на картинку").optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  sections: z.array(z.object({
    title: z.string(),
    order_index: z.number(),
    lessons: z.array(z.object({
      title: z.string(),
      slug: z.string(),
      order_index: z.number(),
      is_free: z.boolean().default(false),
      content_blocks: z.array(z.object({
        type: z.enum(["text", "video", "practice", "code"]),
        content: z.any(),
        order_index: z.number()
      }))
    }))
  })).optional()
});