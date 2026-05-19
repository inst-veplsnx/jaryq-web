import Link from "next/link";
import Image from "next/image";
import { Headphones, Play, SkipBack, SkipForward } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF4ED] via-white to-white pt-20 pb-28 px-4">
      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F97316]/5 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Text */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#FFF4ED] text-[#F97316] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Headphones size={14} aria-hidden="true" />
            Қазақстанның аудиокітап платформасы
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-[#0F0F0F] leading-tight mb-6">
            Кітапты
            <br />
            <span className="text-[#F97316]">тыңдаудың</span>
            <br />
            уақыты келді
          </h1>
          <p className="text-lg text-[#3B3B3B] leading-relaxed mb-8 max-w-md">
            JARYQ — қазақ тіліндегі аудиокітаптардың ең үлкен платформасы.
            Мыңдаған кітапты тыңдаңыз, прогрессіңізді сақтаңыз,
            таңдаулыларыңызды жинаңыз.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#EA580C] transition-all hover:shadow-lg hover:shadow-[#F97316]/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
            >
              <Play size={18} className="fill-white" aria-hidden="true" />
              Тыңдауды бастау
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-[#0F0F0F] font-bold px-8 py-4 rounded-2xl border-2 border-[#E8E8E8] hover:border-[#F97316] hover:text-[#F97316] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
            >
              Кіру
            </Link>
          </div>

          {/* Stats */}
          <dl className="flex gap-8 mt-12 pt-8 border-t border-[#E8E8E8]">
            {[
              { value: "500+", label: "Аудиокітап" },
              { value: "50+", label: "Жанр" },
              { value: "10K+", label: "Тыңдаушы" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-sm text-[#5C5C5C] font-medium">{label}</dt>
                <dd className="text-3xl font-black text-[#F97316]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative flex justify-center" aria-hidden="true">
          <div className="relative w-72 h-96">
            {/* Phone mockup */}
            <div className="w-full h-full bg-[#0F0F0F] rounded-[40px] p-3 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col">
                {/* Status bar */}
                <div className="h-8 bg-[#F97316] flex items-center justify-center">
                  <span className="text-white text-xs font-bold tracking-widest">
                    JARYQ
                  </span>
                </div>
                {/* Book cover area */}
                <div className="flex-1 bg-[#FFF4ED] flex flex-col items-center justify-center px-6 gap-3">
                  <div className="w-32 h-44 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="JARYQ"
                      width={112}
                      height={112}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#0F0F0F] text-sm">Кітап атауы</p>
                    <p className="text-[#888888] text-xs">Автор аты</p>
                  </div>
                  {/* Player controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <SkipBack size={14} className="text-[#888888]" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#F97316] flex items-center justify-center shadow-lg">
                      <Play size={18} className="text-white fill-white ml-0.5" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <SkipForward size={14} className="text-[#888888]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -right-8 top-12 bg-white rounded-2xl px-3 py-2 shadow-xl border border-[#E8E8E8]">
              <p className="text-xs font-bold text-[#0F0F0F]">3-тарау</p>
              <p className="text-[10px] text-[#888888]">47:23 қалды</p>
            </div>
            <div className="absolute -left-8 bottom-20 bg-[#F97316] text-white rounded-2xl px-3 py-2 shadow-xl">
              <p className="text-xs font-bold">1.5x жылдам</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
