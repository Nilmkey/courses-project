import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    console.log("--- Проверка админки ---");

    try {
      const response = await fetch(
        "http://localhost:7777/api/auth/get-session",
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        },
      );

      if (!response.ok) {
        console.log("Бэкенд ответил ошибкой:", response.status);
        return NextResponse.redirect(new URL("/", request.url));
      }

      const session = await response.json();
      console.log(
        "Сессия получена:",
        session?.user?.email,
        "Роль:",
        session?.user?.role,
      );

      if (!session || session.user?.role !== "admin") {
        console.log("Доступ запрещен: Не админ");
        return NextResponse.redirect(new URL("/", request.url));
      }

      console.log("Доступ разрешен!");
    } catch (error) {
      console.error("Ошибка в Middleware:", error);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}
