import type { Metadata } from "next";
import TermsClient from "./client";

export const metadata: Metadata = {
  title: "Условия использования — CodeLearn",
  description:
    "Ознакомьтесь с правилами пользования образовательной платформой CodeLearn. Документы определяют ваши права и обязанности как пользователя.",
  keywords: [
    "условия использования",
    "правила платформы",
    "пользовательское соглашение",
    "CodeLearn",
    "онлайн-обучение",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Условия использования — CodeLearn",
    description:
      "Правила пользования платформой CodeLearn. Ваши права и обязанности как пользователя.",
    type: "website",
    siteName: "CodeLearn",
    locale: "ru_RU",
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
