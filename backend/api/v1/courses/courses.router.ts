import { Router } from "express";
import { coursesController } from "./courses.controller";
import { validateRequest } from "./courses.middleware";
import {
  createCourseSchema,
  updateCourseSchema,
  getCourseBySlugSchema,
  getCourseByIdSchema,
  deleteCourseSchema,
  publishCourseSchema,
} from "./courses.validation";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { teacherMiddleware } from "../../../middleware/teacher.middleware";
import { adminMiddleware } from "../../../middleware/admin.middleware";

const router = Router();

router.get("/", coursesController.getAll.bind(coursesController));

router.get(
  "/:slug",
  validateRequest(getCourseBySlugSchema),
  coursesController.getBySlug.bind(coursesController),
);

router.get(
  "/id/:id",
  validateRequest(getCourseByIdSchema),
  coursesController.getById.bind(coursesController),
);

router.post(
  "/",
  authMiddleware,
  teacherMiddleware,
  validateRequest(createCourseSchema),
  coursesController.create.bind(coursesController),
);

router.patch(
  "/:id",
  authMiddleware,
  teacherMiddleware,
  validateRequest(updateCourseSchema),
  coursesController.update.bind(coursesController),
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateRequest(deleteCourseSchema),
  coursesController.delete.bind(coursesController),
);

router.post(
  "/:id/publish",
  authMiddleware,
  teacherMiddleware,
  validateRequest(publishCourseSchema),
  coursesController.publish.bind(coursesController),
);

export default router;
