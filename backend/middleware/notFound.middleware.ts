// middleware/notFound.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const message = `Маршрут ${req.method} ${req.path} не найден`;
  next(AppError.notFound(message));
};