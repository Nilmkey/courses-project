"use server";

import { api } from "@/lib/api/api-client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { CourseResponse } from "@/backend/api/v1/courses/courses.types";

export async function handleCreate() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token")?.value;

  console.log("🍪 Cookie из хедера:", sessionCookie ? `${sessionCookie.slice(0, 20)}...` : "нет куки");

  if (!sessionCookie) {
    console.log("❌ Нет сессии — редирект на логин");
    return redirect("/login");
  }

  const session = await api.get<{ user: { id: string; email: string; role: string } }>(
    "/auth/get-session",
    {
      headers: { cookie: `better-auth.session_token=${sessionCookie}` },
    },
    true,
  );

  console.log("📄 Сессия из API:", session?.user?.email, "Роль:", session?.user?.role);

  if (!session?.user) {
    console.log("❌ Нет пользователя в сессии — редирект на логин");
    return redirect("/login");
  }

  const course = await api.post<CourseResponse>(
    "/v1/courses",
    undefined,
    {
      headers: { cookie: `better-auth.session_token=${sessionCookie}` },
    },
    true,
  );

  console.log("✅ Курс создан:", course._id);

  return redirect(`/editor/course/${course._id}`);
}
