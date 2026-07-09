import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/adminGuard";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Admin | JARYQ",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/home");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-lg font-bold">
              JARYQ Admin
            </Link>
            <Link
              href="/home"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Қолданбаға оралу
            </Link>
          </div>
          <Link
            href="/admin/books/new"
            className={buttonVariants({ size: "sm" })}
          >
            Жаңа кітап
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
