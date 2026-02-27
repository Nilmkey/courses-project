// middleware/teacher.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import type { AuthenticatedUser } from "./auth.middleware";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export const teacherMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authenticatedReq = req as AuthenticatedRequest;
  const user = authenticatedReq.user;

  if (!user) {
    next(AppError.unauthorized("Требуется авторизация"));
    return;
  }

  if (user.role !== "teacher" && user.role !== "admin") {
    next(AppError.forbidden("Требуется роль преподавателя или администратора"));
    return;
  }

  next();
};
