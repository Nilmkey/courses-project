import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// Кастомный класс ошибки с кодом статуса
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Фабричные функции для частых случаев
export const createError = {
  badRequest: (message = "Некорректный запрос") => new AppError(message, 400),
  unauthorized: (message = "Не авторизован") => new AppError(message, 401),
  forbidden: (message = "Доступ запрещён") => new AppError(message, 403),
  notFound: (message = "Не найдено") => new AppError(message, 404),
  conflict: (message = "Конфликт данных") => new AppError(message, 409),
  internal: (message = "Внутренняя ошибка сервера") => new AppError(message, 500),
};

// Основной middleware обработчик ошибок
export function errorHandler(
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Обработка ошибок валидации Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Ошибка валидации данных",
      errors: err.flatten().fieldErrors,
    });
  }

  // Определяем статус код
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  // Формируем ответ
  const response = {
    success: false,
    message: err.message || "Произошла непредвиденная ошибка",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  };

  // Логируем ошибку на сервере
  console.error(`[ERROR ${statusCode}] ${req.method} ${req.path}:`, err.message);

  return res.status(statusCode).json(response);
}

// Async-обёртка для контроллеров (чтобы не писать try-catch вручную)
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
