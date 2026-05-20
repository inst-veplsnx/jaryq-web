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
    <section className="py-24 px-4 bg-[#FFFBF5]" id="features">
      <div className="max-w-7xl mx-auto jaryq-reveal">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-[#F97316] text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-[#F0E7DC] shadow-sm">
            Мүмкіндіктер
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-[#0F0F0F] mb-4 tracking-tight">
            Бәрі бір жерде
          </h2>
          <p className="text-lg text-[#3B3B3B] max-w-xl mx-auto">
            JARYQ сізге аудиокітаппен жұмыс жасауға қажеттінің барлығын ұсынады.
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, tone }) => {
            const t = TONES[tone];
            return (
              <li
                key={title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0E7DC] hover:shadow-lg hover:-translate-y-1 hover:border-[#F97316]/30 transition-all duration-300 group"
              >
                <div
                  aria-hidden="true"
                  className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center mb-4 ring-1 ${t.ring} group-hover:scale-110 transition-transform`}
                >
                  <Icon size={22} className={t.icon} />
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
