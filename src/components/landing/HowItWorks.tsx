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
    color: "#0EA5E9",
  },
  {
    number: "03",
    icon: Headphones,
    title: "Тыңдаңыз",
    description:
      "Ыңғайлы жылдамдықта тыңдаңыз. Прогресс автоматты сақталады.",
    color: "#22C55E",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FFF4ED] text-[#F97316] text-sm font-semibold px-4 py-2 rounded-full mb-4">
            Қалай жұмыс жасайды?
          </div>
          <h2 className="text-4xl font-black text-[#0F0F0F] mb-4">
            3 қадамда бастаңыз
          </h2>
          <p className="text-lg text-[#3B3B3B] max-w-xl mx-auto">
            JARYQ-ті пайдалану өте қарапайым. Тіркеліп, тыңдауды бастаңыз.
          </p>
        </div>

        <ol className="grid md:grid-cols-3 gap-8 relative list-none">
          {/* Connector line */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-[#E8E8E8]"
          />

          {steps.map(({ number, icon: Icon, title, description, color }) => (
            <li key={number} className="relative text-center">
              <div
                aria-hidden="true"
                className="w-24 h-24 rounded-3xl mx-auto mb-6 flex flex-col items-center justify-center shadow-lg relative z-10"
                style={{ backgroundColor: color }}
              >
                <Icon size={32} className="text-white mb-1" />
                <span className="text-white text-xs font-bold opacity-80">
                  {number}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0F0F0F] mb-3">{title}</h3>
              <p className="text-[#3B3B3B] leading-relaxed">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
