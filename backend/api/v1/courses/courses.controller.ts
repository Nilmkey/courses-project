// api/v1/courses/courses.controller.ts
import type { Request, Response } from "express";
import { coursesService } from "../../../services/courses.service";
import type {
  CreateCourseRequest,
  UpdateCourseRequest,
  GetCourseBySlugRequest,
  DeleteCourseRequest,
  PublishCourseRequest,
  CourseResponse,
  CourseWithSectionsResponse,
  CoursesListResponse,
  LessonItem,
  SectionWithLessons,
} from "./courses.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import type { Types } from "mongoose";

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

const toCourseResponse = (course: unknown): CourseResponse => {
  const c = course as Record<string, unknown>;
  
  return {
    _id: (c._id as Types.ObjectId)?.toString() ?? "",
    title: String(c.title ?? ""),
    slug: String(c.slug ?? ""),
    price: Number(c.price ?? 0),
    isPublished: Boolean(c.isPublished ?? false),
    description: c.description as string | undefined,
    thumbnail: c.thumbnail as string | undefined,
    author_id: (c.author_id as Types.ObjectId)?.toString() ?? "",
    level: (c.level as "beginner" | "intermediate" | "advanced") ?? "beginner",
    createdAt: (c.createdAt as Date)?.toISOString() ?? new Date().toISOString(),
    updatedAt: (c.updatedAt as Date)?.toISOString() ?? new Date().toISOString(),
  };
};

const toLessonItem = (lesson: unknown): LessonItem => {
  const l = lesson as Record<string, unknown>;
  return {
    _id: (l._id as Types.ObjectId)?.toString() ?? "",
    section_id: (l.section_id as Types.ObjectId)?.toString() ?? "",
    title: String(l.title ?? ""),
    slug: String(l.slug ?? ""),
    is_free: Boolean(l.is_free ?? false),
    order_index: Number(l.order_index ?? 0),
    content_blocks: (l.content_blocks as LessonItem["content_blocks"]) ?? [],
    createdAt: (l.createdAt as Date)?.toISOString() ?? new Date().toISOString(),
    updatedAt: (l.updatedAt as Date)?.toISOString() ?? new Date().toISOString(),
  };
};

const toSectionWithLessons = (section: unknown): SectionWithLessons => {
  const s = section as Record<string, unknown>;
  const lessons = Array.isArray(s.lessons) ? s.lessons : [];
  return {
    _id: (s._id as Types.ObjectId)?.toString() ?? "",
    course_id: (s.course_id as Types.ObjectId)?.toString() ?? "",
    title: String(s.title ?? ""),
    order_index: Number(s.order_index ?? 0),
    isDraft: Boolean(s.isDraft ?? false),
    createdAt: (s.createdAt as Date)?.toISOString() ?? new Date().toISOString(),
    updatedAt: (s.updatedAt as Date)?.toISOString() ?? new Date().toISOString(),
    lessons: lessons.map(toLessonItem),
  };
};

export const coursesController = {
  async getAll(
    _req: Request,
    res: Response<CoursesListResponse>,
  ): Promise<void> {
    try {
      const courses = await coursesService.getAll();
      console.log('📦 Получены курсы из БД:', courses.length);
      
      const mappedCourses = courses.map((c) => {
        console.log('📄 Курс:', { 
          _id: c._id, 
          title: c.title,
          author_id: c.author_id,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt 
        });
        return toCourseResponse(c as unknown as CourseData);
      });
      
      res.json({
        courses: mappedCourses,
      });
    } catch (error) {
      console.error('❌ Ошибка в getAll:', error);
      throw error;
    }
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

  async create(req: AuthRequest, res: Response<CourseResponse>): Promise<void> {
    const courseData = req.body as CreateCourseRequest["body"];

    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "teacher")
    ) {
      throw ApiError.forbidden("Создавать курсы могут только преподаватели");
    }

    const course = await coursesService.create({
      ...courseData,
      author_id: req.user.id,
    });

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
      throw ApiError.forbidden(
        "Редактировать курсы могут только преподаватели",
      );
    }

    const course = await coursesService.update(id, updateData);
    res.json(toCourseResponse(course as unknown as CourseData));
  },

  async delete(
    req: Request<DeleteCourseRequest["params"]>,
    res: Response<void>,
  ): Promise<void> {
    const { id } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== "admin") {
      throw ApiError.forbidden("Удалять курсы могут только администраторы");
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
      throw ApiError.forbidden("Публиковать курсы могут только преподаватели");
    }

    const course = await coursesService.publish(id);
    res.json(toCourseResponse(course as unknown as CourseData));
  },
};
