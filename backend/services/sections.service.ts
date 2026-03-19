import { Section, Lesson, Progress } from "../models";
import { ApiError } from "../utils/ApiError";
import type { ISection } from "../models";
import type { Types } from "mongoose";
import { progressService } from "./progress.service";

export interface SectionCreateInput {
  course_id: string | Types.ObjectId;
  title: string;
  order_index?: number;
  isDraft?: boolean;
  lessons?: string[];
}

export interface SectionUpdateInput {
  title?: string;
  order_index?: number;
  isDraft?: boolean;
  lessons?: string[];
}

export const sectionsService = {
  async create(data: SectionCreateInput): Promise<ISection> {
    const section = await Section.create({
      course_id: data.course_id,
      title: data.title,
      order_index: data.order_index ?? 0,
      isDraft: data.isDraft ?? false,
      lessons: data.lessons ?? [],
    });

    // Пересчитываем прогресс всех пользователей после добавления секции
    try {
      await progressService.recalculateCourseProgress(data.course_id.toString());
    } catch (error) {
      console.error("[Sections] Ошибка пересчета прогресса после создания секции:", error);
    }

    return section;
  },

  async update(id: string, data: SectionUpdateInput): Promise<ISection> {
    const updated = await Section.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    }).lean();
    if (!updated) {
      throw ApiError.notFound("Секция не найдена");
    }
    return updated;
  },

  async delete(id: string): Promise<void> {
    const section = await Section.findById(id);
    if (!section) {
      throw ApiError.notFound("Секция не найдена");
    }

    const courseId = section.course_id.toString();

    await Lesson.deleteMany({ section_id: id });
    await Section.findByIdAndDelete(id);

    // Пересчитываем прогресс всех пользователей после удаления секции
    try {
      await progressService.recalculateCourseProgress(courseId);
    } catch (error) {
      console.error("[Sections] Ошибка пересчета прогресса после удаления секции:", error);
    }
  },

  async reorder(courseId: string, sectionIds: string[]): Promise<void> {
    const updates = sectionIds.map((id, index) =>
      Section.findByIdAndUpdate(id, { order_index: index }),
    );
    await Promise.all(updates);
  },

  async getByCourse(courseId: string): Promise<ISection[]> {
    return await Section.find({ course_id: courseId })
      .sort({ order_index: 1 })
      .populate("lessons")
      .lean();
  },
};
