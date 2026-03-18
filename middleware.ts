import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Проверка админки
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

  // Проверка доступа к страницам обучения /learn/[courseSlug]
  const learnMatch = request.nextUrl.pathname.match(/^\/learn\/([^/]+)$/);
  if (learnMatch) {
    const courseSlug = learnMatch[1];
    console.log("--- Проверка доступа к обучению ---", { courseSlug });

    try {
      // Получаем сессию пользователя
      const sessionResponse = await fetch(
        "http://localhost:7777/api/auth/get-session",
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        },
      );

      if (!sessionResponse.ok) {
        console.log("Пользователь не авторизован, редирект на логин");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      const session = await sessionResponse.json();
      
      if (!session?.user) {
        console.log("Сессия не найдена, редирект на логин");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Админ имеет доступ ко всем курсам
      if (session.user.role === "admin") {
        console.log("Админ имеет доступ к курсу");
        return NextResponse.next();
      }

      // Проверяем, записан ли пользователь на курс
      const courseResponse = await fetch(
        `http://localhost:7777/api/v1/courses/${courseSlug}`,
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        },
      );

      if (!courseResponse.ok) {
        console.log("Курс не найден");
        return NextResponse.redirect(new URL("/courses", request.url));
      }

      const course = await courseResponse.json();
      
      // Проверяем enrollment
      const enrollmentResponse = await fetch(
        `http://localhost:7777/api/v1/enrollment/${course._id}/check`,
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        },
      );

      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        if (enrollmentData.isEnrolled) {
          console.log("Пользователь записан на курс, доступ разрешен");
          return NextResponse.next();
        }
      }

      // Пользователь не записан на курс - редирект на страницу курса
      console.log("Пользователь не записан на курс, редирект на страницу курса");
      return NextResponse.redirect(new URL(`/courses/${courseSlug}`, request.url));
    } catch (error) {
      console.error("Ошибка в middleware обучения:", error);
      return NextResponse.redirect(new URL("/courses", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/learn/:path*",
  ],
};
