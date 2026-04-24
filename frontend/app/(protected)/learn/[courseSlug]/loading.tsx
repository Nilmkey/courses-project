import { PageSkeleton } from "@/components/ui/page-skeleton";

/**
 * Loading для режима обучения.
 * Показывает full-screen skeleton с сайдбаром.
 */
export default function LearnLoading() {
  return <PageSkeleton type="sidebar" />;
}
