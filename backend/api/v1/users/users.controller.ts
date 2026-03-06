// api/v1/users/users.controller.ts
import type { Request, Response } from "express";
import type {
  UpdateMyProfileRequest,
  GetUserByIdRequest,
  UserProfileResponse,
  UploadAvatarResponse,
} from "./users.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import { auth, type ExtendedUser } from "../../../auth";
import { uploadImage, deleteImage, extractPublicId } from "../../../utils/cloudinary";
import fs from "fs";
import path from "path";

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

    const extendedUser = session.user as unknown as ExtendedUser;
    const userData: UserData = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar: extendedUser.image ?? undefined,
      role: extendedUser.role ?? "student",
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

    const extendedUser = session.user as unknown as ExtendedUser;
    const userData: UserData = {
      id: session.user.id,
      email: session.user.email,
      name: name ?? session.user.name,
      avatar: avatar ?? extendedUser.image ?? undefined,
      role: extendedUser.role ?? "student",
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

  async uploadAvatar(
    req: Request,
    res: Response<UploadAvatarResponse>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    // Отладка: проверяем, что пришёл с запросом
    console.log('=== Upload Avatar Debug ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('req.headers.content-type:', req.headers['content-type']);
    console.log('========================');

    if (!req.file) {
      throw ApiError.badRequest("Файл не найден. Убедитесь, что файл отправляется в формате multipart/form-data с полем 'avatar'");
    }

    const headers = getHeadersForAuth(req.headers);
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw ApiError.unauthorized("Пользователь не найден");
    }

    const extendedUser = session.user as unknown as ExtendedUser;
    const oldAvatarUrl = extendedUser.image;

    // Если был старый аватар, удаляем его из Cloudinary
    if (oldAvatarUrl) {
      const oldPublicId = extractPublicId(oldAvatarUrl);
      if (oldPublicId) {
        await deleteImage(oldPublicId).catch((err) => {
          console.error("Error deleting old avatar:", err);
        });
      }
    }

    // Загружаем новый аватар в Cloudinary
    const filePath = path.resolve(req.file.path);
    const result = await uploadImage(filePath);

    // Удаляем временный файл
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    // Обновляем аватар в Better Auth через updateUser
    await auth.api.updateUser({
      body: {
        image: result.url,
      },
      headers,
    });

    res.json({
      avatar: result.url,
      message: "Аватар успешно загружен",
    });
  },

  async deleteAvatar(
    req: Request,
    res: Response<{ message: string }>,
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

    const extendedUser = session.user as unknown as ExtendedUser;
    const avatarUrl = extendedUser.image;

    if (!avatarUrl) {
      throw ApiError.badRequest("Аватар не установлен");
    }

    const publicId = extractPublicId(avatarUrl);
    if (publicId) {
      await deleteImage(publicId);
    }

    // Удаляем аватар из Better Auth
    await auth.api.updateUser({
      body: {
        image: null,
      },
      headers,
    });

    res.json({ message: "Аватар успешно удалён" });
  },
};
