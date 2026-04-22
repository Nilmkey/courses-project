import { Section, Lesson, Progress } from "../models";
import { ApiError } from "../utils/ApiError";
import type { ISection } from "../models";
import mongoose, { Types } from "mongoose";
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
    return updated as unknown as ISection;
  },

  async delete(id: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const section = await Section.findById(id).session(session);
      if (!section) {
        throw ApiError.notFound("Секция не найдена");
      }

      const courseId = section.course_id.toString();

      await Lesson.deleteMany({ section_id: id }).session(session);
      await Section.findByIdAndDelete(id).session(session);

      await session.commitTransaction();

      // Пересчитываем прогресс фоном
      progressService.recalculateCourseProgress(courseId).catch(console.error);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async reorder(courseId: string, sectionIds: string[]): Promise<void> {
    if (sectionIds.length === 0) return;

    const bulkOps = sectionIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { order_index: index } },
      },
    }));

    await Section.bulkWrite(bulkOps);
  },

  async getByCourse(courseId: string): Promise<ISection[]> {
    return await Section.find({ course_id: courseId })
      .sort({ order_index: 1 })
      .populate("lessons")
      .lean();
  },
};
