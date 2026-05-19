import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-[#F97316] to-[#EA580C]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
          Бүгін бастаңыз.
          <br />
          Тегін. Шексіз.
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
          Тіркеліп, мыңдаған аудиокітапқа қол жеткізіңіз. Ешқандай шек жоқ,
          ешқандай ақы жоқ.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-white text-[#F97316] font-bold px-8 py-4 rounded-2xl hover:bg-[#FFF4ED] transition-all hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#F97316]"
          >
            <Play size={20} className="fill-[#F97316]" aria-hidden="true" />
            Тіркелу — тегін
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl border-2 border-white/30 hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#F97316]"
          >
            Кіру
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
