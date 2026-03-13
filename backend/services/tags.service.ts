// services/tags.service.ts
import { Tag } from "../models/Tag";
import { Course } from "../models/Course";
import { createError } from "../middleware/error.middleware";
import type { ITag } from "../models/Tag";
import mongoose from "mongoose";

type LeanTag = Omit<ITag, keyof Document>;

export const tagsService = {
  /**
   * Получить все теги
   */
  async getAll(): Promise<LeanTag[]> {
    const tags = await Tag.find().sort({ name: 1 }).select("-__v").lean();
    return tags;
  },

  /**
   * Получить тег по ID
   */
  async getById(id: string): Promise<LeanTag> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError.badRequest("Некорректный ID тега");
    }

    const tag = await Tag.findById(id).lean();
    if (!tag) {
      throw createError.notFound("Тег не найден");
    }

    return tag;
  },

  /**
   * Получить тег по slug
   */
  async getBySlug(slug: string): Promise<LeanTag> {
    const tag = await Tag.findOne({ slug }).lean();
    if (!tag) {
      throw createError.notFound("Тег не найден");
    }

    return tag;
  },

  /**
   * Создать новый тег
   */
  async create(data: { name: string; slug: string; color: string }): Promise<LeanTag> {
    const { name, slug, color } = data;

    // Проверка на дубликат
    const existing = await Tag.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      if (existing.name === name) {
        throw createError.conflict("Тег с таким названием уже существует");
      }
      if (existing.slug === slug) {
        throw createError.conflict("Тег с таким slug уже существует");
      }
    }

    const tag = await Tag.create({ name, slug, color });
    return tag.toObject();
  },

  /**
   * Обновить тег
   */
  async update(
    id: string,
    data: { name?: string; slug?: string; color?: string }
  ): Promise<LeanTag> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError.badRequest("Некорректный ID тега");
    }

    // Проверка на дубликат с другими тегами
    if (data.name || data.slug) {
      const query: Record<string, unknown> = { _id: { $ne: id } };
      if (data.name) query.name = data.name;
      if (data.slug) query.slug = data.slug;

      const existing = await Tag.findOne(query);
      if (existing) {
        if (data.name && existing.name === data.name) {
          throw createError.conflict("Тег с таким названием уже существует");
        }
        if (data.slug && existing.slug === data.slug) {
          throw createError.conflict("Тег с таким slug уже существует");
        }
      }
    }

    const tag = await Tag.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!tag) {
      throw createError.notFound("Тег не найден");
    }

    return tag;
  },

  /**
   * Удалить тег
   */
  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError.badRequest("Некорректный ID тега");
    }

    // Проверка, используется ли тег в курсах
    const coursesWithTag = await Course.countDocuments({ tags: id });
    if (coursesWithTag > 0) {
      throw createError.badRequest(
        `Невозможно удалить тег: он используется в ${coursesWithTag} курс(а/х)`
      );
    }

    const deleted = await Tag.findByIdAndDelete(id);
    if (!deleted) {
      throw createError.notFound("Тег не найден");
    }
  },

  /**
   * Поиск тегов по названию (для autocomplete)
   */
  async search(query: string): Promise<LeanTag[]> {
    const tags = await Tag.find({
      name: { $regex: query, $options: "i" },
    })
      .sort({ name: 1 })
      .limit(20)
      .lean();
    return tags;
  },

  /**
   * Присвоить теги курсу
   */
  async assignTagsToCourse(courseId: string, tagIds: string[]): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw createError.badRequest("Некорректный ID курса");
    }

    // Валидация всех tagIds
    for (const tagId of tagIds) {
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        throw createError.badRequest(`Некорректный ID тега: ${tagId}`);
      }
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    course.tags = tagIds.map((id) => new mongoose.Types.ObjectId(id));
    await course.save();
  },

  /**
   * Получить теги курса
   */
  async getCourseTags(courseId: string): Promise<LeanTag[]> {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw createError.badRequest("Некорректный ID курса");
    }

    const course = await Course.findById(courseId).populate("tags").lean();
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    return course.tags as unknown as LeanTag[];
  },
};
