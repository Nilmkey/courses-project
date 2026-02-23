"use client";

import toast from "react-hot-toast";

export const useToast = () => {
  const baseClassName =
    "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg";

  const success = (message: string) => {
    toast.success(message, {
      className: baseClassName,
      duration: 2000,
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      className: baseClassName,
      duration: 2000,
    });
  };

  const loading = (message: string) => {
    return toast.loading(message, {
      className: baseClassName,
    });
  };

  const dismiss = (id?: string) => {
    toast.dismiss(id);
  };

  const confirm = (title: string, onConfirm: () => void) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-4 min-w-[280px] p-1">
          <div className="flex flex-col gap-1">
            <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">
              Подтверждение
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {title}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-xs font-bold uppercase text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }}
              className="px-4 py-2 text-xs font-bold uppercase bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-lg shadow-rose-500/20 transition-all active:scale-95"
            >
              Удалить
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        className: baseClassName,
      },
    );
  };

  const promise = <T,>(
    asyncFn: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) => {
    return toast.promise(
      asyncFn,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        className: baseClassName,
      },
    );
  };

  return { success, error, loading, dismiss, promise, confirm };
};
