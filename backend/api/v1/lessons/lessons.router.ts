// api/v1/lessons/lessons.router.ts
import { Router } from 'express';
import { lessonsController } from './lessons.controller';
import { validateRequest } from './lessons.middleware';
import {
  createLessonSchema,
  updateLessonSchema,
  deleteLessonSchema,
  reorderLessonsSchema,
  getLessonsBySectionSchema,
} from './lessons.validation';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { teacherMiddleware } from '../../../middleware/teacher.middleware';

const router = Router();

router.get(
  '/section/:sectionId',
  validateRequest(getLessonsBySectionSchema),
  lessonsController.getBySection.bind(lessonsController)
);

router.post(
  '/',
  authMiddleware,
  teacherMiddleware,
  validateRequest(createLessonSchema),
  lessonsController.create.bind(lessonsController)
);

router.patch(
  '/:id',
  authMiddleware,
  teacherMiddleware,
  validateRequest(updateLessonSchema),
  lessonsController.update.bind(lessonsController)
);

router.delete(
  '/:id',
  authMiddleware,
  teacherMiddleware,
  validateRequest(deleteLessonSchema),
  lessonsController.delete.bind(lessonsController)
);

router.post(
  '/reorder/:sectionId',
  authMiddleware,
  teacherMiddleware,
  validateRequest(reorderLessonsSchema),
  lessonsController.reorder.bind(lessonsController)
);

export default router;