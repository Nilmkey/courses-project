// middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { auth } from '../auth';
import { AppError } from './error.middleware';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

const getHeadersForAuth = (headers: Record<string, string | string[] | undefined>): Headers => {
  const headerEntries: [string, string][] = [];

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        headerEntries.push([key, v]);
      }
    } else if (value !== undefined) {
      headerEntries.push([key, value]);
    }
  }

  return new Headers(headerEntries);
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const headers = getHeadersForAuth(req.headers);
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      next(AppError.unauthorized('Пользователь не авторизован'));
      return;
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as AuthenticatedUser).role ?? 'student',
    };

    next();
  } catch (_error) {
    next(AppError.unauthorized('Ошибка при проверке авторизации'));
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const headers = getHeadersForAuth(req.headers);
    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as AuthenticatedUser).role ?? 'student',
      };
    }
  } catch (_error) {
    // Игнорируем ошибки для опциональной авторизации
  }

  next();
};