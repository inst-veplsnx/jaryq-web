import { Heart, Globe, Users, BookOpen } from "lucide-react";

// Warm-editorial tone: orange or ink accent on the value's icon.
const TONE_ICON: Record<"orange" | "ink", string> = {
  orange: "text-jaryq-primary",
  ink: "text-jaryq-ink",
};

const values: Array<{
  icon: typeof BookOpen;
  title: string;
  description: string;
  tone: "orange" | "ink";
}> = [
  {
    icon: BookOpen,
    title: "Мазмұн сапасы",
    description:
      "Кәсіби дикторлармен жазылған аудиокітаптар. Тек ең жақсы шығармалар.",
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
      <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:items-start">
        {/* Mission — left, editorial, sticks while the values scroll past */}
        <div
          data-scroll-reveal="true"
          data-reveal-style="slide-right"
          className="lg:sticky lg:top-28"
        >
          <h2 className="font-display text-4xl lg:text-5xl font-black text-jaryq-text-primary tracking-tight">
            JARYQ дегеніміз не?
          </h2>
          <p className="mt-6 text-lg text-jaryq-text-secondary leading-relaxed max-w-md">
            JARYQ — қазақ тіліндегі аудиокітаптарды насихаттауға бағытталған
            әлеуметтік жоба. Біздің мақсатымыз — кітапты барлығына қолжетімді
            ету: жолда, жұмыста, демалыста.
          </p>
        </div>

        {/* Values — right, hairline-divided list (not a card grid) */}
        <ul
          data-reveal-group
          className="border-t border-jaryq-border-warm divide-y divide-jaryq-border-warm"
        >
          {values.map(({ icon: Icon, title, description, tone }) => (
            <li
              key={title}
              data-scroll-reveal="true"
              data-reveal-style="lift"
              className="flex gap-5 py-6 first:pt-8"
            >
              <Icon
                size={26}
                strokeWidth={1.75}
                aria-hidden="true"
                className={`jaryq-reveal-icon mt-0.5 shrink-0 ${TONE_ICON[tone]}`}
              />
              <div>
                <h3 className="text-lg font-bold text-jaryq-text-primary">
                  {title}
                </h3>
                <p className="mt-1 text-jaryq-text-secondary leading-relaxed">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
