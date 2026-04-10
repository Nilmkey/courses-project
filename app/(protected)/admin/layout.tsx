export const dynamic = 'force-dynamic';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Панель администратора — CodeLearn",
  description: "Управление курсами, пользователями и настройками платформы CodeLearn. Создание и редактирование учебных программ.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
