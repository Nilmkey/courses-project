import { CourseEditorClient } from "./CourseEditorClient";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

/**
 * Страница редактора курса
 * Серверный компонент для начальной загрузки
 */
export default async function CourseEditorPage({ params }: PageProps) {
  const { courseId } = await params;

  // Валидация courseId
  if (!courseId || typeof courseId !== "string") {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Неверный ID курса
          </h1>
          <p className="text-slate-500 mt-2">
            Пожалуйста, проверьте URL и попробуйте снова
          </p>
        </div>
      </div>
    );
  }

  return <CourseEditorClient courseId={courseId} />;
}
