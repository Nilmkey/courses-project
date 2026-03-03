// services/courses.service.ts
import { Course, Section, Lesson } from "../models";
import { ApiError } from "../utils/ApiError";
import type { ICourse } from "../models";
import type { Types } from "mongoose";
import { slugify } from "../utils/slugify";

export interface CourseCreateInput {
  title: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  author_id: string | Types.ObjectId;
  level: "beginner" | "intermediate" | "advanced";
  price?: number;
  isPublished?: boolean;
  sections?: SectionCreateInput[];
}

export interface SectionCreateInput {
  title: string;
  order_index?: number;
  isDraft?: boolean;
  lessons?: LessonCreateInput[];
}

export interface LessonCreateInput {
  title: string;
  slug: string;
  order_index?: number;
  is_free?: boolean;
  content_blocks?: Array<{
    id: string;
    title: string;
    type: "text" | "video" | "quiz";
    content: Record<string, unknown>;
  }>;
}

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
      throw ApiError.notFound("Курс не найден");
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

  async getByCustomId(custom_id: string) {
    const course = await Course.findOne({ custom_id }).lean();
    if (!course) {
      throw ApiError.notFound("Курс не найден");
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

  async create(data: CourseCreateInput, custom_id: string): Promise<LeanCourse> {
    const course = await Course.create({
      custom_id,
      title: data.title,
      slug: slugify(data.title),
      description: data.description,
      thumbnail: data.thumbnail,
      level: data.level,
      author_id: data.author_id,
      price: data.price ?? 0,
      isPublished: data.isPublished ?? false,
    });

    if (data.sections?.length) {
      for (const [sIndex, sectionData] of data.sections.entries()) {
        const section = await Section.create({
          course_id: course._id,
          title: sectionData.title,
          order_index: sectionData.order_index ?? sIndex,
          isDraft: sectionData.isDraft ?? false,
        });

        if (sectionData.lessons?.length) {
          for (const [lIndex, lessonData] of sectionData.lessons.entries()) {
            await Lesson.create({
              section_id: section._id,
              title: lessonData.title,
              slug: lessonData.slug,
              order_index: lessonData.order_index ?? lIndex,
              is_free: lessonData.is_free ?? false,
              content_blocks: lessonData.content_blocks ?? [],
            });
          }
        }
      }
    }

    return course;
  },

  async update(custom_id: string, data: Partial<ICourse>): Promise<LeanCourse> {
    const course = await Course.findOne({ custom_id });
    if (!course) {
      throw ApiError.notFound("Курс не найден");
    }
    
    const updated = await Course.findByIdAndUpdate(
      course._id,
      data,
      { new: true },
    ).lean();
    
    return updated as LeanCourse;
  },

  async delete(custom_id: string): Promise<void> {
    const course = await Course.findOne({ custom_id });
    if (!course) {
      throw ApiError.notFound("Курс не найден");
    }
    
    const sections = await Section.find({ course_id: course._id });
    const sectionIds = sections.map((s) => s._id);

    await Lesson.deleteMany({ section_id: { $in: sectionIds } });
    await Section.deleteMany({ course_id: course._id });
    await Course.findByIdAndDelete(course._id);
  },

  async publish(custom_id: string): Promise<LeanCourse> {
    const course = await Course.findOne({ custom_id });
    if (!course) {
      throw ApiError.notFound("Курс не найден");
    }
    
    const updated = await Course.findByIdAndUpdate(
      course._id,
      { isPublished: true },
      { new: true },
    ).lean();
    
    return updated as LeanCourse;
  },
};
