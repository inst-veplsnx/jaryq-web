import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

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
    <footer className="bg-jaryq-text-primary text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="JARYQ бастапқы бетке"
              className="flex items-center gap-2 mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
            >
              <Image
                src="/logo.png"
                alt=""
                width={36}
                height={36}
                className="rounded-xl"
                aria-hidden="true"
              />
              <span className="text-2xl font-black tracking-tight">JARYQ</span>
            </Link>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Қазақ тіліндегі аудиокітаптардың ең үлкен платформасы. Тегін.
              Барлығы үшін.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <nav key={section} aria-label={section}>
              <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-300 mb-4">
                {section}
              </h2>
              <ul className="space-y-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-neutral-400 hover:text-white hover:translate-x-0.5 text-sm inline-flex items-center transition-[color,transform] duration-(--duration-jaryq-fast) ease-jaryq-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded motion-reduce:transition-none motion-reduce:hover:translate-x-0"
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
          <p className="text-neutral-400 text-sm">
            © {CURRENT_YEAR} JARYQ. Барлық құқықтар сақталған.
          </p>
          <p className="text-neutral-400 text-sm inline-flex items-center gap-1.5">
            Жасалды
            <Heart
              size={14}
              aria-hidden="true"
              className="text-jaryq-primary fill-jaryq-primary"
            />
            <span className="sr-only">сүйіспеншілікпен</span>
            Қазақстан үшін
          </p>
        </div>
      </div>
    </footer>
  );
}
