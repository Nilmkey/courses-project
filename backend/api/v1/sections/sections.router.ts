import { Router } from "express";
import { sectionsController } from "./sections.controller";
import { validateRequest } from "./sections.middleware";
import {
  createSectionSchema,
  updateSectionSchema,
  deleteSectionSchema,
  reorderSectionsSchema,
  getSectionsByCourseSchema,
} from "./sections.validation";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { teacherMiddleware } from "../../../middleware/teacher.middleware";

const router = Router();

router.get(
  "/course/:courseId",
  authMiddleware,
  validateRequest(getSectionsByCourseSchema),
  sectionsController.getByCourse.bind(sectionsController),
);

router.post(
  "/:courseId",
  authMiddleware,
  teacherMiddleware,
  validateRequest(createSectionSchema),
  sectionsController.create.bind(sectionsController),
);

router.patch(
  "/:id",
  authMiddleware,
  teacherMiddleware,
  validateRequest(updateSectionSchema),
  sectionsController.update.bind(sectionsController),
);

router.delete(
  "/:id",
  authMiddleware,
  teacherMiddleware,
  validateRequest(deleteSectionSchema),
  sectionsController.delete.bind(sectionsController),
);

router.post(
  "/reorder/:courseId",
  authMiddleware,
  teacherMiddleware,
  validateRequest(reorderSectionsSchema),
  sectionsController.reorder.bind(sectionsController),
);

export default router;
