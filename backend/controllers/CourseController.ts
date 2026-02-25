import type { Request, Response } from "express";
import { Course, Section, Lesson } from "../schemes/Courses";
import { CourseCreateSchema } from "../validation/CoursesScheme";
import { asyncHandler, createError } from "../middleware/errorHandler";

class CourseController {
  // [READ] Список всех курсов (кратко)
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const courses = await Course.find();
    return res.status(200).json(courses);
  });

  // [READ] Один курс по Slug (полная сборка дерева для ученика)
  static getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const course = await Course.findOne({ slug: req.params.slug }).lean();
    if (!course) {
      throw createError.notFound("Курс не найден");
    }

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
  });

  // [CREATE] Создать курс (Ожидается древовидный JSON)
  static create = asyncHandler(async (req: Request, res: Response) => {
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
          order_index: sectionData.order_index ?? sIndex,
        });

        if (sectionData.lessons && Array.isArray(sectionData.lessons)) {
          for (const [lIndex, lessonData] of sectionData.lessons.entries()) {
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
  });

  // [UPDATE] Изменить информацию самого курса (Без внутренностей)
  static update = asyncHandler(async (req: Request, res: Response) => {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      throw createError.notFound("Курс не найден");
    }
    return res.status(200).json(updated);
  });

  // [DELETE] Каскадное удаление
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id;

    // Получаем ID всех связанных секций
    const sections = await Section.find({ course_id: courseId });
    const sectionIds = sections.map((s) => s._id);

    // Блоки удалять не нужно, они физически исчезнут вместе с уроками
    await Lesson.deleteMany({ section_id: { $in: sectionIds } });
    await Section.deleteMany({ course_id: courseId });

    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      throw createError.notFound("Курс не найден");
    }

    return res
      .status(200)
      .json({ message: "Курс и все его материалы успешно удалены" });
  });
}

export default CourseController;
