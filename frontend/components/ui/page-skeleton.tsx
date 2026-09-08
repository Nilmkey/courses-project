import { Loader2 } from "lucide-react";

interface PageSkeletonProps {
  type?: "default" | "grid" | "list" | "form" | "sidebar";
  count?: number;
}

export function PageSkeleton({ type = "default", count = 3 }: PageSkeletonProps) {
  if (type === "grid") {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-6 animate-pulse"
            >
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="container mx-auto px-4 py-10 space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 animate-pulse flex items-center gap-4"
          >
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
        <div className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "sidebar") {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 animate-pulse">
        <aside className="hidden md:block w-80 border-r bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="p-4 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 border-b bg-white dark:bg-slate-900" />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </main>
      </div>
    );
  }

  // Default: centered spinner
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Загрузка...</p>
      </div>
    </div>
  );
}
