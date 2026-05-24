import Image from "next/image";
import Link from "next/link";
import { PageLoadTransition } from "@/components/layout/PageLoadTransition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-jaryq-bg-cream">
      <a href="#main-content" className="jaryq-skip-link">
        Мазмұнға өту
      </a>
      <nav
        aria-label="Негізгі мәзір"
        className="sticky top-0 z-40 bg-jaryq-bg-cream/80 backdrop-blur-md border-b border-jaryq-border-warm"
        style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            aria-label="JARYQ бастапқы бетке"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded-md transition-transform duration-(--duration-jaryq-fast) hover:scale-[1.02]"
          >
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="rounded-lg"
              aria-hidden="true"
            />
            <span className="text-xl font-black text-jaryq-text-primary tracking-tight">
              JARYQ
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-jaryq-text-secondary hover:text-jaryq-primary transition-colors duration-(--duration-jaryq-fast) px-4 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
            >
              Кіру
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold jaryq-gradient-cta text-white px-5 py-2 rounded-full transition-[transform,box-shadow] duration-(--duration-jaryq-fast) ease-jaryq-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
              style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
            >
              Тіркелу
            </Link>
          </div>
        </div>
      </nav>
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <PageLoadTransition>{children}</PageLoadTransition>
      </main>
    </div>
  );
}
