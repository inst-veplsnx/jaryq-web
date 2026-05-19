import Image from "next/image";
import Link from "next/link";

const links = {
  Платформа: [
    { label: "Жаңа кітаптар", href: "/new-arrivals" },
    { label: "Танымал", href: "/popular" },
    { label: "Жанрлар", href: "/genres" },
    { label: "Барлық кітаптар", href: "/books" },
  ],
  "Есептік жазба": [
    { label: "Тіркелу", href: "/register" },
    { label: "Кіру", href: "/login" },
    { label: "Кітап сөресі", href: "/library" },
    { label: "Профиль", href: "/profile" },
  ],
  Жоба: [
    { label: "Жоба туралы", href: "/#about" },
    { label: "Команда", href: "/#team" },
    { label: "Мүмкіндіктер", href: "/#features" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0F0F0F] text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="JARYQ бастапқы бетке"
              className="flex items-center gap-2 mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            >
              <Image
                src="/logo.png"
                alt="JARYQ"
                width={36}
                height={36}
                className="rounded-xl"
                aria-hidden="true"
              />
              <span className="text-2xl font-black tracking-tight">JARYQ</span>
            </Link>
            <p className="text-[#D4D4D4] text-sm leading-relaxed">
              Қазақ тіліндегі аудиокітаптардың ең үлкен платформасы. Тегін.
              Барлығы үшін.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <nav key={section} aria-label={section}>
              <h2 className="font-bold text-sm uppercase tracking-widest text-[#D4D4D4] mb-4">
                {section}
              </h2>
              <ul className="space-y-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[#A3A3A3] hover:text-white text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="pt-8 border-t border-[#3B3B3B]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#A3A3A3] text-sm">
            © {new Date().getFullYear()} JARYQ. Барлық құқықтар сақталған.
          </p>
          <p className="text-[#A3A3A3] text-sm">
            Жасалды <span aria-hidden="true">❤️</span>
            <span className="sr-only">сүйіспеншілікпен</span> Қазақстан үшін
          </p>
        </div>
      </div>
    </footer>
  );
}
