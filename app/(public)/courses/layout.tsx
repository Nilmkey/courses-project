export const dynamic = 'force-dynamic';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Каталог курсов — CodeLearn",
  description: "Выберите курс по программированию: HTML, CSS, JavaScript, Python, C++, C#. Фильтрация по уровням и технологиям. Начните обучение уже сегодня.",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
