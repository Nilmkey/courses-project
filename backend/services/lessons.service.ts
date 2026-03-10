// services/lessons.service.ts
import { Lesson, Section } from "../models";
import { ApiError } from "../utils/ApiError";
import type { ILesson } from "../models";
import type { Types } from "mongoose";

export interface LessonBlockInput {
  id: string;
  title: string;
  type: "text" | "video" | "quiz";
  content: Record<string, unknown>;
  order_index?: number;
}

export interface LessonCreateInput {
  section_id: string | Types.ObjectId;
  title: string;
  slug: string;
  order_index?: number;
  is_free?: boolean;
  content_blocks?: LessonBlockInput[];
}

export interface LessonUpdateInput {
  title?: string;
  slug?: string;
  order_index?: number;
  is_free?: boolean;
  content_blocks?: LessonBlockInput[];
}

export const lessonsService = {
  async create(data: LessonCreateInput): Promise<ILesson> {
    const lesson = await Lesson.create({
      section_id: data.section_id,
      title: data.title,
      slug: data.slug,
      order_index: data.order_index ?? 0,
      is_free: data.is_free ?? false,
      content_blocks: data.content_blocks?.map((b, i) => ({
        ...b,
        order_index: b.order_index ?? i,
      })),
    });

    // Добавляем ID урока в массив lessons секции
    await Section.findByIdAndUpdate(data.section_id, {
      $push: { lessons: lesson._id },
    });

    return lesson;
  },

  async update(id: string, data: LessonUpdateInput): Promise<ILesson> {
    const updated = await Lesson.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    }).lean();
    if (!updated) {
      throw ApiError.notFound("Урок не найден");
    }
    return updated;
  },

  async delete(id: string): Promise<void> {
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw ApiError.notFound("Урок не найден");
    }

    // Удаляем ID урока из массива lessons секции
    await Section.findByIdAndUpdate(lesson.section_id, {
      $pull: { lessons: lesson._id },
    });

    await Lesson.findByIdAndDelete(id);
  },

  async reorder(sectionId: string, lessonIds: string[]): Promise<void> {
    const updates = lessonIds.map((id, index) =>
      Lesson.findByIdAndUpdate(id, { order_index: index }),
    );
    await Promise.all(updates);
  },

  async getBySection(sectionId: string): Promise<ILesson[]> {
    return await Lesson.find({ section_id: sectionId })
      .sort({ order_index: 1 })
      .lean();
  },

  async getById(id: string): Promise<ILesson> {
    const lesson = await Lesson.findById(id).lean();
    if (!lesson) {
      throw ApiError.notFound("Урок не найден");
    }
    return lesson;
  },
};
