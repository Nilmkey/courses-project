import { apiRequestWithAuth } from "@/lib/auth";
import { coursesApi } from "@/lib/api/entities/api-courses";
import { redirect } from "next/navigation";
import LearningModeClient from "./LearningModeClient";

interface LearnPageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { courseSlug } = await params;

  // Загрузка курса по slug
  let course;
  try {
    course = await coursesApi.getBySlug(courseSlug);
  } catch (error) {
    console.error("Ошибка загрузки курса:", error);
    redirect("/courses");
  }

  if (!course) {
    redirect("/courses");
  }

  // Загрузка прогресса пользователя с авторизацией
  let progress;
  try {
    progress = await apiRequestWithAuth<{
      totalLessons: number;
      completedLessons: number;
      progress: number;
    }>(
      `/v1/progress/course/${course._id}`,
      {},
      "GET"
    );
  } catch (error) {
    console.error("⚠️ Ошибка загрузки прогресса:", error);
    // Если прогресса нет, создаем начальный
    const totalLessons = course.sections.reduce(
      (acc, section) => acc + section.lessons.length,
      0
    );
    progress = {
      totalLessons,
      completedLessons: 0,
      progress: 0,
    };
  }

  // Рендеринг
  return (
    <LearningModeClient
      course={course}
      sections={course.sections}
      initialProgress={progress}
    />
  );
}
