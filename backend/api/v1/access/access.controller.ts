// api/v1/access/access.controller.ts
import type { Request, Response } from 'express';
import { coursesService } from '../../../services/courses.service';
import { enrollmentService } from '../../../services/enrollment.service';
import { ApiError } from '../../../utils/ApiError';
import type { AuthenticatedUser } from '../../../middleware/auth.middleware';
import type {
  CheckLearnAccessRequest,
  CheckLearnAccessResponse,
} from './access.types';

type AuthRequest = Request<unknown, unknown, unknown, CheckLearnAccessRequest['query']>;

export const accessController = {
  /**
   * Проверить доступ пользователя к курсу по slug.
   *
   * Админ имеет доступ ко всем курсам.
   * Обычный пользователь — только если записан на курс.
   *
   * Возвращает: { hasAccess, course, user } за один запрос.
   */
  async checkLearnAccess(
    req: AuthRequest,
    res: Response<CheckLearnAccessResponse>,
  ): Promise<void> {
    const authReq = req as AuthRequest & { user: AuthenticatedUser };

    if (!authReq.user) {
      throw ApiError.unauthorized('Требуется авторизация');
    }

    const { slug } = req.query;

    // 1. Ищем курс по slug
    let course;
    try {
      course = await coursesService.getBySlug(slug);
    } catch {
      // Курс не найден — возвращаем null с hasAccess: false
      res.json({
        hasAccess: false,
        course: null,
        user: {
          id: authReq.user.id,
          email: authReq.user.email,
          name: authReq.user.name,
          role: authReq.user.role,
        },
      });
      return;
    }

    // 2. Админ имеет доступ ко всему
    if (authReq.user.role === 'admin') {
      res.json({
        hasAccess: true,
        course: {
          _id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          thumbnail: course.thumbnail,
          level: course.level,
          isPublished: course.isPublished,
        },
        user: {
          id: authReq.user.id,
          email: authReq.user.email,
          name: authReq.user.name,
          role: authReq.user.role,
        },
      });
      return;
    }

    // 3. Проверяем запись пользователя на курс
    const isEnrolled = await enrollmentService.isEnrolled(
      authReq.user.id,
      course._id.toString(),
    );

    res.json({
      hasAccess: isEnrolled,
      course: {
        _id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        level: course.level,
        isPublished: course.isPublished,
      },
      user: {
        id: authReq.user.id,
        email: authReq.user.email,
        name: authReq.user.name,
        role: authReq.user.role,
      },
    });
  },
};
