export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { headers } from "next/headers";
import CertificateClient from "./client";

export const metadata: Metadata = {
  title: "Сертификат об окончании — CodeLearn",
  description: "Поздравляем с успешным окончанием курса! Скачайте ваш персональный сертификат в формате PDF.",
};

export default async function CertificatePage() {
  const nonce = (await headers()).get("x-nonce");
  return <CertificateClient nonce={nonce}/>;
}
