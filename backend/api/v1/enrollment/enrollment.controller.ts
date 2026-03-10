// api/v1/enrollment/enrollment.controller.ts
import type { Request, Response } from "express";
import { enrollmentService } from "../../../services/enrollment.service";
import type {
  EnrollRequest,
  UnenrollRequest,
  CheckEnrollmentRequest,
  UpdateEnrollmentStatusRequest,
  EnrollmentResponse,
  EnrollmentsListResponse,
  IsEnrolledResponse,
  EnrollResponse,
  EnrollmentData,
} from "./enrollment.types";
import { ApiError } from "../../../utils/ApiError";
import type { AuthenticatedUser } from "../../../middleware/auth.middleware";

type AuthRequest = Request & { user?: AuthenticatedUser };

const toEnrollmentResponse = (
  enrollment: EnrollmentData,
): EnrollmentResponse => ({
  _id: enrollment._id.toString(),
  user_id: enrollment.user_id.toString(),
  course_id: enrollment.course_id.toString(),
  enrolledAt: enrollment.enrolledAt.toISOString(),
  completedAt: enrollment.completedAt?.toISOString(),
  status: enrollment.status,
  createdAt: enrollment.createdAt.toISOString(),
  updatedAt: enrollment.updatedAt.toISOString(),
  course: enrollment.course
    ? {
        _id: enrollment.course._id.toString(),
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        thumbnail: enrollment.course.thumbnail,
        level: enrollment.course.level,
      }
    : undefined,
});

export const enrollmentController = {
  async enroll(
    req: Request<unknown, unknown, EnrollRequest["body"]>,
    res: Response<EnrollResponse>,
  ): Promise<void> {
    const { courseId } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const enrollment = await enrollmentService.enroll(
      authReq.user.id,
      courseId,
    );

    res.status(201).json({
      success: true,
      message: "Вы успешно записаны на курс",
      enrollment: toEnrollmentResponse(enrollment as unknown as EnrollmentData),
    });
  },

  async unenroll(
    req: Request<UnenrollRequest["params"]>,
    res: Response<void>,
  ): Promise<void> {
    const { courseId } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    await enrollmentService.unenroll(authReq.user.id, courseId);
    res.status(204).send();
  },

  async getMyCourses(
    req: Request,
    res: Response<EnrollmentsListResponse>,
  ): Promise<void> {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const enrollments = await enrollmentService.getMyCourses(authReq.user.id);
    res.json({
      enrollments: enrollments.map((e) =>
        toEnrollmentResponse(e as unknown as EnrollmentData),
      ),
    });
  },

  async isEnrolled(
    req: Request<CheckEnrollmentRequest["params"]>,
    res: Response<IsEnrolledResponse>,
  ): Promise<void> {
    const { courseId } = req.params;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const isEnrolled = await enrollmentService.isEnrolled(
      authReq.user.id,
      courseId,
    );
    res.json({ isEnrolled });
  },

  async updateStatus(
    req: Request<
      UpdateEnrollmentStatusRequest["params"],
      unknown,
      UpdateEnrollmentStatusRequest["body"]
    >,
    res: Response<EnrollmentResponse>,
  ): Promise<void> {
    const { courseId } = req.params;
    const { status } = req.body;

    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw ApiError.unauthorized("Требуется авторизация");
    }

    const enrollment = await enrollmentService.updateStatus(
      authReq.user.id,
      courseId,
      status,
    );

    if (!enrollment) {
      throw ApiError.notFound("Запись на курс не найдена");
    }

    res.json(toEnrollmentResponse(enrollment as unknown as EnrollmentData));
  },
};
