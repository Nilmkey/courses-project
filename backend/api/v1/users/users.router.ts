// api/v1/users/users.router.ts
import { Router } from "express";
import { usersController } from "./users.controller";
import { validateRequest } from "./users.middleware";
import { updateMyProfileSchema, getUserByIdSchema } from "./users.validation";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { upload } from "../../../middleware/upload.middleware";

const router = Router();

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

export default router;
