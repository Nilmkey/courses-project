// api/v1/index.ts
import { Router } from "express";
import coursesRouter from "./courses/courses.router";
import sectionsRouter from "./sections/sections.router";
import lessonsRouter from "./lessons/lessons.router";
import enrollmentRouter from "./enrollment/enrollment.router";
import progressRouter from "./progress/progress.router";
import usersRouter from "./users/users.router";

const router = Router();

router.use("/courses", coursesRouter);
router.use("/sections", sectionsRouter);
router.use("/lessons", lessonsRouter);
router.use("/enrollment", enrollmentRouter);
router.use("/progress", progressRouter);
router.use("/users", usersRouter);

export default router;
