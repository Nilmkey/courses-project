import { z } from "zod";

// Валидация MongoDB ObjectId
const mongoObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Неверный формат MongoDB ObjectId",
});

export const createCourseSchema = z.object({
  params: z.object({}),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: mongoObjectIdSchema,
  }),
  body: z.object({
    title: z.string()
      .refine((val) => !val || val.trim().length >= 3, {
        message: "Название должно содержать минимум 3 символа",
      })
      .optional(),
    slug: z.string()
      .refine((val) => !val || val.trim().length >= 3, {
        message: "Slug должен содержать минимум 3 символа",
      })
      .optional(),
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

export const getCourseByIdSchema = z.object({
  params: z.object({
    id: mongoObjectIdSchema,
  }),
});

export const deleteCourseSchema = z.object({
  params: z.object({
    id: mongoObjectIdSchema,
  }),
});

export const publishCourseSchema = z.object({
  params: z.object({
    id: mongoObjectIdSchema,
  }),
});
