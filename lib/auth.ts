import { auth } from "@/backend/auth";

/**
 * Получение текущей сессии пользователя на сервере
 * Используется в Server Components для проверки авторизации
 */
export async function getSession() {
  try {
    // Получаем заголовки из текущего запроса
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const cookie = headersList.get("cookie");

    if (!cookie) {
      return null;
    }

    // Получаем сессию через Better Auth API
    const session = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });

    return session;
  } catch (error) {
    console.error("Ошибка получения сессии:", error);
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
