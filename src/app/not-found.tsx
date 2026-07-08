import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="jaryq-gradient-auth flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-7xl font-black leading-none text-jaryq-primary-strong">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-black tracking-tight text-jaryq-text-primary sm:text-3xl">
        Бет табылмады
      </h1>
      <p className="mt-3 max-w-sm text-jaryq-text-secondary">
        Сіз іздеген бет жоқ немесе жылжытылған. Мекенжайды тексеріп, қайта
        көріңіз.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl jaryq-gradient-cta px-6 py-3 font-bold text-white transition-transform duration-(--duration-jaryq-base) ease-jaryq-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
          style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
        >
          <Home size={18} aria-hidden="true" />
          Басты бетке
        </Link>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-jaryq-border-warm bg-white px-6 py-3 font-bold text-jaryq-text-primary transition-[border-color,color,transform] duration-(--duration-jaryq-base) ease-jaryq-out hover:border-jaryq-primary hover:text-jaryq-primary-strong hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
        >
          <Search size={18} aria-hidden="true" />
          Кітаптарды шолу
        </Link>
      </div>
    </main>
  );
}
