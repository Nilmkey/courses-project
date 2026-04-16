import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:7777";
const IS_DEV = process.env.NODE_ENV === "development";

// Утилита для редиректа
const redirectTo = (
  request: NextRequest,
  path: string,
  withCallback = false,
) => {
  const url = new URL(path, request.url);
  if (withCallback) {
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  }
  return NextResponse.redirect(url);
};

const fetchWithTimeout = (url: string, init: RequestInit, timeout = 3000) => {
  const controller = new AbortController();
  const id = globalThis.setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. ГЕНЕРАЦИЯ NONCE И CSP (Для всех страниц) ---
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // В dev режиме Next.js вставляет inline-скрипты (HMR, hydration, error overlay)
  // 'strict-dynamic' конфликтует с 'unsafe-inline' в некоторых браузерах
  // Поэтому в dev используем просто 'unsafe-inline', в production — nonce + strict-dynamic
  const scriptSrc = IS_DEV
    ? `'self' 'unsafe-inline' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline';
    img-src 'self' https://res.cloudinary.com data: blob:;
    font-src 'self' data:;
    connect-src 'self' ${BACKEND_URL} https://res.cloudinary.com data:;
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.youtube.com https://player.vimeo.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  // --- 2. ПРОВЕРКА ДОСТУПА (Только для защищенных роутов) ---
  const isAdmin = pathname.startsWith("/admin");
  const isLearn = pathname.startsWith("/learn/");

  if (isAdmin || isLearn) {
    const cookie = request.headers.get("cookie");

    if (!cookie) {
      if (IS_DEV) {
        console.log("[proxy] ❌ Нет cookie, редирект на логин", { pathname });
      }
      return isAdmin
        ? redirectTo(request, "/")
        : redirectTo(request, "/login", true);
    }

    try {
      let courseSlug = "";
      if (isLearn) {
        const parts = pathname.split("/");
        courseSlug = parts[2] || "";

        if (!courseSlug || courseSlug.length < 3 || courseSlug.includes(".")) {
          if (IS_DEV) {
            console.log("[proxy] ❌ Неверный slug курса", { courseSlug, pathname });
          }
          return redirectTo(request, "/courses");
        }
      }

      const accessUrl = isAdmin
        ? `${BACKEND_URL}/api/auth/get-session`
        : `${BACKEND_URL}/api/v1/access/check-learn?slug=${encodeURIComponent(courseSlug)}`;

      if (IS_DEV) {
        console.log("[proxy] 🔍 Проверка доступа:", { accessUrl, hasCookie: !!cookie });
      }

      const response = await fetchWithTimeout(accessUrl, {
        headers: { cookie },
      });

      if (IS_DEV) {
        console.log("[proxy] 📡 Ответ бэкенда:", { 
          status: response.status, 
          ok: response.ok 
        });
      }

      if (!response.ok) {
        if (IS_DEV) {
          const body = await response.text();
          console.log("[proxy] ❌ Бэкенд отказал в доступе:", { 
            status: response.status, 
            body: body.slice(0, 200) 
          });
        }
        return isAdmin
          ? redirectTo(request, "/")
          : redirectTo(request, "/login", true);
      }

      const data = await response.json();
      const userRole = data?.user?.role;

      if (IS_DEV) {
        console.log("[proxy] ✅ Данные получены:", { 
          userRole, 
          hasAccess: data?.hasAccess,
          isAdmin: userRole === "admin"
        });
      }

      if (isAdmin && userRole !== "admin") {
        if (IS_DEV) console.log("[proxy] ❌ Не админ, редирект на главную");
        return redirectTo(request, "/");
      }

      if (isLearn && userRole !== "admin" && !data.hasAccess) {
        if (IS_DEV) console.log("[proxy] ❌ Нет доступа к курсу, редирект на страницу курса");
        return redirectTo(request, `/courses/${courseSlug}`);
      }
    } catch (error) {
      if (IS_DEV) {
        const isTimeout =
          error instanceof DOMException && error.name === "AbortError";
        console.error(
          isTimeout ? "❌ Таймаут бэкенда" : "❌ Middleware Error:",
          error,
        );
      }
      return redirectTo(request, "/");
    }
  }

  // --- 3. ОТВЕТ С CSP (Если доступ разрешен или роут публичный) ---
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Добавляем CSP в финальный ответ браузеру
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

// Изменяем matcher, чтобы CSP применялся ко ВСЕМ страницам, кроме статики и API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
