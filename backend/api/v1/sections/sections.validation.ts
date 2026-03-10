// api/v1/sections/sections.validation.ts
import { z } from 'zod';

export const createSectionSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, 'ID курса обязателен'),
  }),
  body: z.object({
    title: z.string().min(1, 'Название секции обязательно'),
    order_index: z.number().int().min(0).optional(),
    isDraft: z.boolean().optional(),
  }),
});

export const updateSectionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID обязателен'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    order_index: z.number().int().min(0).optional(),
    isDraft: z.boolean().optional(),
    lessons: z.array(
      z.string().min(1)
    ).optional(),
  }),
});

export const deleteSectionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID обязателен'),
  }),
});

export const reorderSectionsSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, 'ID курса обязателен'),
  }),
  body: z.object({
    sectionIds: z.array(
      z.string().min(1)
    ),
  }),
});

export const getSectionsByCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, 'ID курса обязателен'),
  }),
});