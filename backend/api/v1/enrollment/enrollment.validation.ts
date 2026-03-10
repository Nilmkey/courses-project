// api/v1/enrollment/enrollment.validation.ts
import { z } from 'zod';

export const enrollSchema = z.object({
  body: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});

export const unenrollSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});

export const checkEnrollmentSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});

export const updateEnrollmentStatusSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
  body: z.object({
    status: z.enum(['active', 'completed', 'cancelled']),
  }),
});