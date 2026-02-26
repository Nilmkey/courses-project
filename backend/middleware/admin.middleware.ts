// middleware/admin.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import type { AuthenticatedUser } from "./auth.middleware";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export const adminMiddleware = (
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

  if (user.role !== "admin") {
    next(AppError.forbidden("Требуется роль администратора"));
    return;
  }

  next();
};
