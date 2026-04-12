export const dynamic = 'force-dynamic';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Обучение — CodeLearn",
  description: "Интерактивный режим обучения. Изучайте материал курса, выполняйте задания и отслеживайте свой прогресс.",
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
