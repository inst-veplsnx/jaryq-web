import {
  Search,
  Layers,
  BookMarked,
  Heart,
  Gauge,
  Smartphone,
} from "lucide-react";

type Tone = "orange" | "ink";

const TONES: Record<Tone, { icon: string; bg: string; ring: string }> = {
  orange: {
    icon: "text-jaryq-primary",
    bg: "bg-jaryq-primary-soft",
    ring: "ring-jaryq-primary/20",
  },
  ink: {
    icon: "text-jaryq-ink",
    bg: "bg-jaryq-ink-soft",
    ring: "ring-jaryq-ink/10",
  },
};

const features: Array<{
  icon: typeof Search;
  title: string;
  description: string;
  tone: Tone;
}> = [
  {
    icon: Search,
    title: "Жылдам іздеу",
    description: "Кітапты атауы, авторы немесе диктор бойынша лезде табыңыз.",
    tone: "orange",
  },
  {
    icon: Layers,
    title: "Жанрлар",
    description:
      "Классика, детектив, фантастика, балаларға — барлық жанр бар.",
    tone: "ink",
  },
  {
    icon: BookMarked,
    title: "Прогресс",
    description:
      "Тыңдаған жеріңізден жалғастырыңыз. Прогресс автоматты сақталады.",
    tone: "orange",
  },
  {
    icon: Heart,
    title: "Таңдаулылар",
    description: "Ең жақсы кітаптарыңызды таңдаулыларға қосып, тез табыңыз.",
    tone: "ink",
  },
  {
    icon: Gauge,
    title: "Жылдамдық реттеу",
    description: "0.75x-тен 2.0x-ке дейін жылдамдықты өз қалауыңыз бойынша.",
    tone: "orange",
  },
  {
    icon: Smartphone,
    title: "Мобильді қосымша",
    description:
      "Android және iOS-та жұмыс жасайтын мобильді нұсқасы да бар.",
    tone: "ink",
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 bg-jaryq-bg-cream" id="features">
      <div className="max-w-7xl mx-auto jaryq-reveal">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 bg-white text-jaryq-primary text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-jaryq-border-warm"
            style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
          >
            Мүмкіндіктер
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-jaryq-text-primary mb-4 tracking-tight">
            Бәрі бір жерде
          </h2>
          <p className="text-lg text-jaryq-text-secondary max-w-xl mx-auto">
            JARYQ сізге аудиокітаппен жұмыс жасауға қажеттінің барлығын ұсынады.
          </p>
        </div>

        <ul
          data-reveal-group
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(({ icon: Icon, title, description, tone }) => {
            const t = TONES[tone];
            return (
              <li
                key={title}
                data-reveal
                className="jaryq-card jaryq-card-hover jaryq-reveal group rounded-2xl p-6 motion-reduce:hover:translate-y-0"
              >
                <div
                  aria-hidden="true"
                  className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center mb-4 ring-1 ${t.ring} transition-transform duration-[var(--duration-jaryq-base)] group-hover:scale-110 group-hover:rotate-[-4deg] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0`}
                >
                  <Icon size={22} className={t.icon} />
                </div>
                <h3 className="text-lg font-bold text-jaryq-text-primary mb-2">
                  {title}
                </h3>
                <p className="text-jaryq-text-secondary text-sm leading-relaxed">
                  {description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
