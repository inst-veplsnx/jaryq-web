import { Heart, Globe, Users, BookOpen } from "lucide-react";

const values = [
  {
    icon: BookOpen,
    title: "Мазмұн сапасы",
    description:
      "Кәсіби дикторлармен жазылған жоғары сапалы аудиокітаптар. Тек ең жақсы шығармалар.",
    color: "text-[#F97316]",
    bg: "bg-[#FFF4ED]",
  },
  {
    icon: Globe,
    title: "Қазақ тілі",
    description:
      "Қазақ тіліндегі аудиокітаптарды насихаттаймыз және тілдің дамуына үлес қосамыз.",
    color: "text-[#0EA5E9]",
    bg: "bg-[#F0F9FF]",
  },
  {
    icon: Users,
    title: "Қоғамдастық",
    description:
      "Кітап сүйетін адамдарды біріктіретін ашық платформа. Бірге оқимыз, бірге өсеміз.",
    color: "text-[#22C55E]",
    bg: "bg-[#F0FDF4]",
  },
  {
    icon: Heart,
    title: "Тегін",
    description:
      "JARYQ — әлеуметтік жоба. Барлық мазмұн тегін қолжетімді. Ақша жоқ, шек жоқ.",
    color: "text-[#EC4899]",
    bg: "bg-[#FDF2F8]",
  },
];

export function About() {
  return (
    <section className="py-24 px-4 bg-[#F5F5F5]" id="about">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FFF4ED] text-[#F97316] text-sm font-semibold px-4 py-2 rounded-full mb-4">
            Жоба туралы
          </div>
          <h2 className="text-4xl font-black text-[#0F0F0F] mb-4">
            JARYQ дегеніміз не?
          </h2>
          <p className="text-lg text-[#3B3B3B] max-w-2xl mx-auto leading-relaxed">
            JARYQ — қазақ тіліндегі аудиокітаптарды насихаттауға бағытталған
            әлеуметтік жоба. Біздің мақсатымыз — кітапты барлығына қолжетімді
            ету: жолда, жұмыста, демалыста.
          </p>
        </div>

        <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, description, color, bg }) => (
            <li
              key={title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E8E8] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div
                aria-hidden="true"
                className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}
              >
                <Icon size={24} className={color} />
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
