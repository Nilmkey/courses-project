// services/courses.service.ts
import { Course, Section, Lesson } from "../models";
import { createError } from "../middleware/error.middleware";
import type { ICourse } from "../models";
import type { Types } from "mongoose";

type LeanCourse = Omit<ICourse, keyof Document>;

export const coursesService = {
  async getAll(): Promise<LeanCourse[]> {
    const courses = await Course.find().select("-__v").lean();
    console.log('📦 Сырые курсы из БД:', JSON.stringify(courses, null, 2));
    return courses;
  },

  async getBySlug(slug: string) {
    const course = await Course.findOne({ slug }).lean();
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    const sections = await Section.find({ course_id: course._id })
      .sort({ order_index: 1 })
      .lean();

    const lessons = await Lesson.find({
      section_id: { $in: sections.map((s) => s._id) },
    })
      .sort({ order_index: 1 })
      .lean();

    const sectionsWithLessons = sections.map((section) => ({
      ...section,
      lessons: lessons.filter((l) => l.section_id.equals(section._id)),
    }));

    return { ...course, sections: sectionsWithLessons };
  },

  async getById(id: string) {
    const course = await Course.findById(id).lean();
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    const sections = await Section.find({ course_id: course._id })
      .sort({ order_index: 1 })
      .lean();

    const lessons = await Lesson.find({
      section_id: { $in: sections.map((s) => s._id) },
    })
      .sort({ order_index: 1 })
      .lean();

    const sectionsWithLessons = sections.map((section) => ({
      ...section,
      lessons: lessons.filter((l) => l.section_id.equals(section._id)),
    }));

    return { ...course, sections: sectionsWithLessons };
  },

  /**
   * Создаёт новый курс с данными по умолчанию
   * @param authorId - ID автора курса (из сессии пользователя)
   */
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
    });

    return course;
  },

  async update(id: string, data: Partial<ICourse>): Promise<LeanCourse> {
    const course = await Course.findById(id);
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

    const updated = await Course.findByIdAndUpdate(
      id,
      data,
      { new: true },
    ).lean();

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
      { new: true },
    ).lean();

    return updated as LeanCourse;
  },
};
