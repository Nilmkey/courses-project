import { getSession } from "@/lib/auth";
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

  // 1. Проверка сессии
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // 2. Загрузка курса по slug
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

  // 3. Проверка покупки курса (закомментировано пока не реализовано)
  // let enrollment;
  // try {
  //   enrollment = await enrollmentApi.isEnrolled(course._id);
  // } catch (error) {
  //   console.error("Ошибка проверки enrollment:", error);
  //   redirect("/courses");
  // }

  // if (!enrollment.isEnrolled) {
  //   redirect(`/courses/${course.slug}?access=denied`);
  // }

  // 4. Загрузка прогресса пользователя (закомментировано пока не реализовано)
  // let progress;
  // try {
  //   progress = await progressApi.getCourseProgress(course._id);
  // } catch (error) {
  //   console.error("Ошибка загрузки прогресса:", error);
  //   progress = {
  //     totalLessons: 0,
  //     completedLessons: 0,
  //     progress: 0,
  //   };
  // }

  // Временные данные пока API не реализовано
  const totalLessons = course.sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );

  const progress = {
    totalLessons,
    completedLessons: 0,
    progress: 0,
  };

  // 5. Рендеринг
  return (
    <LearningModeClient
      course={course}
      sections={course.sections}
      initialProgress={progress}
    />
  );
}
