import { Lesson, Section, Progress } from "../models";
import { ApiError } from "../utils/ApiError";
import type { ILesson } from "../models";
import type { Types } from "mongoose";
import { progressService } from "./progress.service";

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

    // Пересчитываем прогресс всех пользователей после добавления урока
    try {
      const section = await Section.findById(data.section_id);
      if (section) {
        await progressService.recalculateCourseProgress(section.course_id.toString());
      }
    } catch (error) {
      console.error("[Lessons] Ошибка пересчета прогресса после создания урока:", error);
    }

    return lesson;
  },

  async update(id: string, data: LessonUpdateInput): Promise<ILesson> {
    const updated = await Lesson.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    }).lean();
    if (!updated) {
      throw ApiError.notFound("Урок не найден");
    }

    // Если обновляются блоки - пересчитываем прогресс
    if (data.content_blocks) {
      const lesson = await Lesson.findById(id);
      if (lesson) {
        const section = await Section.findById(lesson.section_id);
        if (section) {
          try {
            await progressService.recalculateCourseProgress(section.course_id.toString());
          } catch (error) {
            console.error("[Lessons] Ошибка пересчета прогресса после обновления урока:", error);
          }
        }
      }
    }

    return updated;
  },

  async delete(id: string): Promise<void> {
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw ApiError.notFound("Урок не найден");
    }

    const sectionId = lesson.section_id;
    const section = await Section.findById(sectionId);
    const courseId = section?.course_id.toString();

    // Удаляем ID урока из массива lessons секции
    await Section.findByIdAndUpdate(lesson.section_id, {
      $pull: { lessons: lesson._id },
    });

    await Lesson.findByIdAndDelete(id);

    // Пересчитываем прогресс всех пользователей после удаления урока
    if (courseId) {
      try {
        await progressService.recalculateCourseProgress(courseId);
      } catch (error) {
        console.error("[Lessons] Ошибка пересчета прогресса после удаления урока:", error);
      }
    }
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

  /**
   * Добавить блок контента к уроку
   */
  async addBlock(lessonId: string, block: LessonBlockInput): Promise<ILesson> {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound("Урок не найден");
    }

    const section = await Section.findById(lesson.section_id);
    if (!section) {
      throw ApiError.notFound("Секция не найдена");
    }

    const updated = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        $push: {
          content_blocks: {
            ...block,
            order_index: block.order_index ?? lesson.content_blocks.length,
          },
        },
      },
      { returnDocument: "after" },
    ).lean();

    if (!updated) {
      throw ApiError.notFound("Урок не найден");
    }

    // Пересчитываем прогресс всех пользователей после добавления блока
    try {
      await progressService.recalculateCourseProgress(section.course_id.toString());
    } catch (error) {
      console.error("[Lessons] Ошибка пересчета прогресса после добавления блока:", error);
    }

    return updated;
  },

  /**
   * Удалить блок контента из урока
   */
  async removeBlock(lessonId: string, blockId: string): Promise<ILesson> {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound("Урок не найден");
    }

    const section = await Section.findById(lesson.section_id);
    if (!section) {
      throw ApiError.notFound("Секция не найдена");
    }

    const updated = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        $pull: { content_blocks: { id: blockId } },
      },
      { returnDocument: "after" },
    ).lean();

    if (!updated) {
      throw ApiError.notFound("Урок не найден");
    }

    // Пересчитываем прогресс всех пользователей после удаления блока
    try {
      await progressService.recalculateCourseProgress(section.course_id.toString());
    } catch (error) {
      console.error("[Lessons] Ошибка пересчета прогресса после удаления блока:", error);
    }

    return updated;
  },
};
