// api/v1/enrollment/enrollment.router.ts
import { Router } from 'express';
import { enrollmentController } from './enrollment.controller';
import { validateRequest } from './enrollment.middleware';
import {
  enrollSchema,
  unenrollSchema,
  checkEnrollmentSchema,
  updateEnrollmentStatusSchema,
} from './enrollment.validation';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

router.get(
  '/my',
  authMiddleware,
  enrollmentController.getMyCourses.bind(enrollmentController)
);

router.post(
  '/',
  authMiddleware,
  validateRequest(enrollSchema),
  enrollmentController.enroll.bind(enrollmentController)
);

router.delete(
  '/:courseId',
  authMiddleware,
  validateRequest(unenrollSchema),
  enrollmentController.unenroll.bind(enrollmentController)
);

router.get(
  '/:courseId/check',
  authMiddleware,
  validateRequest(checkEnrollmentSchema),
  enrollmentController.isEnrolled.bind(enrollmentController)
);

router.patch(
  '/:courseId/status',
  authMiddleware,
  validateRequest(updateEnrollmentStatusSchema),
  enrollmentController.updateStatus.bind(enrollmentController)
);

export default router;