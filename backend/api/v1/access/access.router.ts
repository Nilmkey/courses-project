// api/v1/access/access.router.ts
import { Router } from 'express';
import { accessController } from './access.controller';
import { validateRequest } from '../enrollment/enrollment.middleware';
import { checkLearnAccessSchema } from './access.validation';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/access/check-learn?slug=<course-slug>
 *
 * Проверяет доступ пользователя к курсу.
 * Требует авторизации. Возвращает { hasAccess, course, user }.
 */
router.get(
  '/check-learn',
  authMiddleware,
  validateRequest(checkLearnAccessSchema),
  accessController.checkLearnAccess.bind(accessController),
);

export default router;
