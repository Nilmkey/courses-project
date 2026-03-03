"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useCreateCourse() {
  const router = useRouter();

  const handleCreate = async () => {
    try {
      // Получаем сессию через клиент
      const { data: session } = await authClient.getSession();

      console.log("📄 Сессия:", session);

      if (!session?.user) {
        console.log("❌ Нет сессии — редирект на логин");
        router.push("/login");
        return;
      }

      const courseId = crypto.randomUUID();
      console.log("✅ Создаём курс:", courseId);
      router.push(`/editor/course/${courseId}`);
    } catch (error) {
      console.error("❌ Ошибка:", error);
      router.push("/login");
    }
  };

  return { handleCreate };
}
