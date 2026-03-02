"use server";

import { api } from "@/lib/api/api-client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Session = typeof authClient.$Infer.Session;

export async function handleCreate() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token")?.value;

  if (!sessionCookie) {
    return redirect("/login");
  }

  const session = await api.get<Session>("/auth/get-session", {
    headers: { cookie: `better-auth.session_token=${sessionCookie}` },
  });

  if (!session?.user) {
    return redirect("/login");
  }

  const course_id = crypto.randomUUID();
  return redirect(`/editor/course/${course_id}`);
}
