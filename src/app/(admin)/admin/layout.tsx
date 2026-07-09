import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { getAdminUser } from "@/lib/adminGuard";

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
    <div className="min-h-[100dvh] bg-jaryq-bg-main">
      {/* Fluid-island nav: a floating glass pill, detached from the top edge. */}
      <header className="sticky top-0 z-20 px-4 pt-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-full border border-jaryq-border-warm bg-jaryq-bg-card/80 px-3 py-2 shadow-jaryq-sm backdrop-blur-xl sm:px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="font-display text-lg font-bold tracking-tight text-jaryq-text-primary"
            >
              JARYQ<span className="text-jaryq-primary">.</span>
              <span className="ml-2 rounded-full bg-jaryq-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-jaryq-primary align-middle">
                Admin
              </span>
            </Link>
            <Link
              href="/home"
              className="hidden items-center gap-1 text-xs font-medium text-jaryq-text-muted transition-colors duration-jaryq-fast hover:text-jaryq-text-primary sm:inline-flex"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              Қолданбаға оралу
            </Link>
          </div>
          <Link
            href="/admin/books/new"
            className="group inline-flex items-center gap-2 rounded-full bg-jaryq-text-primary py-1.5 pl-4 pr-1.5 text-sm font-semibold text-white shadow-jaryq-sm transition-all duration-jaryq-base ease-jaryq-out hover:shadow-jaryq-md active:scale-[0.98]"
          >
            Жаңа кітап
            <span className="flex size-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-jaryq-base ease-jaryq-out group-hover:translate-x-0.5 group-hover:-translate-y-px motion-reduce:transform-none">
              <Plus className="size-4" strokeWidth={1.75} />
            </span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">{children}</main>
    </div>
  );
}
