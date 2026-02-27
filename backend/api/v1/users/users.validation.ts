// api/v1/users/users.validation.ts
import { z } from "zod";

export const updateMyProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Имя должно содержать минимум 2 символа")
      .optional(),
    avatar: z.string().url().optional().or(z.literal("")),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
  }),
});
