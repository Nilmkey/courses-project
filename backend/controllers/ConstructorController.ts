import type { Request, Response } from "express";
import { Course } from "../schemes/Courses";

class CourseController {
  static async getCourseMetadata(req: Request, res: Response) {
    if (!req.body.courseId)
      return res.status(400).json({ error: "bad request" });
    const courseMetadata = Course.findById(req.body.course_id);
    return res.status(200).json(courseMetadata);
  }
}

export default CourseController;
