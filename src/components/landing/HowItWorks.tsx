import { UserPlus, Search, Headphones } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Тіркелу",
    description:
      "Email мен паролді енгізіп, тіркелу жеткілікті. Тегін, бірнеше секундта.",
    color: "#F97316",
  },
  {
    number: "02",
    icon: Search,
    title: "Кітап таңдау",
    description:
      "Мыңдаған аудиокітаптар арасынан жанр бойынша іздеңіз немесе барлығын шолыңыз.",
    color: "#FB923C",
  },
  {
    number: "03",
    icon: Headphones,
    title: "Тыңдаңыз",
    description:
      "Ыңғайлы жылдамдықта тыңдаңыз. Прогресс автоматты сақталады.",
    color: "#1E293B",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <div
          data-scroll-reveal="true"
          data-reveal-style="lift"
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-jaryq-primary-soft text-jaryq-primary text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-jaryq-border-warm">
            Қалай жұмыс жасайды?
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-jaryq-text-primary mb-4 tracking-tight">
            3 қадамда бастаңыз
          </h2>
          <p className="text-lg text-jaryq-text-secondary max-w-xl mx-auto">
            JARYQ-ті пайдалану өте қарапайым. Тіркеліп, тыңдауды бастаңыз.
          </p>
        </div>

        <ol
          data-reveal-group
          className="grid md:grid-cols-3 gap-8 relative list-none"
        >
          {/* Connector line sits behind bubbles */}
          <li aria-hidden="true" className="contents">
            <span
              data-scroll-reveal="true"
              data-reveal-style="line"
              className="jaryq-step-connector hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-linear-to-r from-jaryq-primary via-jaryq-primary-light to-jaryq-ink opacity-30 z-0"
            />
          </li>

          {steps.map(({ number, icon: Icon, title, description, color }) => (
            <li
              key={number}
              data-scroll-reveal="true"
              data-reveal-style="scale"
              className="relative text-center"
            >
              <div
                aria-hidden="true"
                className="jaryq-reveal-icon w-24 h-24 rounded-3xl mx-auto mb-6 flex flex-col items-center justify-center relative z-10 ring-1 ring-white/40"
                style={{
                  backgroundColor: color,
                  boxShadow:
                    color === "#1E293B"
                      ? "var(--shadow-jaryq-lg)"
                      : "var(--shadow-jaryq-glow)",
                }}
              >
                <Icon size={32} className="text-white mb-1" />
                <span className="text-white text-xs font-bold opacity-80 tabular-nums">
                  {number}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-jaryq-text-primary mb-3">
                {title}
              </h3>
              <p className="text-jaryq-text-secondary leading-relaxed">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
