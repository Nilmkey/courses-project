export const dynamic = 'force-dynamic';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Редактор урока — CodeLearn",
  description: "Создание и редактирование учебного урока: добавление материалов, задач и медиа-контента.",
};

export default function LessonEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
