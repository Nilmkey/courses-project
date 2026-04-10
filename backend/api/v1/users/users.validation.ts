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

export const getUsersListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    search: z.string().optional(),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
  }),
  body: z.object({
    role: z.enum(["admin", "student"]),
  }),
});

export const getUserEnrollmentsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
  }),
});

export const deleteUserEnrollmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат courseId"),
  }),
});

export const resetUserProgressSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат ID"),
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Неверный формат courseId"),
  }),
});
