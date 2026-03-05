// api/v1/users/users.controller.ts
import type { Request, Response } from "express";
import type {
  UpdateMyProfileRequest,
  GetUserByIdRequest,
  UserProfileResponse,
} from "./users.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import { auth } from "../../../auth";

type AuthRequest = Request & { user?: AuthenticatedUser };

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "teacher" | "student";
  createdAt: Date;
}

const toUserProfileResponse = (user: UserData): UserProfileResponse => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
});

// Конвертируем заголовки Express в формат Headers для Better Auth
const getHeadersForAuth = (
  headers: Record<string, string | string[] | undefined>,
): Headers => {
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

export const usersController = {
  async getMyProfile(
    req: Request,
    res: Response<UserProfileResponse>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const headers = getHeadersForAuth(req.headers);
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw ApiError.unauthorized("Пользователь не найден");
    }

    const userData: UserData = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar: (session.user as UserData).avatar,
      role: (session.user as UserData).role ?? "student",
      createdAt: new Date(),
    };

    res.json(toUserProfileResponse(userData));
  },

  async updateMyProfile(
    req: Request<unknown, unknown, UpdateMyProfileRequest["body"]>,
    res: Response<UserProfileResponse>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const { name, avatar } = req.body;

    const headers = getHeadersForAuth(req.headers);
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw ApiError.unauthorized("Пользователь не найден");
    }

    const userData: UserData = {
      id: session.user.id,
      email: session.user.email,
      name: name ?? session.user.name,
      avatar: avatar ?? (session.user as UserData).avatar,
      role: (session.user as UserData).role ?? "student",
      createdAt: new Date(),
    };

    res.json(toUserProfileResponse(userData));
  },

  async getUserById(
    req: Request<GetUserByIdRequest["params"]>,
    res: Response<UserProfileResponse>,
  ): Promise<void> {
    const { id } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    // Заглушка — в реальности нужно получать из БД
    const userData: UserData = {
      id,
      email: "user@example.com",
      name: "User",
      avatar: undefined,
      role: "student",
      createdAt: new Date(),
    };

    res.json(toUserProfileResponse(userData));
  },
};
