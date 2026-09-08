export const dynamic = 'force-dynamic';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Редактор курса — CodeLearn",
  description: "Создание и редактирование учебного курса: настройка программы, секций и материалов.",
};

export default function CourseEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
