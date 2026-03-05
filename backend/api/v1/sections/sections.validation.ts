// api/v1/sections/sections.validation.ts
import { z } from 'zod';

export const createSectionSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
  body: z.object({
    title: z.string().min(1, 'Название секции обязательно'),
    order_index: z.number().int().min(0).optional(),
    isDraft: z.boolean().optional(),
  }),
});

export const updateSectionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    order_index: z.number().int().min(0).optional(),
    isDraft: z.boolean().optional(),
  }),
});

export const deleteSectionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID'),
  }),
});

export const reorderSectionsSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
  body: z.object({
    sectionIds: z.array(
      z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID секции')
    ),
  }),
});

export const getSectionsByCourseSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});