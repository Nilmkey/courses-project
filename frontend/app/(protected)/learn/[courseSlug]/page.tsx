import LearningModeClient from "./LearningModeClient";

interface LearnPageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

/**
 * Страница обучения — полностью клиентский рендеринг
 * SSR отключён для ускорения загрузки страницы
 * Данные курса и прогресс загружаются через useCourseData хук
 */
export default async function LearnPage({ params }: LearnPageProps) {
  const { courseSlug } = await params;

  return <LearningModeClient courseSlug={courseSlug} />;
}
