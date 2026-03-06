import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:7777", // Твой адрес бэкенда
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
