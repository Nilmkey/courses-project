// middleware/error.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Некорректный запрос") {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Не авторизован") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Доступ запрещён") {
    return new AppError(message, 403);
  }

  static notFound(message = "Не найдено") {
    return new AppError(message, 404);
  }

  static conflict(message = "Конфликт данных") {
    return new AppError(message, 409);
  }

  static internal(message = "Внутренняя ошибка сервера") {
    return new AppError(message, 500);
  }
}

export const createError = {
  badRequest: AppError.badRequest,
  unauthorized: AppError.unauthorized,
  forbidden: AppError.forbidden,
  notFound: AppError.notFound,
  conflict: AppError.conflict,
  internal: AppError.internal,
};

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
  stack?: string;
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      success: false,
      message: "Ошибка валидации данных",
      errors: err.flatten().fieldErrors,
    };
    res.status(400).json(response);
    return;
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  const response: ErrorResponse = {
    success: false,
    message: err.message || "Произошла непредвиденная ошибка",
    ...(isDevelopment && { stack: err.stack }),
  };

  console.error(
    `[ERROR ${statusCode}] ${_req.method} ${_req.path}:`,
    err.message,
  );

  res.status(statusCode).json(response);
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
