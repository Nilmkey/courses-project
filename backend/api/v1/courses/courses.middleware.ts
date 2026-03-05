// api/v1/courses/courses.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ApiError } from '../../../utils/ApiError';

export const validateRequest = <T extends ZodObject>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        next(ApiError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
};

export const checkCourseAccess = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const user = (req as unknown as { user?: { role: string; id: string } }).user;

  if (!user) {
    next(ApiError.unauthorized('Требуется авторизация'));
    return;
  }

  // Админ может всё
  if (user.role === 'admin') {
    next();
    return;
  }

  // Преподаватель может управлять своими курсами
  // Здесь можно добавить проверку author_id курса
  if (user.role === 'teacher') {
    next();
    return;
  }

  // Студент может только читать
  if (req.method === 'GET') {
    next();
    return;
  }

  next(ApiError.forbidden('Недостаточно прав для этой операции'));
};