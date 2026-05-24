import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-24 px-4 jaryq-gradient-cta overflow-hidden">
      {/* Glow accents */}
      <div
        aria-hidden="true"
        className="jaryq-blob-drift absolute -top-20 -right-20 w-105 h-105 bg-white/15 rounded-full pointer-events-none blur-3xl"
      />
      <div
        aria-hidden="true"
        className="jaryq-blob-drift-alt absolute -bottom-24 -left-16 w-80 h-80 bg-amber-200/20 rounded-full pointer-events-none blur-3xl"
      />
      <div
        data-scroll-reveal="true"
        data-reveal-style="scale"
        className="relative max-w-4xl mx-auto text-center"
      >
        <h2 className="font-display text-4xl lg:text-6xl font-black text-white mb-6 leading-[1.05] tracking-tight">
          Бүгін бастаңыз.
          <br />
          Тегін. Шексіз.
        </h2>
        <p className="text-lg text-white/85 mb-10 max-w-xl mx-auto leading-relaxed">
          Тіркеліп, мыңдаған аудиокітапқа қол жеткізіңіз. Ешқандай шек жоқ,
          ешқандай ақы жоқ.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/register"
            className="group/cta inline-flex items-center gap-3 bg-white text-jaryq-primary font-bold px-8 py-4 rounded-2xl transition-[transform,box-shadow,background-color] duration-(--duration-jaryq-base) ease-jaryq-out hover:bg-jaryq-primary-soft hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-jaryq-primary"
            style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
          >
            <Play size={20} className="fill-jaryq-primary" aria-hidden="true" />
            Тіркелу — тегін
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-(--duration-jaryq-base) group-hover/cta:translate-x-0.5"
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl border-2 border-white/40 hover:bg-white/10 hover:border-white transition-[background-color,border-color,transform] duration-(--duration-jaryq-base) ease-jaryq-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-jaryq-primary"
          >
            Кіру
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
