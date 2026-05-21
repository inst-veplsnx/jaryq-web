import Link from "next/link";
import { Headphones, Play, Sparkles, ArrowRight } from "lucide-react";

const WAVE_BARS = [0.55, 0.85, 0.45, 1, 0.7, 0.95, 0.5, 0.8, 0.6];

export function Hero() {
  return (
    <section className="relative overflow-hidden jaryq-gradient-warm pt-20 pb-28 px-4">
      {/* Decorative ambient blobs */}
      <div
        aria-hidden="true"
        className="jaryq-blob-drift absolute top-0 right-0 w-[600px] h-[600px] bg-jaryq-primary/10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl"
      />
      <div
        aria-hidden="true"
        className="jaryq-blob-drift-alt absolute bottom-0 left-0 w-[420px] h-[420px] bg-jaryq-primary-med/20 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none blur-3xl"
      />
      {/* Fine grain overlay — adds tactile depth without noise */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(15,15,15,0.6) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Text */}
        <div className="jaryq-reveal">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-jaryq-primary text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-jaryq-border-warm shadow-sm">
            <Headphones size={14} aria-hidden="true" />
            Қазақстанның аудиокітап платформасы
          </div>
          <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-black text-jaryq-text-primary leading-[1.05] tracking-tight mb-6">
            Кітапты
            <br />
            <span className="text-jaryq-primary italic">тыңдаудың</span>
            <br />
            уақыты келді
          </h1>
          <p className="text-lg text-jaryq-text-secondary leading-relaxed mb-8 max-w-md">
            JARYQ — қазақ тіліндегі аудиокітаптардың ең үлкен платформасы.
            Мыңдаған кітапты тыңдаңыз, прогрессіңізді сақтаңыз,
            таңдаулыларыңызды жинаңыз.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="group/cta inline-flex items-center gap-2 jaryq-gradient-cta text-white font-bold px-8 py-4 rounded-2xl transition-[transform,box-shadow] duration-[var(--duration-jaryq-base)] ease-[var(--ease-jaryq-out)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
              style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
            >
              <Play size={18} className="fill-white" aria-hidden="true" />
              Тыңдауды бастау
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-[var(--duration-jaryq-base)] group-hover/cta:translate-x-0.5"
              >
                <ArrowRight size={16} />
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-jaryq-text-primary font-bold px-8 py-4 rounded-2xl border-2 border-jaryq-border-warm transition-[border-color,color,transform,box-shadow] duration-[var(--duration-jaryq-base)] ease-[var(--ease-jaryq-out)] hover:border-jaryq-primary hover:text-jaryq-primary hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
              style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
            >
              Кіру
            </Link>
          </div>

          {/* Trust micro-copy */}
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#475569]">
            <Sparkles size={14} className="text-jaryq-primary" aria-hidden="true" />
            Тегін · Тіркеу 30 секундта · Несие картасы керек емес
          </p>

          {/* Stats */}
          <dl className="flex gap-8 mt-12 pt-8 border-t border-jaryq-border-warm">
            {[
              { value: "500+", label: "Аудиокітап" },
              { value: "50+", label: "Жанр" },
              { value: "10K+", label: "Тыңдаушы" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-sm text-jaryq-text-secondary font-medium">{label}</dt>
                <dd className="font-display text-3xl lg:text-4xl font-black text-jaryq-primary">
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
            <div
              className="absolute top-6 -left-2 w-48 h-64 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] -rotate-[10deg] flex flex-col justify-end p-4 border border-white/10"
              style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
            >
              <div className="h-1 w-10 bg-jaryq-primary rounded-full mb-3" />
              <p className="text-white font-display font-bold text-base leading-tight">
                Абай жолы
              </p>
              <p className="text-white/60 text-xs mt-1">М. Әуезов</p>
            </div>

            {/* Middle cover — cream */}
            <div
              className="absolute top-2 right-0 w-48 h-64 rounded-2xl bg-gradient-to-br from-[#FFF4ED] to-[#FDBA74] rotate-[8deg] flex flex-col justify-end p-4 border border-jaryq-border-warm"
              style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
            >
              <div className="h-1 w-10 bg-jaryq-ink rounded-full mb-3" />
              <p className="text-jaryq-text-primary font-display font-bold text-base leading-tight">
                Қан мен тер
              </p>
              <p className="text-jaryq-text-secondary text-xs mt-1">Ә. Нұрпейісов</p>
            </div>

            {/* Front cover — brand orange with play */}
            <div
              className="absolute top-16 left-1/2 -translate-x-1/2 w-52 h-72 rounded-2xl jaryq-gradient-cta-radial flex flex-col justify-between p-5 ring-1 ring-white/30"
              style={{ boxShadow: "var(--shadow-jaryq-lg), var(--shadow-jaryq-glow)" }}
            >
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
                  <Play size={18} className="text-jaryq-primary fill-[#F97316] ml-0.5" />
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
            <div
              className="absolute -right-4 top-4 bg-white rounded-2xl px-3 py-2 border border-jaryq-border-warm rotate-[6deg]"
              style={{ boxShadow: "var(--shadow-jaryq-md)" }}
            >
              <p className="text-xs font-bold text-jaryq-text-primary">3-тарау</p>
              <p className="text-[10px] text-jaryq-text-muted tabular-nums">47:23 қалды</p>
            </div>
            <div
              className="absolute -left-6 bottom-12 bg-jaryq-ink text-white rounded-2xl px-3 py-2 -rotate-[6deg]"
              style={{ boxShadow: "var(--shadow-jaryq-md)" }}
            >
              <p className="text-xs font-bold tabular-nums">1.5x жылдам</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
