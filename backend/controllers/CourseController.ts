import { Request, Response } from "express";
import { Course } from "../schemes/Courses";
import { CourseCreateSchema } from "../validation/CoursesScheme";
import { ZodError } from "zod";

class CourseController {
  // [READ] Список всех курсов (кратко)
  static async getAll(req: Request, res: Response) {
    try {
      const courses = await Course.find().select("-sections");
      return res.status(200).json(courses);
    } catch (e) {
      return res.status(500).json({ message: "Ошибка при получении списка" });
    }
  }

  // [READ] Один курс по Slug (полный контент для ученика)
  static async getBySlug(req: Request, res: Response) {
    try {
      const course = await Course.findOne({ slug: req.params.slug });
      if (!course) return res.status(404).json({ message: "Курс не найден" });
      return res.status(200).json(course);
    } catch (e) {
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  // [CREATE] Создать курс
  static async create(req: Request, res: Response) {
    try {
      const validatedData = CourseCreateSchema.parse(req.body);
      const newCourse = await Course.create(validatedData);
      return res.status(201).json(newCourse);
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({ errors: e.flatten().fieldErrors });
      }
      return res.status(500).json({ message: "Ошибка при создании курса" });
    }
  }

  // [UPDATE] Изменить курс по ID
  static async update(req: Request, res: Response) {
    try {
      // { new: true } вернет уже обновленный объект
      const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) return res.status(404).json({ message: "Курс не найден" });
      return res.status(200).json(updated);
    } catch (e) {
      return res.status(400).json({ message: "Ошибка при обновлении" });
    }
  }

  // [DELETE] Удалить курс по ID
  static async delete(req: Request, res: Response) {
    try {
      const deleted = await Course.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Курс не найден" });
      return res.status(200).json({ message: "Курс успешно удален" });
    } catch (e) {
      return res.status(500).json({ message: "Ошибка при удалении" });
    }
  }
}

export default CourseController;
