import { API_BASE_URL } from "@/config/config";
type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown; // принимаем любой объект
};
type ErrorObserverFn = (error: ApiError) => void | Promise<void>;
const errorObservers: ErrorObserverFn[] = [];

export function addErrorObserver(fn: ErrorObserverFn) {
  errorObservers.push(fn);
}

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};
function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  return fetch(url, { ...options, signal })
    .then((response) => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new ApiError(
          `Request timeout: сервер не ответил за ${timeoutMs / 1000} секунд`,
          408,
        );
      }
      throw error;
    });
}
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  withCredentials: boolean = false,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Для FormData убираем Content-Type — браузер поставит multipart/form-data с boundary
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = isFormData
    ? { ...(options.headers || {}) }
    : {
        ...DEFAULT_HEADERS,
        ...(options.headers || {}),
      };

  const fetchOptions: RequestInit = {
    ...options,
    credentials: withCredentials ? "include" : "same-origin",
    headers,
    body: isFormData
      ? options.body
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  };
  try {
    const response = await fetchWithTimeout(url, fetchOptions);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: (await response.text()) || response.statusText };
      }
      throw new ApiError(
        errorData.message || ` HTTP error: ${response.status}`,
        response.status,
        errorData,
      );
    }
    if (response.status === 204) {
      return undefined as T;
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : error instanceof TypeError && error.message.includes("fetch")
          ? new ApiError("Не удалось подключиться к серверу.", 0)
          : new ApiError(
              error instanceof Error ? error.message : "Неизвестная ошибка",
              0,
              error,
            );

    for (const observer of errorObservers) {
      await observer(apiError);
    }

    throw apiError;
  }
}
export const api = {
  get: <T>(
    endpoint: string,
    options?: RequestInit,
    withCredentials?: boolean,
  ) => apiRequest<T>(endpoint, { ...options, method: "GET" }, withCredentials),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
    withCredentials?: boolean,
  ) =>
    apiRequest<T>(
      endpoint,
      { ...options, method: "POST", body },
      withCredentials,
    ),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
    withCredentials?: boolean,
  ) =>
    apiRequest<T>(
      endpoint,
      { ...options, method: "PUT", body },
      withCredentials,
    ),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
    withCredentials?: boolean,
  ) =>
    apiRequest<T>(
      endpoint,
      { ...options, method: "PATCH", body },
      withCredentials,
    ),

  delete: <T>(
    endpoint: string,
    options?: RequestInit,
    withCredentials?: boolean,
  ) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }, withCredentials),
};
