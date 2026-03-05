// api/v1/sections/sections.controller.ts
import type { Request, Response } from "express";
import { sectionsService } from "../../../services/sections.service";
import type {
  CreateSectionRequest,
  UpdateSectionRequest,
  DeleteSectionRequest,
  ReorderSectionsRequest,
  GetSectionsByCourseRequest,
  SectionResponse,
  SectionsListResponse,
  ReorderSectionsResponse,
} from "./sections.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";
import { Types } from "mongoose";
import type { ILesson } from "../../../models/Lesson";

type AuthRequest = Request & { user?: AuthenticatedUser };

interface SectionData {
  _id: Types.ObjectId;
  course_id: Types.ObjectId;
  title: string;
  order_index: number;
  isDraft: boolean;
  lessons: (Types.ObjectId | ILesson)[];
  createdAt: Date;
  updatedAt: Date;
}

const toSectionResponse = (section: SectionData): SectionResponse => ({
  _id: section._id.toString(),
  course_id: section.course_id.toString(),
  title: section.title,
  order_index: section.order_index,
  isDraft: section.isDraft,
  lessons: section.lessons.map((l) => 
    typeof l === 'string' ? l : l instanceof Types.ObjectId ? l.toString() : l._id.toString()
  ),
  createdAt: section.createdAt.toISOString(),
  updatedAt: section.updatedAt.toISOString(),
});

export const sectionsController = {
  async getByCourse(
    req: Request<GetSectionsByCourseRequest["params"]>,
    res: Response<SectionsListResponse>,
  ): Promise<void> {
    const { courseId } = req.params;
    const sections = await sectionsService.getByCourse(courseId);
    res.json({
      sections: sections.map((s) =>
        toSectionResponse(s as unknown as SectionData),
      ),
    });
  },

  async create(
    req: Request<
      CreateSectionRequest["params"],
      unknown,
      CreateSectionRequest["body"]
    >,
    res: Response<SectionResponse>,
  ): Promise<void> {
    const { courseId } = req.params;
    const sectionData = req.body;

    const authReq = req as AuthRequest;
    if (
      !authReq.user ||
      (authReq.user.role !== "admin" && authReq.user.role !== "teacher")
    ) {
      throw ApiError.forbidden("Создавать секции могут только преподаватели");
    }

    const section = await sectionsService.create({
      ...sectionData,
      course_id: courseId,
    });

    res.status(201).json(toSectionResponse(section as unknown as SectionData));
  },

  async update(
    req: Request<
      UpdateSectionRequest["params"],
      unknown,
      UpdateSectionRequest["body"]
    >,
    res: Response<SectionResponse>,
  ): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    const authReq = req as AuthRequest;
    if (
      !authReq.user ||
      (authReq.user.role !== "admin" && authReq.user.role !== "teacher")
    ) {
      throw ApiError.forbidden(
        "Редактировать секции могут только преподаватели",
      );
    }

    const section = await sectionsService.update(id, updateData);
    res.json(toSectionResponse(section as unknown as SectionData));
  },

  async delete(
    req: Request<DeleteSectionRequest["params"]>,
    res: Response<void>,
  ): Promise<void> {
    const { id } = req.params;

    const authReq = req as AuthRequest;
    if (
      !authReq.user ||
      (authReq.user.role !== "admin" && authReq.user.role !== "teacher")
    ) {
      throw ApiError.forbidden("Удалять секции могут только преподаватели");
    }

    await sectionsService.delete(id);
    res.status(204).send();
  },

  async reorder(
    req: Request<
      ReorderSectionsRequest["params"],
      unknown,
      ReorderSectionsRequest["body"]
    >,
    res: Response<ReorderSectionsResponse>,
  ): Promise<void> {
    const { courseId } = req.params;
    const { sectionIds } = req.body;

    const authReq = req as AuthRequest;
    if (
      !authReq.user ||
      (authReq.user.role !== "admin" && authReq.user.role !== "teacher")
    ) {
      throw ApiError.forbidden(
        "Изменять порядок секций могут только преподаватели",
      );
    }

    await sectionsService.reorder(courseId, sectionIds);
    res.json({ success: true, message: "Порядок секций обновлён" });
  },
};
