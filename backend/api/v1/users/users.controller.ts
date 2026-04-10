// api/v1/users/users.controller.ts
import type { Request, Response } from "express";
import type {
  UpdateMyProfileRequest,
  GetUserByIdRequest,
  UserProfileResponse,
  UploadAvatarResponse,
  UsersListResponse,
  UpdateUserRoleRequest,
  UserEnrollmentResponse,
} from "./users.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import { auth, type ExtendedUser } from "../../../auth";
import { uploadImage, deleteImage, extractPublicId } from "../../../utils/cloudinary";
import { Enrollment, Progress, Course, Section } from "../../../models";
import type { IEnrollment } from "../../../models";
import { Types } from "mongoose";
import { progressService } from "../../../services/progress.service";
import { enrollmentService } from "../../../services/enrollment.service";
import { db } from "../../../lib/db";
import fs from "fs";
import path from "path";

type AuthRequest = Request & { user?: AuthenticatedUser };

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "student";
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

    // Получаем пользователя из MongoDB
    const userDoc = await db.collection("user").findOne({ _id: new Types.ObjectId(id) });

    if (!userDoc) {
      throw ApiError.notFound("Пользователь не найден");
    }

    const userData: UserData = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      avatar: userDoc.image ?? undefined,
      role: userDoc.role ?? "student",
      createdAt: new Date(userDoc.createdAt || Date.now()),
    };

    res.json(toUserProfileResponse(userData));
  },

  async getAllUsers(
    req: Request,
    res: Response<UsersListResponse>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    if (!db) {
      throw ApiError.internal("База данных не подключена");
    }

    const queryRaw = req.query as any;
    const page = parseInt(queryRaw.page || "1", 10);
    const limit = parseInt(queryRaw.limit || "20", 10);
    const search = queryRaw.search;
    const skip = (page - 1) * limit;

    // Получаем пользователей напрямую из MongoDB
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    console.log("Получение пользователей из MongoDB, query:", query);
    const total = await db.collection("user").countDocuments(query);
    const usersDocs = await db.collection("user")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log("Найдено пользователей:", usersDocs.length);

    const users = usersDocs.map((doc: any) => ({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      avatar: doc.image ?? undefined,
      role: doc.role ?? "student",
      createdAt: new Date(doc.createdAt || Date.now()).toISOString(),
    }));

    res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  },

  async updateUserRole(
    req: Request<UpdateUserRoleRequest["params"], any, UpdateUserRoleRequest["body"]>,
    res: Response<UserProfileResponse>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const { id } = req.params;
    const { role } = req.body;

    // Обновляем роль напрямую в MongoDB
    const result = await db.collection("user").updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      throw ApiError.notFound("Пользователь не найден");
    }

    // Получаем обновленного пользователя
    const userDoc = await db.collection("user").findOne({ _id: new Types.ObjectId(id) });

    if (!userDoc) {
      throw ApiError.notFound("Пользователь не найден");
    }

    const userData: UserData = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      avatar: userDoc.image ?? undefined,
      role: userDoc.role ?? "student",
      createdAt: new Date(userDoc.createdAt || Date.now()),
    };

    res.json(toUserProfileResponse(userData));
  },

  async getUserEnrollments(
    req: Request<{ id: string }>,
    res: Response<UserEnrollmentResponse[]>,
  ): Promise<void> {
    const { id } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    // Проверяем существование пользователя
    const userDoc = await db.collection("user").findOne({ _id: new Types.ObjectId(id) });

    if (!userDoc) {
      throw ApiError.notFound("Пользователь не найден");
    }

    // Получаем все записи пользователя с populated курсами
    const enrollments = await Enrollment.find({ user_id: new Types.ObjectId(id) })
      .populate("course_id")
      .sort({ enrolledAt: -1 })
      .lean();

    const result: UserEnrollmentResponse[] = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course_id as any;
      if (!course) continue; // Курс мог быть удален

      // Получаем прогресс
      const progress = await progressService.getCourseProgress(id, course._id.toString());

      result.push({
        _id: enrollment._id.toString(),
        course_id: course._id.toString(),
        enrolledAt: enrollment.enrolledAt.toISOString(),
        completedAt: enrollment.completedAt?.toISOString(),
        status: enrollment.status,
        course: {
          _id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          thumbnail: course.thumbnail,
          level: course.level,
          isPublished: course.isPublished,
        },
        progress: progress ? {
          overallProgress: progress.progress,
          stats: {
            totalBlocks: progress.totalBlocks,
            completedBlocks: progress.completedBlocks,
            totalLessons: progress.totalLessons,
            completedLessons: progress.completedLessons,
          },
        } : undefined,
      });
    }

    res.json(result);
  },

  async deleteUserEnrollment(
    req: Request<{ id: string; courseId: string }>,
    res: Response<{ success: boolean; message: string }>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const { id, courseId } = req.params;

    // Проверяем существование пользователя
    const userDoc = await db.collection("user").findOne({ _id: new Types.ObjectId(id) });

    if (!userDoc) {
      throw ApiError.notFound("Пользователь не найден");
    }

    await enrollmentService.unenroll(id, courseId);

    res.json({
      success: true,
      message: "Пользователь отписан от курса",
    });
  },

  async resetUserProgress(
    req: Request<{ id: string; courseId: string }>,
    res: Response<{ success: boolean; message: string }>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const { id, courseId } = req.params;

    // Проверяем существование пользователя
    const userDoc = await db.collection("user").findOne({ _id: new Types.ObjectId(id) });

    if (!userDoc) {
      throw ApiError.notFound("Пользователь не найден");
    }

    // Получаем все уроки курса и сбрасываем прогресс
    const sections = await Section.find({ course_id: courseId }).lean();
    
    for (const section of sections) {
      for (const lessonId of section.lessons) {
        await progressService.resetProgress(id, lessonId.toString(), courseId);
      }
    }

    res.json({
      success: true,
      message: "Прогресс сброшен",
    });
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
