import toast from 'react-hot-toast';

export const useToast = () => {
  const success = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      duration: 3000,
      position: 'top-right',
    });
  };

  const loading = (message: string) => {
    return toast.loading(message);
  };

  const dismiss = (id?: string) => {
    toast.dismiss(id);
  };

  const promise = <T,>(
    asyncFn: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(asyncFn, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  return { success, error, loading, dismiss, promise };
};