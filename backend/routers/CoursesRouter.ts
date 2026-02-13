import { Router } from "express";
import CourseController from "../controllers/CourseController";

const router = Router();

// Открытые эндпоинты
router.get("/", CourseController.getAll);
router.get("/:slug", CourseController.getBySlug);

// Админские (нужно будет защитить Middleware)
router.post("/", CourseController.create);
router.put("/:id", CourseController.update);
router.delete("/:id", CourseController.delete);

export default router;