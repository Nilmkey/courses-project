import { PageSkeleton } from "@/components/ui/page-skeleton";

/**
 * Глобальный loading для всех страниц.
 * Показывается при навигации между любыми route segments.
 */
export default function Loading() {
  return <PageSkeleton type="default" />;
}
