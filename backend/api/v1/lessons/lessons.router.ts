// api/v1/lessons/lessons.router.ts
import { Router } from "express";
import { lessonsController } from "./lessons.controller";
import { validateRequest } from "./lessons.middleware";
import {
  createLessonSchema,
  updateLessonSchema,
  deleteLessonSchema,
  reorderLessonsSchema,
  getLessonsBySectionSchema,
  getLessonByIdSchema,
} from "./lessons.validation";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { teacherMiddleware } from "../../../middleware/teacher.middleware";

const router = Router();

/* 
ты - senior fullstack developer с 10+летним опытом работы. проанализируй
  @app/\(public\)/editor/course/\[courseId\]/sections/CourseEditorCore.tsx систему сохранения. и сделай
  систему сохранений в @app/\(public\)/editor/lesson/\[lessonId\]/editorCore.tsx . используй контекст
  @hooks/useConstructor.tsx, и учитывай типы в @types/types.ts .  эндпоинты найди в
  @backend/api/v1/lessons/, а фетч запросы найди или создай в @lib/api/ . для новый api запросов создай
  файл api-lessons.ts. в конце отчитайся о каждой сделанной строчке кода. ​
*/

router.get(
  "/section/:sectionId",
  authMiddleware,
  validateRequest(getLessonsBySectionSchema),
  lessonsController.getBySection.bind(lessonsController),
);

router.post(
  "/:sectionId",
  authMiddleware,
  teacherMiddleware,
  validateRequest(createLessonSchema),
  lessonsController.create.bind(lessonsController),
);

router.patch(
  "/:id",
  authMiddleware,
  teacherMiddleware,
  validateRequest(updateLessonSchema),
  lessonsController.update.bind(lessonsController),
);

router.delete(
  "/:id",
  authMiddleware,
  teacherMiddleware,
  validateRequest(deleteLessonSchema),
  lessonsController.delete.bind(lessonsController),
);

router.post(
  "/reorder/:sectionId",
  authMiddleware,
  teacherMiddleware,
  validateRequest(reorderLessonsSchema),
  lessonsController.reorder.bind(lessonsController),
);

router.get(
  "/:id",
  authMiddleware,
  validateRequest(getLessonByIdSchema),
  lessonsController.getById.bind(lessonsController),
);

export default router;
