export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import AdminTagsClient from "./client";

export const metadata: Metadata = {
  title: "Управление тегами — CodeLearn Admin",
  description: "Создание и редактирование тегов для категоризации курсов на платформе CodeLearn.",
};

export default function AdminTagsPage() {
  return <AdminTagsClient />;
}