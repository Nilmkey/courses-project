import { Request, Response, NextFunction } from "express";
import { auth } from "@/backend/auth";
import { fromNodeHeaders } from "better-auth/node";

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Получаем сессию через Better Auth
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  // Если сессии нет или роль не "admin" (или "teacher", смотря как ты назовешь)
  if (!session || session.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Доступ запрещен. Требуются права администратора." });
  }

  // Если всё ок — идем дальше
  next();
};
