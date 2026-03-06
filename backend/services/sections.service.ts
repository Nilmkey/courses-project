// services/sections.service.ts
import { Section, Lesson } from "../models";
import { ApiError } from "../utils/ApiError";
import type { ISection } from "../models";
import type { Types } from "mongoose";

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
    return section;
  },

  async update(id: string, data: SectionUpdateInput): Promise<ISection> {
    const updated = await Section.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    }).lean();
    if (!updated) {
      throw ApiError.notFound("Секция не найдена");
    }
    return updated;
  },

  async delete(id: string): Promise<void> {
    await Lesson.deleteMany({ section_id: id });
    await Section.findByIdAndDelete(id);
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
      .populate('lessons')
      .lean();
  },
};
