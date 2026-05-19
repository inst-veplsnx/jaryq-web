import Image from "next/image";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <a href="#main-content" className="jaryq-skip-link">
        Мазмұнға өту
      </a>
      <nav
        aria-label="Негізгі мәзір"
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E8E8E8]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            aria-label="JARYQ бастапқы бетке"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-md"
          >
            <Image
              src="/logo.png"
              alt="JARYQ"
              width={32}
              height={32}
              className="rounded-lg"
              aria-hidden="true"
            />
            <span className="text-xl font-black text-[#0F0F0F] tracking-tight">
              JARYQ
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#3B3B3B] hover:text-[#F97316] transition-colors px-4 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            >
              Кіру
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#F97316] text-white px-5 py-2 rounded-full hover:bg-[#EA580C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
            >
              Тіркелу
            </Link>
          </div>
        </div>
      </nav>
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
    </div>
  );
}
