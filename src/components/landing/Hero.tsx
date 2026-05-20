import Link from "next/link";
import { Headphones, Play, Sparkles } from "lucide-react";

const WAVE_BARS = [0.55, 0.85, 0.45, 1, 0.7, 0.95, 0.5, 0.8, 0.6];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF4ED] via-[#FFFBF5] to-[#FFFBF5] pt-20 pb-28 px-4">
      {/* Decorative ambient blobs */}
      <div
        aria-hidden="true"
        className="jaryq-blob-drift absolute top-0 right-0 w-[600px] h-[600px] bg-[#F97316]/10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl"
      />
      <div
        aria-hidden="true"
        className="jaryq-blob-drift-alt absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#FDBA74]/20 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none blur-3xl"
      />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Text */}
        <div className="jaryq-reveal">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-[#F97316] text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-[#F0E7DC] shadow-sm">
            <Headphones size={14} aria-hidden="true" />
            Қазақстанның аудиокітап платформасы
          </div>
          <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-black text-[#0F0F0F] leading-[1.05] tracking-tight mb-6">
            Кітапты
            <br />
            <span className="text-[#F97316] italic">тыңдаудың</span>
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
              className="inline-flex items-center gap-2 bg-white text-[#0F0F0F] font-bold px-8 py-4 rounded-2xl border-2 border-[#F0E7DC] hover:border-[#F97316] hover:text-[#F97316] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
            >
              Кіру
            </Link>
          </div>

          {/* Trust micro-copy */}
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#475569]">
            <Sparkles size={14} className="text-[#F97316]" aria-hidden="true" />
            Тегін · Тіркеу 30 секундта · Несие картасы керек емес
          </p>

          {/* Stats */}
          <dl className="flex gap-8 mt-12 pt-8 border-t border-[#F0E7DC]">
            {[
              { value: "500+", label: "Аудиокітап" },
              { value: "50+", label: "Жанр" },
              { value: "10K+", label: "Тыңдаушы" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-sm text-[#5C5C5C] font-medium">{label}</dt>
                <dd className="font-display text-3xl lg:text-4xl font-black text-[#F97316]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual — book-cover collage + waveform */}
        <div
          className="relative flex justify-center items-center jaryq-reveal jaryq-reveal-delay-2"
          aria-hidden="true"
        >
          <div className="relative w-[340px] h-[440px]">
            {/* Waveform behind the covers */}
            <svg
              viewBox="0 0 360 360"
              className="absolute inset-0 w-full h-full opacity-60"
              aria-hidden="true"
            >
              <g transform="translate(180 180)">
                {WAVE_BARS.map((h, i) => {
                  const angle = (i / WAVE_BARS.length) * 360;
                  const radius = 150;
                  return (
                    <rect
                      key={i}
                      x={-3}
                      y={-radius - 18}
                      width={6}
                      height={36 * h}
                      rx={3}
                      fill="#F97316"
                      className="jaryq-wave-bar"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        animationDelay: `${i * 110}ms`,
                        transformBox: "fill-box",
                        transformOrigin: "center",
                      }}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Back cover — slate ink */}
            <div className="absolute top-6 -left-2 w-48 h-64 rounded-2xl shadow-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] -rotate-[10deg] flex flex-col justify-end p-4 border border-white/10">
              <div className="h-1 w-10 bg-[#F97316] rounded-full mb-3" />
              <p className="text-white font-display font-bold text-base leading-tight">
                Абай жолы
              </p>
              <p className="text-white/60 text-xs mt-1">М. Әуезов</p>
            </div>

            {/* Middle cover — cream */}
            <div className="absolute top-2 right-0 w-48 h-64 rounded-2xl shadow-xl bg-gradient-to-br from-[#FFF4ED] to-[#FDBA74] rotate-[8deg] flex flex-col justify-end p-4 border border-[#F0E7DC]">
              <div className="h-1 w-10 bg-[#1E293B] rounded-full mb-3" />
              <p className="text-[#0F0F0F] font-display font-bold text-base leading-tight">
                Қан мен тер
              </p>
              <p className="text-[#3B3B3B] text-xs mt-1">Ә. Нұрпейісов</p>
            </div>

            {/* Front cover — brand orange with play */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-52 h-72 rounded-2xl shadow-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex flex-col justify-between p-5 ring-1 ring-white/30">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase">
                  JARYQ
                </span>
                <Headphones size={16} className="text-white/80" />
              </div>
              <div>
                <div className="h-1 w-14 bg-white/70 rounded-full mb-3" />
                <p className="text-white font-display font-black text-2xl leading-tight">
                  Менің атым
                  <br />
                  Қожа
                </p>
                <p className="text-white/80 text-xs mt-1.5">Б. Соқпақбаев</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Play size={18} className="text-[#F97316] fill-[#F97316] ml-0.5" />
                </div>
                <div className="flex-1">
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-white rounded-full" />
                  </div>
                  <div className="flex justify-between mt-1.5 text-white/70 text-[10px] font-medium">
                    <span>12:34</span>
                    <span>38:20</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -right-4 top-4 bg-white rounded-2xl px-3 py-2 shadow-xl border border-[#F0E7DC] rotate-[6deg]">
              <p className="text-xs font-bold text-[#0F0F0F]">3-тарау</p>
              <p className="text-[10px] text-[#888888]">47:23 қалды</p>
            </div>
            <div className="absolute -left-6 bottom-12 bg-[#1E293B] text-white rounded-2xl px-3 py-2 shadow-xl -rotate-[6deg]">
              <p className="text-xs font-bold">1.5x жылдам</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
