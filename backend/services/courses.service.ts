import { Course, Section, Lesson } from "../models";
import { createError } from "../middleware/error.middleware";
import type { ICourse } from "../models";
import { slugify } from "../utils/slugify";
import mongoose from "mongoose";

type LeanCourse = Omit<ICourse, keyof Document>;

export const coursesService = {
  async getAll(): Promise<LeanCourse[]> {
    const courses = await Course.find().select("-__v").lean();
    return courses;
  },

  async getBySlug(slug: string) {
    const course = await Course.findOne({ slug }).lean();
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    const sections = await Section.find({ course_id: course._id })
      .sort({ order_index: 1 })
      .populate("lessons")
      .lean();

    return { ...course, sections };
  },

  async getById(id: string) {
    const course = await Course.findById(id).lean();
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    const sections = await Section.find({ course_id: course._id })
      .sort({ order_index: 1 })
      .populate("lessons")
      .lean();

    return { ...course, sections };
  },

  async create(authorId: string): Promise<LeanCourse> {
    const course = await Course.create({
      title: "Новый курс",
      slug: `new-course-${Date.now()}`,
      description: "",
      thumbnail: "",
      level: "beginner" as const,
      author_id: authorId,
      price: 0,
      isPublished: false,
      isOpenForEnrollment: false,
    });

    return course;
  },

  async update(id: string, data: Partial<ICourse>): Promise<LeanCourse> {
    const course = await Course.findById(id);
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    if (!data) {
      throw createError.badRequest("Нет даты");
    }

    // Обрабатываем tags отдельно, преобразуя строки в ObjectId
    const updateData: Partial<ICourse> = { ...data };
    
    if (data.tags) {
      updateData.tags = data.tags.map((tagId) => {
        if (typeof tagId === "string") {
          return new mongoose.Types.ObjectId(tagId);
        }
        return tagId as mongoose.Types.ObjectId;
      });
    }

    const dataWithSlug: Partial<ICourse> = {
      slug: slugify(data.title!),
      ...updateData,
    };

    const updated = await Course.findByIdAndUpdate(id, dataWithSlug, {
      returnDocument: "after",
    }).lean();

    return updated as LeanCourse;
  },

  async delete(id: string): Promise<void> {
    const course = await Course.findById(id);
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    const sections = await Section.find({ course_id: course._id });
    const sectionIds = sections.map((s) => s._id);

    await Lesson.deleteMany({ section_id: { $in: sectionIds } });
    await Section.deleteMany({ course_id: course._id });
    await Course.findByIdAndDelete(course._id);
  },

  async publish(id: string): Promise<LeanCourse> {
    const course = await Course.findById(id);
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    const updated = await Course.findByIdAndUpdate(
      id,
      { isPublished: true },
      { returnDocument: "after" },
    ).lean();

    return updated as LeanCourse;
  },
};
