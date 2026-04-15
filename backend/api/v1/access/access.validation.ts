// api/v1/access/access.validation.ts
import { z } from 'zod';

// Валидация slug: только буквенно-цифровые символы и дефисы, минимум 3 символа
// Защита от path traversal и SSRF
const courseSlugSchema = z.string()
  .min(3, 'Slug должен содержать минимум 3 символа')
  .max(100, 'Slug слишком длинный')
  .regex(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, 'Slug может содержать только буквы, цифры и дефисы (без точек и спецсимволов)');

export const checkLearnAccessSchema = z.object({
  params: z.object({}),
  query: z.object({
    slug: courseSlugSchema,
  }),
  body: z.object({}),
});
