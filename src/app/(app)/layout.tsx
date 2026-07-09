import { AppShell } from "@/components/layout/AppShell";
import { getAdminUser } from "@/lib/adminGuard";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = !!(await getAdminUser());
  return <AppShell isAdmin={isAdmin}>{children}</AppShell>;
}
