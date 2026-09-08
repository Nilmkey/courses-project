import { Loader2 } from "lucide-react";

/**
 * Глобальный loading для всех страниц.
 * Next.js автоматически показывает этот файл при навигации между страницами.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Загрузка...</p>
      </div>
    </div>
  );
}
