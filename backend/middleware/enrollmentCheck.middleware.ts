// middleware/enrollmentCheck.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { enrollmentService } from "../services/enrollment.service";
import type { AuthenticatedUser } from "./auth.middleware";

type AuthRequest = Request & { user?: AuthenticatedUser };

/**
 * Middleware для проверки, что пользователь записан на курс.
 * courseId берётся из req.params.courseId
 */
export const requireEnrollment = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    next(ApiError.unauthorized("Требуется авторизация"));
    return;
  }

  const courseId = req.params.courseId;
  if (!courseId) {
    next(ApiError.badRequest("courseId не указан"));
    return;
  }

  const isEnrolled = await enrollmentService.isEnrolled(
    user.id,
    courseId as string,
  );
  if (!isEnrolled) {
    next(ApiError.forbidden("Вы не записаны на этот курс"));
    return;
  }

  next();
};

/**
 * Middleware для проверки, что пользователь записан на курс.
 * courseId берётся из req.body.courseId
 */
export const requireEnrollmentFromBody = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    next(ApiError.unauthorized("Требуется авторизация"));
    return;
  }

  const courseId = req.body?.courseId;
  if (!courseId) {
    next(ApiError.badRequest("courseId не указан в теле запроса"));
    return;
  }

  const isEnrolled = await enrollmentService.isEnrolled(user.id, courseId);
  if (!isEnrolled) {
    next(ApiError.forbidden("Вы не записаны на этот курс"));
    return;
  }

  next();
};
