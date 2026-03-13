import { Router } from "express";
import {
  getAllTags,
  searchTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getCourseTags,
  assignTagsToCourse,
} from "./tags.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { teacherMiddleware } from "../../../middleware/teacher.middleware";
import { adminMiddleware } from "../../../middleware/admin.middleware";

const router = Router();

// ==================== Public Routes ====================

// Получить все теги
router.get("/", getAllTags);

// Поиск тегов по названию (для autocomplete)
router.get("/search", searchTags);

// ==================== Course Tags Routes (должны быть перед /:id) ====================

// Получить теги курса
router.get("/courses/:courseId/tags", getCourseTags);

// Присвоить теги курсу
router.post(
  "/courses/:courseId/tags",
  authMiddleware,
  teacherMiddleware,
  assignTagsToCourse,
);

// ==================== Protected Routes (Teacher/Admin) ====================

// Создать новый тег
router.post(
  "/",
  authMiddleware,
  teacherMiddleware,
  createTag,
);

// Обновить тег
router.patch(
  "/:id",
  authMiddleware,
  teacherMiddleware,
  updateTag,
);

// Удалить тег (только admin)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteTag,
);

// Получить тег по ID (должен быть в конце)
router.get("/:id", getTagById);

export default router;
