import { Router } from "express";
import CourseController from "../controllers/CourseController";
import { adminOnly } from "@/app/middleware/adminMiddleware";

const router = Router();

// Публичные (видят все)
router.get("/", CourseController.getAll);
router.get("/:slug", CourseController.getBySlug);

// Защищенные (только для админа)
router.post("/", adminOnly, CourseController.create);
router.put("/:id", adminOnly, CourseController.update);
router.delete("/:id", adminOnly, CourseController.delete);

export default router;
