import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeLearn — Интерактивная платформа для обучения IT",
  description: "Изучайте программирование с нуля до профессионального уровня. Практические курсы по HTML, CSS, JavaScript, Python, C++ и C#. Учитесь в своём темпе с сертификатом по окончании.",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
