import { ClientProviders } from "@/components/client-providers";

/**
 * Layout для защищённых маршрутов.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
