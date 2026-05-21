import { Heart, Globe, Users, BookOpen } from "lucide-react";

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

const values: Array<{
  icon: typeof BookOpen;
  title: string;
  description: string;
  tone: Tone;
}> = [
  {
    icon: BookOpen,
    title: "Мазмұн сапасы",
    description:
      "Кәсіби дикторлармен жазылған жоғары сапалы аудиокітаптар. Тек ең жақсы шығармалар.",
    tone: "orange",
  },
  {
    icon: Globe,
    title: "Қазақ тілі",
    description:
      "Қазақ тіліндегі аудиокітаптарды насихаттаймыз және тілдің дамуына үлес қосамыз.",
    tone: "ink",
  },
  {
    icon: Users,
    title: "Қоғамдастық",
    description:
      "Кітап сүйетін адамдарды біріктіретін ашық платформа. Бірге оқимыз, бірге өсеміз.",
    tone: "orange",
  },
  {
    icon: Heart,
    title: "Тегін",
    description:
      "JARYQ — әлеуметтік жоба. Барлық мазмұн тегін қолжетімді. Ақша жоқ, шек жоқ.",
    tone: "ink",
  },
];

export function About() {
  return (
    <section className="py-24 px-4 bg-jaryq-bg-cream" id="about">
      <div className="max-w-7xl mx-auto jaryq-reveal">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 bg-white text-jaryq-primary text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-jaryq-border-warm"
            style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
          >
            Жоба туралы
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-jaryq-text-primary mb-4 tracking-tight">
            JARYQ дегеніміз не?
          </h2>
          <p className="text-lg text-jaryq-text-secondary max-w-2xl mx-auto leading-relaxed">
            JARYQ — қазақ тіліндегі аудиокітаптарды насихаттауға бағытталған
            әлеуметтік жоба. Біздің мақсатымыз — кітапты барлығына қолжетімді
            ету: жолда, жұмыста, демалыста.
          </p>
        </div>

        <ul
          data-reveal-group
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {values.map(({ icon: Icon, title, description, tone }) => {
            const t = TONES[tone];
            return (
              <li
                key={title}
                data-reveal
                className="jaryq-card jaryq-card-hover jaryq-reveal group rounded-2xl p-6 motion-reduce:hover:translate-y-0"
              >
                <div
                  aria-hidden="true"
                  className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center mb-4 ring-1 ${t.ring} transition-transform duration-(--duration-jaryq-base) group-hover:scale-110 group-hover:-rotate-4 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0`}
                >
                  <Icon size={24} className={t.icon} />
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
