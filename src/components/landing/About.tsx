import { Heart, Globe, Users, BookOpen } from "lucide-react";

type Tone = "orange" | "ink";

const TONES: Record<Tone, { icon: string; bg: string; ring: string }> = {
  orange: {
    icon: "text-[#F97316]",
    bg: "bg-[#FFF4ED]",
    ring: "ring-[#F97316]/20",
  },
  ink: {
    icon: "text-[#1E293B]",
    bg: "bg-[#F1F5F9]",
    ring: "ring-[#1E293B]/10",
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
    <section className="py-24 px-4 bg-[#FFFBF5]" id="about">
      <div className="max-w-7xl mx-auto jaryq-reveal">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-[#F97316] text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-[#F0E7DC] shadow-sm">
            Жоба туралы
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-[#0F0F0F] mb-4 tracking-tight">
            JARYQ дегеніміз не?
          </h2>
          <p className="text-lg text-[#3B3B3B] max-w-2xl mx-auto leading-relaxed">
            JARYQ — қазақ тіліндегі аудиокітаптарды насихаттауға бағытталған
            әлеуметтік жоба. Біздің мақсатымыз — кітапты барлығына қолжетімді
            ету: жолда, жұмыста, демалыста.
          </p>
        </div>

        <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, description, tone }) => {
            const t = TONES[tone];
            return (
              <li
                key={title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0E7DC] hover:shadow-lg hover:-translate-y-1 hover:border-[#F97316]/30 transition-all duration-300"
              >
                <div
                  aria-hidden="true"
                  className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center mb-4 ring-1 ${t.ring}`}
                >
                  <Icon size={24} className={t.icon} />
                </div>
                <h3 className="text-lg font-bold text-[#0F0F0F] mb-2">
                  {title}
                </h3>
                <p className="text-[#3B3B3B] text-sm leading-relaxed">
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
