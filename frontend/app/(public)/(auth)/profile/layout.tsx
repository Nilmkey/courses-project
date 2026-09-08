export const dynamic = 'force-dynamic';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Профиль пользователя — CodeLearn",
  description: "Ваш личный кабинет на платформе CodeLearn. Отслеживайте прогресс обучения, управляйте курсами и настройками профиля.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
