import {
  Search,
  Layers,
  BookMarked,
  Heart,
  Gauge,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Жылдам іздеу",
    description: "Кітапты атауы, авторы немесе диктор бойынша лезде табыңыз.",
    color: "text-[#0EA5E9]",
    bg: "bg-[#F0F9FF]",
  },
  {
    icon: Layers,
    title: "Жанрлар",
    description:
      "Классика, детектив, фантастика, балаларға — барлық жанр бар.",
    color: "text-[#8B5CF6]",
    bg: "bg-[#F5F3FF]",
  },
  {
    icon: BookMarked,
    title: "Прогресс",
    description:
      "Тыңдаған жеріңізден жалғастырыңыз. Прогресс автоматты сақталады.",
    color: "text-[#22C55E]",
    bg: "bg-[#F0FDF4]",
  },
  {
    icon: Heart,
    title: "Таңдаулылар",
    description: "Ең жақсы кітаптарыңызды таңдаулыларға қосып, тез табыңыз.",
    color: "text-[#EC4899]",
    bg: "bg-[#FDF2F8]",
  },
  {
    icon: Gauge,
    title: "Жылдамдық реттеу",
    description: "0.75x-тен 2.0x-ке дейін жылдамдықты өз қалауыңыз бойынша.",
    color: "text-[#F97316]",
    bg: "bg-[#FFF4ED]",
  },
  {
    icon: Smartphone,
    title: "Мобильді қосымша",
    description:
      "Android және iOS-та жұмыс жасайтын мобильді нұсқасы да бар.",
    color: "text-[#06B6D4]",
    bg: "bg-[#F0FDFF]",
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 bg-[#F5F5F5]" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FFF4ED] text-[#F97316] text-sm font-semibold px-4 py-2 rounded-full mb-4">
            Мүмкіндіктер
          </div>
          <h2 className="text-4xl font-black text-[#0F0F0F] mb-4">
            Бәрі бір жерде
          </h2>
          <p className="text-lg text-[#3B3B3B] max-w-xl mx-auto">
            JARYQ сізге аудиокітаппен жұмыс жасауға қажеттінің барлығын ұсынады.
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <li
              key={title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E8E8] hover:shadow-md hover:border-[#F97316]/20 transition-all duration-300 group"
            >
              <div
                aria-hidden="true"
                className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon size={22} className={color} />
              </div>
              <h3 className="text-lg font-bold text-[#0F0F0F] mb-2">{title}</h3>
              <p className="text-[#3B3B3B] text-sm leading-relaxed">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
