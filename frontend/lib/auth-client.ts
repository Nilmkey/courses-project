import { createAuthClient } from "better-auth/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7777";

export const authClient = createAuthClient({
  baseURL: BACKEND_URL,
  fetchOptions: {
    credentials: "include", // Важно для отправки cookies на бэкенд
  },
  // Добавляем инфу о дополнительных полях для TypeScript
  plugins: [
    // Это скажет клиенту, что в объекте user есть роль и image
    {
      id: "user-role-type",
      schema: {
        user: {
          fields: {
            role: { type: "string" },
            image: { type: "string" },
          },
        },
      },
    },
  ],
});
