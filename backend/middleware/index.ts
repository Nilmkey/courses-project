// middleware/index.ts
export {
  AppError,
  createError,
  errorHandler,
  asyncHandler,
} from './error.middleware';

export { notFoundHandler } from './notFound.middleware';

export {
  authMiddleware,
  optionalAuthMiddleware,
  type AuthenticatedUser,
} from './auth.middleware';

export { adminMiddleware } from './admin.middleware';
export { teacherMiddleware } from './teacher.middleware';
export { studentMiddleware } from './student.middleware';

export { validate, validateQuery, validateParams } from './validate.middleware';