import { auth } from "@/backend/auth";
import { cookies, headers } from "next/headers";

/**
 * Получение текущей сессии пользователя на сервере
 * Используется в Server Components для проверки авторизации
 */
export async function getSession() {
  try {
    // Получаем заголовки из текущего запроса
    const headersList = await headers();
    const cookie = headersList.get("cookie");

    if (!cookie) {
      console.log("❌ getSession: cookie не найдены");
      return null;
    }

    // Получаем сессию через Better Auth API
    const session = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });

    if (!session) {
      console.log("❌ getSession: сессия не валидна");
      return null;
    }

    console.log("✅ getSession: сессия найдена", session.user.email);
    return session;
  } catch (error) {
    console.error("❌ getSession: ошибка", error);
    return null;
  }
}

/**
 * Получение текущего пользователя из сессии
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Получить cookie авторизации для передачи в API запросы
 */
export async function getAuthHeaders() {
  const cookieStore = await cookies();
  const allCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    cookie: allCookies,
  };
}

/**
 * Выполнить API запрос с cookie сессии
 */
export async function apiRequestWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  method: string = "GET",
  body?: unknown
): Promise<T> {
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  console.log("🍪 apiRequestWithAuth cookie:", cookie ? "есть" : "нет");

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777/api"}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    credentials: "include",
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    
    console.error(`❌ apiRequestWithAuth: HTTP ${response.status}`, errorData);
    
    // Если 401 - значит сессия не валидна
    if (response.status === 401) {
      throw new Error("Неавторизованный доступ");
    }
    
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  console.log("✅ apiRequestWithAuth: успех");

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
