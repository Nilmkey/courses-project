export const dynamic = 'force-dynamic';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход и регистрация — CodeLearn",
  description: "Войдите в аккаунт или зарегистрируйтесь бесплатно на платформе CodeLearn. Начните изучение программирования уже сегодня.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
