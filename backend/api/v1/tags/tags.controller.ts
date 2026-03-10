// api/v1/tags/tags.controller.ts
import type { Request, Response } from "express";
import { tagsService } from "../../../services/tags.service";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import { createError } from "../../../middleware/error.middleware";
import type { ITag } from "../../../models/Tag";

type AuthRequest = Request & { user?: AuthenticatedUser };

// ==================== Response Types ====================

interface TagResponse {
  _id: string;
  name: string;
  slug: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface TagsListResponse {
  tags: TagResponse[];
}

interface TagCreateRequest {
  name: string;
  slug: string;
  color: string;
}

interface TagUpdateRequest {
  name?: string;
  slug?: string;
  color?: string;
}

interface TagParams {
  id: string;
}

// ==================== Helper Functions ====================

const toTagResponse = (tag: ITag): TagResponse => ({
  _id: tag._id.toString(),
  name: tag.name,
  slug: tag.slug,
  color: tag.color,
  createdAt: tag.createdAt.toISOString(),
  updatedAt: tag.updatedAt.toISOString(),
});

// ==================== Controller Functions ====================

/**
 * Получить все теги
 * GET /v1/tags
 */
export const getAllTags = async (_req: Request, res: Response<TagsListResponse>) => {
  const tags = await tagsService.getAll();
  res.json({
    tags: tags.map((tag) => ({
      _id: tag._id.toString(),
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    })),
  });
};

/**
 * Поиск тегов по названию
 * GET /v1/tags/search?query=...
 */
export const searchTags = async (req: Request, res: Response<TagsListResponse>) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    throw createError.badRequest("Параметр 'query' обязателен");
  }

  const tags = await tagsService.search(query);
  res.json({
    tags: tags.map((tag) => ({
      _id: tag._id.toString(),
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    })),
  });
};

/**
 * Получить тег по ID
 * GET /v1/tags/:id
 */
export const getTagById = async (req: Request, res: Response<TagResponse>) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const tag = await tagsService.getById(id);
  res.json(toTagResponse(tag));
};

/**
 * Создать новый тег (только admin/teacher)
 * POST /v1/tags
 */
export const createTag = async (req: AuthRequest, res: Response<TagResponse>) => {
  const user = req.user;
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    throw createError.forbidden("Только администратор или преподаватель может создавать теги");
  }

  const body = req.body as TagCreateRequest;

  if (!body.name || !body.slug || !body.color) {
    throw createError.badRequest("Поля 'name', 'slug' и 'color' обязательны");
  }

  const tag = await tagsService.create(body);
  res.status(201).json(toTagResponse(tag));
};

/**
 * Обновить тег (только admin/teacher)
 * PATCH /v1/tags/:id
 */
export const updateTag = async (req: AuthRequest, res: Response<TagResponse>) => {
  const user = req.user;
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    throw createError.forbidden("Только администратор или преподаватель может обновлять теги");
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body as TagUpdateRequest;

  const tag = await tagsService.update(id, body);
  res.json(toTagResponse(tag));
};

/**
 * Удалить тег (только admin)
 * DELETE /v1/tags/:id
 */
export const deleteTag = async (req: AuthRequest, res: Response<void>) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    throw createError.forbidden("Только администратор может удалять теги");
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await tagsService.delete(id);
  res.status(204).send();
};

/**
 * Получить теги курса
 * GET /v1/courses/:courseId/tags
 */
export const getCourseTags = async (req: Request, res: Response<TagsListResponse>) => {
  const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
  const tags = await tagsService.getCourseTags(courseId);
  res.json({
    tags: tags.map(toTagResponse),
  });
};

/**
 * Присвоить теги курсу (только admin/teacher)
 * POST /v1/courses/:courseId/tags
 */
export const assignTagsToCourse = async (req: AuthRequest, res: Response<void>) => {
  const user = req.user;
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    throw createError.forbidden("Только администратор или преподаватель может управлять тегами курса");
  }

  const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
  const body = req.body as { tagIds?: string[] };
  const tagIds = body.tagIds || [];

  if (!Array.isArray(tagIds)) {
    throw createError.badRequest("Поле 'tagIds' должно быть массивом");
  }

  await tagsService.assignTagsToCourse(courseId, tagIds);
  res.status(204).send();
};
