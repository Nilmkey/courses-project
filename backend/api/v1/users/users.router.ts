// api/v1/users/users.router.ts
import { Router } from "express";
import { usersController } from "./users.controller";
import { validateRequest } from "./users.middleware";
import { 
  updateMyProfileSchema, 
  getUserByIdSchema,
  getUsersListSchema,
  updateUserRoleSchema,
  getUserEnrollmentsSchema,
  deleteUserEnrollmentSchema,
  resetUserProgressSchema,
} from "./users.validation";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { adminMiddleware } from "../../../middleware/admin.middleware";
import { upload } from "../../../middleware/upload.middleware";

const router = Router();

// Публичные маршруты (требуют авторизации)
router.get(
  "/me",
  authMiddleware,
  usersController.getMyProfile.bind(usersController),
);

router.patch(
  "/me",
  authMiddleware,
  validateRequest(updateMyProfileSchema),
  usersController.updateMyProfile.bind(usersController),
);

router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  usersController.uploadAvatar.bind(usersController),
);

router.delete(
  "/avatar",
  authMiddleware,
  usersController.deleteAvatar.bind(usersController),
);

router.get(
  "/:id",
  authMiddleware,
  validateRequest(getUserByIdSchema),
  usersController.getUserById.bind(usersController),
);

// Админские маршруты (требуют роль admin)
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validateRequest(getUsersListSchema),
  usersController.getAllUsers.bind(usersController),
);

router.patch(
  "/:id/role",
  authMiddleware,
  adminMiddleware,
  validateRequest(updateUserRoleSchema),
  usersController.updateUserRole.bind(usersController),
);

router.get(
  "/:id/enrollments",
  authMiddleware,
  adminMiddleware,
  validateRequest(getUserEnrollmentsSchema),
  usersController.getUserEnrollments.bind(usersController),
);

router.delete(
  "/:id/enrollments/:courseId",
  authMiddleware,
  adminMiddleware,
  validateRequest(deleteUserEnrollmentSchema),
  usersController.deleteUserEnrollment.bind(usersController),
);

router.post(
  "/:id/progress/:courseId/reset",
  authMiddleware,
  adminMiddleware,
  validateRequest(resetUserProgressSchema),
  usersController.resetUserProgress.bind(usersController),
);

export default router;
