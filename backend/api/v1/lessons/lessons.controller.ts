// api/v1/lessons/lessons.controller.ts
import type { Request, Response } from 'express';
import { lessonsService } from '../../../services/lessons.service';
import type {
  CreateLessonRequest,
  UpdateLessonRequest,
  DeleteLessonRequest,
  ReorderLessonsRequest,
  GetLessonsBySectionRequest,
  LessonResponse,
  LessonsListResponse,
  ReorderLessonsResponse,
  LessonBlockResponse,
} from './lessons.types';
import { ApiError } from '../../../utils/ApiError';
import type { AuthenticatedUser } from '../../../middleware/auth.middleware';
import type { Types } from 'mongoose';

type AuthRequest = Request & { user?: AuthenticatedUser };

interface LessonData {
  _id: Types.ObjectId;
  section_id: Types.ObjectId;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

const toLessonBlockResponse = (block: unknown): LessonBlockResponse => {
  const b = block as Record<string, unknown>;
  return {
    id: String(b.id),
    title: String(b.title),
    type: b.type as 'text' | 'video' | 'quiz',
    content: b.content as Record<string, unknown>,
    order_index: b.order_index as number | undefined,
  };
};

const toLessonResponse = (lesson: LessonData): LessonResponse => ({
  _id: lesson._id.toString(),
  section_id: lesson.section_id.toString(),
  title: lesson.title,
  slug: lesson.slug,
  is_free: lesson.is_free,
  order_index: lesson.order_index,
  content_blocks: lesson.content_blocks.map(toLessonBlockResponse),
  createdAt: lesson.createdAt.toISOString(),
  updatedAt: lesson.updatedAt.toISOString(),
});

export const lessonsController = {
  async getBySection(
    req: Request<GetLessonsBySectionRequest['params']>,
    res: Response<LessonsListResponse>
  ): Promise<void> {
    const { sectionId } = req.params;
    const lessons = await lessonsService.getBySection(sectionId);
    res.json({ lessons: lessons.map((l) => toLessonResponse(l as unknown as LessonData)) });
  },

  async create(
    req: Request<CreateLessonRequest['params'], unknown, CreateLessonRequest['body']>,
    res: Response<LessonResponse>
  ): Promise<void> {
    const { sectionId } = req.params;
    const lessonData = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user || (authReq.user.role !== 'admin' && authReq.user.role !== 'teacher')) {
      throw ApiError.forbidden('Создавать уроки могут только преподаватели');
    }

    const lesson = await lessonsService.create({
      ...lessonData,
      section_id: sectionId,
    });

    res.status(201).json(toLessonResponse(lesson as unknown as LessonData));
  },

  async update(
    req: Request<UpdateLessonRequest['params'], unknown, UpdateLessonRequest['body']>,
    res: Response<LessonResponse>
  ): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user || (authReq.user.role !== 'admin' && authReq.user.role !== 'teacher')) {
      throw ApiError.forbidden('Редактировать уроки могут только преподаватели');
    }

    const lesson = await lessonsService.update(id, updateData);
    res.json(toLessonResponse(lesson as unknown as LessonData));
  },

  async delete(
    req: Request<DeleteLessonRequest['params']>,
    res: Response<void>
  ): Promise<void> {
    const { id } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user || (authReq.user.role !== 'admin' && authReq.user.role !== 'teacher')) {
      throw ApiError.forbidden('Удалять уроки могут только преподаватели');
    }

    await lessonsService.delete(id);
    res.status(204).send();
  },

  async reorder(
    req: Request<ReorderLessonsRequest['params'], unknown, ReorderLessonsRequest['body']>,
    res: Response<ReorderLessonsResponse>
  ): Promise<void> {
    const { sectionId } = req.params;
    const { lessonIds } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user || (authReq.user.role !== 'admin' && authReq.user.role !== 'teacher')) {
      throw ApiError.forbidden('Изменять порядок уроков могут только преподаватели');
    }

    await lessonsService.reorder(sectionId, lessonIds);
    res.json({ success: true, message: 'Порядок уроков обновлён' });
  },
};