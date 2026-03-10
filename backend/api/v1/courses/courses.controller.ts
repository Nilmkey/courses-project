// api/v1/courses/courses.controller.ts
import type { Request, Response } from "express";
import { coursesService } from "../../../services/courses.service";
import type { ICourse } from "../../../models/Course";
import type {
  UpdateCourseRequest,
  GetCourseBySlugRequest,
  GetCourseByIdRequest,
  DeleteCourseRequest,
  PublishCourseRequest,
  CourseResponse,
  CourseWithSectionsResponse,
  CoursesListResponse,
  LessonItem,
  SectionWithLessons,
} from "./courses.types";
import { createError } from "../../../middleware/error.middleware";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import { Types } from "mongoose";

type AuthRequest = Request & { user?: AuthenticatedUser };

interface CourseData {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  price: number;
  isPublished: boolean;
  description?: string;
  thumbnail?: string;
  author_id: Types.ObjectId;
  level: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  updatedAt: Date;
  tags?: Types.ObjectId[];
}

interface SectionData {
  _id: Types.ObjectId;
  course_id: Types.ObjectId;
  title: string;
  order_index: number;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  lessons: LessonData[];
}

interface LessonData {
  _id: Types.ObjectId;
  section_id: Types.ObjectId;
  title: string;
  slug: string;
  is_free: boolean;
  order_index: number;
  content_blocks: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

const toCourseResponse = (course: CourseData): CourseResponse => ({
  _id: course._id.toString(),
  title: course.title,
  slug: course.slug,
  price: course.price,
  isPublished: course.isPublished,
  description: course.description,
  thumbnail: course.thumbnail,
  author_id: course.author_id?.toString() ?? "",
  level: course.level,
  createdAt: course.createdAt.toISOString(),
  updatedAt: course.updatedAt.toISOString(),
  tags: course.tags?.map((t) => t.toString()),
});

const toLessonItem = (lesson: LessonData): LessonItem => ({
  _id: lesson._id.toString(),
  section_id: lesson.section_id?.toString() ?? "",
  title: lesson.title,
  slug: lesson.slug,
  is_free: lesson.is_free,
  order_index: lesson.order_index,
  content_blocks: lesson.content_blocks as LessonItem["content_blocks"],
  createdAt: lesson.createdAt.toISOString(),
  updatedAt: lesson.updatedAt.toISOString(),
});

const toSectionWithLessons = (section: SectionData): SectionWithLessons => ({
  _id: section._id.toString(),
  course_id: section.course_id?.toString() ?? "",
  title: section.title,
  order_index: section.order_index,
  isDraft: section.isDraft,
  createdAt: section.createdAt.toISOString(),
  updatedAt: section.updatedAt.toISOString(),
  lessons: section.lessons.map(toLessonItem),
});

export const coursesController = {
  async getAll(
    _req: Request,
    res: Response<CoursesListResponse>,
  ): Promise<void> {
    const courses = await coursesService.getAll();
    res.json({
      courses: courses.map((c) => toCourseResponse(c as unknown as CourseData)),
    });
  },

  async getBySlug(
    req: Request<GetCourseBySlugRequest["params"]>,
    res: Response<CourseWithSectionsResponse>,
  ): Promise<void> {
    const { slug } = req.params;
    const course = await coursesService.getBySlug(slug);

    const response: CourseWithSectionsResponse = {
      ...toCourseResponse(course as unknown as CourseData),
      sections: course.sections.map((s) =>
        toSectionWithLessons(s as unknown as SectionData),
      ),
    };

    res.json(response);
  },

  async getById(
    req: Request<GetCourseByIdRequest["params"]>,
    res: Response<CourseWithSectionsResponse>,
  ): Promise<void> {
    const { id } = req.params;
    const course = await coursesService.getById(id);

    const response: CourseWithSectionsResponse = {
      ...toCourseResponse(course as unknown as CourseData),
      sections: course.sections.map((s) =>
        toSectionWithLessons(s as unknown as SectionData),
      ),
    };

    res.json(response);
  },

  async create(
    req: Request,
    res: Response<CourseResponse>,
  ): Promise<void> {
    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "teacher")
    ) {
      throw createError.forbidden("Создавать курсы могут только преподаватели");
    }

    const course = await coursesService.create(req.user.id);

    res.status(201).json(toCourseResponse(course as unknown as CourseData));
  },

  async update(
    req: Request<
      UpdateCourseRequest["params"],
      unknown,
      UpdateCourseRequest["body"]
    >,
    res: Response<CourseResponse>,
  ): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    const authReq = req as AuthRequest;
    if (
      !authReq.user ||
      (authReq.user.role !== "admin" && authReq.user.role !== "teacher")
    ) {
      throw createError.forbidden(
        "Редактировать курсы могут только преподаватели",
      );
    }

    // Преобразуем tags из string[] в ObjectId[] перед передачей в сервис
    const dataForService = { ...updateData };
    if (updateData.tags) {
      dataForService.tags = updateData.tags.map((tagId) => new Types.ObjectId(tagId)) as unknown as string[];
    }

    const course = await coursesService.update(id, dataForService as Partial<ICourse>);
    res.json(toCourseResponse(course as unknown as CourseData));
  },

  async delete(
    req: Request<DeleteCourseRequest["params"]>,
    res: Response<void>,
  ): Promise<void> {
    const { id } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== "admin") {
      throw createError.forbidden("Удалять курсы могут только администраторы");
    }

    await coursesService.delete(id);
    res.status(204).send();
  },

  async publish(
    req: Request<PublishCourseRequest["params"]>,
    res: Response<CourseResponse>,
  ): Promise<void> {
    const { id } = req.params;

    const authReq = req as AuthRequest;
    if (
      !authReq.user ||
      (authReq.user.role !== "admin" && authReq.user.role !== "teacher")
    ) {
      throw createError.forbidden("Публиковать курсы могут только преподаватели");
    }

    const course = await coursesService.publish(id);
    res.json(toCourseResponse(course as unknown as CourseData));
  },
};
