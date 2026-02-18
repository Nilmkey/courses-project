import { Request, Response } from "express";
// Убрали Block из импортов, так как это теперь вложенная схема
import { Course, Section, Lesson } from "../schemes/Courses";
import { CourseCreateSchema } from "../validation/CoursesScheme";
import { ZodError } from "zod";

class CourseController {
  // [READ] Список всех курсов (кратко)
  static async getAll(req: Request, res: Response) {
    try {
      const courses = await Course.find();
      return res.status(200).json(courses);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Ошибка при получении списка", error: e });
    }
  }

  // [READ] Один курс по Slug (полная сборка дерева для ученика)
  static async getBySlug(req: Request, res: Response) {
    try {
      const course = await Course.findOne({ slug: req.params.slug }).lean();
      if (!course) return res.status(404).json({ message: "Курс не найден" });

      // 1. Ищем все секции этого курса
      const sections = await Section.find({ course_id: course._id })
        .sort({ order_index: 1 })
        .lean();
      const sectionIds = sections.map((s) => s._id);

      // 2. Ищем все уроки этих секций.
      // БЛОКИ УЖЕ ВНУТРИ УРОКОВ! Нам больше не нужно искать их отдельно.
      const lessons = await Lesson.find({ section_id: { $in: sectionIds } })
        .sort({ order_index: 1 })
        .lean();

      // 3. Сборка дерева обратно в удобный JSON-формат для фронтенда
      const sectionsWithLessons = sections.map((section) => ({
        ...section,
        lessons: lessons.filter(
          (l) => String(l.section_id) === String(section._id),
        ),
      }));

      return res.status(200).json({
        ...course,
        sections: sectionsWithLessons,
      });
    } catch (e) {
      return res.status(500).json({ message: "Ошибка сервера", error: e });
    }
  }

  // [CREATE] Создать курс (Ожидается древовидный JSON)
  static async create(req: Request, res: Response) {
    try {
      const data = CourseCreateSchema.parse(req.body);

      // 1. Создаем верхнеуровневый курс
      const course = await Course.create({
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        author_id: data.author_id,
        level: data.level,
      });

      // 2. Итерируемся по массиву вложенных данных
      if (data.sections && Array.isArray(data.sections)) {
        for (const [sIndex, sectionData] of data.sections.entries()) {
          const section = await Section.create({
            course_id: course._id,
            title: sectionData.title,
            order_index: sectionData.order_index ?? sIndex, // Используем ?? вместо || для защиты от 0
          });

          if (sectionData.lessons && Array.isArray(sectionData.lessons)) {
            for (const [lIndex, lessonData] of sectionData.lessons.entries()) {
              // ЗАЩИТА ОТ ОШИБКИ ВАЛИДАЦИИ:
              // Пробегаемся по блокам и железобетонно присваиваем им order_index
              const blocksToSave =
                lessonData.content_blocks?.map((block, bIndex) => ({
                  ...block,
                  order_index: block.order_index ?? bIndex,
                })) || [];

              // Создаем урок сразу со всеми блоками внутри
              await Lesson.create({
                section_id: section._id,
                title: lessonData.title,
                slug: lessonData.slug,
                is_free: lessonData.is_free,
                order_index: lessonData.order_index ?? lIndex,
                content_blocks: blocksToSave,
              });
            }
          }
        }
      }

      return res
        .status(201)
        .json({ message: "Курс успешно создан", courseId: course._id });
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({ errors: e.flatten().fieldErrors });
      }
      return res
        .status(500)
        .json({ message: "Ошибка при создании курса", error: e });
    }
  }

  // [UPDATE] Изменить информацию самого курса (Без внутренностей)
  static async update(req: Request, res: Response) {
    try {
      const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) return res.status(404).json({ message: "Курс не найден" });
      return res.status(200).json(updated);
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Ошибка при обновлении", error: e });
    }
  }

  // [DELETE] Каскадное удаление
  static async delete(req: Request, res: Response) {
    try {
      const courseId = req.params.id;

      // Получаем ID всех связанных секций
      const sections = await Section.find({ course_id: courseId });
      const sectionIds = sections.map((s) => s._id);

      // Блоки удалять не нужно, они физически исчезнут вместе с уроками
      await Lesson.deleteMany({ section_id: { $in: sectionIds } });
      await Section.deleteMany({ course_id: courseId });

      const deletedCourse = await Course.findByIdAndDelete(courseId);

      if (!deletedCourse)
        return res.status(404).json({ message: "Курс не найден" });

      return res
        .status(200)
        .json({ message: "Курс и все его материалы успешно удалены" });
    } catch (e) {
      return res.status(500).json({ message: "Ошибка при удалении", error: e });
    }
  }
}

export default CourseController;
