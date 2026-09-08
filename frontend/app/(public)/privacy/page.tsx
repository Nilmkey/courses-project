import type { Metadata } from "next";
import PrivacyClient from "./client";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — CodeLearn",
  description:
    "Узнайте, как CodeLearn собирает, обрабатывает и защищает ваши персональные данные. Мы серьёзно относимся к вашей конфиденциальности.",
  keywords: [
    "политика конфиденциальности",
    "персональные данные",
    "защита данных",
    "GDPR",
    "CodeLearn",
    "конфиденциальность",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Политика конфиденциальности — CodeLearn",
    description:
      "Информация о том, как CodeLearn собирает и защищает ваши персональные данные.",
    type: "website",
    siteName: "CodeLearn",
    locale: "ru_RU",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
