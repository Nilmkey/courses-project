import { Course, Section, Lesson, Progress, Enrollment } from "../models";
import { ApiError } from "../utils/ApiError";
import type { ICourse } from "../models";
import { slugify } from "../utils/slugify";
import mongoose, { Document } from "mongoose";

type LeanCourse = Omit<ICourse, keyof Document>;

export const coursesService = {
  async getAll(): Promise<LeanCourse[]> {
    const courses = await Course.find().select("-__v").lean();
    return courses as unknown as LeanCourse[];
  },

  async getBySlug(slug: string) {
    const course = await Course.findOne({ slug }).lean();
    if (!course) {
      throw ApiError.notFound("Курс не найден");
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
      throw ApiError.notFound("Курс не найден");
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

    return course.toObject() as unknown as LeanCourse;
  },

  async update(id: string, data: Partial<ICourse>): Promise<LeanCourse> {
    const course = await Course.findById(id);
    if (!course) {
      throw ApiError.notFound("Курс не найден");
    }

    if (!data) {
      throw ApiError.badRequest("Нет данных для обновления");
    }

    const updateData: Partial<ICourse> = { ...data };
    
    if (data.tags) {
      updateData.tags = data.tags.map((tagId) => {
        if (typeof tagId === "string") {
          return new mongoose.Types.ObjectId(tagId);
        }
        return tagId as mongoose.Types.ObjectId;
      });
    }

    if (data.title) {
      updateData.slug = slugify(data.title);
    }

    const updated = await Course.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
    }).lean();

    return updated as unknown as LeanCourse;
  },

  async delete(id: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const course = await Course.findById(id).session(session);
      if (!course) {
        throw ApiError.notFound("Курс не найден");
      }

      const sections = await Section.find({ course_id: course._id }).session(session);
      const sectionIds = sections.map((s) => s._id);

      await Lesson.deleteMany({ section_id: { $in: sectionIds } }).session(session);
      await Section.deleteMany({ course_id: course._id }).session(session);
      await Progress.deleteMany({ course_id: course._id }).session(session);
      await Enrollment.deleteMany({ course_id: course._id }).session(session);
      await Course.findByIdAndDelete(course._id).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async publish(id: string): Promise<LeanCourse> {
    const course = await Course.findById(id);
    if (!course) {
      throw ApiError.notFound("Курс не найден");
    }

    const updated = await Course.findByIdAndUpdate(
      id,
      { isPublished: true },
      { returnDocument: "after" },
    ).lean();

    return updated as unknown as LeanCourse;
  },
};
