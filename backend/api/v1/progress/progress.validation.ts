// api/v1/progress/progress.validation.ts
import { z } from 'zod';

const QuizAnswerSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.union([z.number(), z.array(z.number()), z.string()]),
  isCorrect: z.boolean(),
});

export const markLessonCompleteSchema = z.object({
  params: z.object({
    lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID урока'),
  }),
  body: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});

export const resetProgressSchema = z.object({
  params: z.object({
    lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID урока'),
  }),
  body: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});

export const getCourseProgressSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});

export const getLessonProgressSchema = z.object({
  params: z.object({
    lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID урока'),
  }),
  query: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});

export const updateLessonProgressSchema = z.object({
  params: z.object({
    lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID урока'),
  }),
  body: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
    completed: z.boolean(),
    quizAnswers: z.array(QuizAnswerSchema).optional(),
  }),
});

export const initializeProgressSchema = z.object({
  body: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});

export const markBlockCompleteSchema = z.object({
  params: z.object({
    lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID урока'),
  }),
  body: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
    blockId: z.string(),
    quizAnswers: z.array(QuizAnswerSchema).optional(),
  }),
});

export const recalculateProgressSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Неверный формат ID курса'),
  }),
});