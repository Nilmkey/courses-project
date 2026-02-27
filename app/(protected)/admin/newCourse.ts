"use server";

import { api } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleCreate() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = await api.get("/api/auth/get-session", {
    headers: { cookie: `better-auth.session_token=${sessionCookie}` },
  });

  if (!session?.user) {
    redirect("/login");
  }
}
