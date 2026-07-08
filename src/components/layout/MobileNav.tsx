"use client";

import { forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  Flame,
  Heart,
  Home,
  Layers,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/home", icon: Home, label: "Басты бет" },
  { href: "/search", icon: Search, label: "Іздеу" },
  { href: "/library", icon: BookMarked, label: "Кітап сөресі" },
];

const catalogNav = [
  { href: "/new-arrivals", icon: Sparkles, label: "Жаңа кітаптар" },
  { href: "/popular", icon: Flame, label: "Танымал" },
  { href: "/books", icon: BookOpen, label: "Барлық кітаптар" },
  { href: "/genres", icon: Layers, label: "Жанрлар" },
  { href: "/favorites", icon: Heart, label: "Таңдаулы" },
  { href: "/profile", icon: User, label: "Профиль" },
];

const mobileLinkBase =
  "relative flex h-11 w-11 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none";

interface MobileNavProps {
  isHidden?: boolean;
  onActivity?: () => void;
}

export const MobileNav = forwardRef<HTMLElement, MobileNavProps>(
  function MobileNav({ onActivity }, ref) {
    const pathname = usePathname();

    const renderLink = ({
      href,
      icon: Icon,
      label,
    }: {
      href: string;
      icon: typeof Home;
      label: string;
    }) => {
      const active = pathname === href || pathname.startsWith(href + "/");

      return (
        <li key={href}>
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            title={label}
            className={cn(
              mobileLinkBase,
              active
                ? "bg-jaryq-primary-soft text-jaryq-primary-strong"
                : "text-jaryq-text-secondary hover:bg-jaryq-bg-main hover:text-jaryq-text-primary"
            )}
          >
            {active && (
              <span
                aria-hidden="true"
                className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-jaryq-primary"
              />
            )}
            <Icon
              size={20}
              aria-hidden="true"
              className={cn(
                "transition-transform duration-150 motion-reduce:transition-none",
                active && "scale-110"
              )}
            />
            <span className="sr-only">{label}</span>
          </Link>
        </li>
      );
    };

    return (
      <nav
        ref={ref}
        aria-label="Мобильді мәзір"
        onFocusCapture={onActivity}
        className="fixed bottom-0 left-0 top-0 z-40 flex w-18 flex-col border-r border-jaryq-border-light bg-white/95 backdrop-blur-xl lg:hidden"
        style={{ boxShadow: "10px 0 30px -24px rgba(15,15,15,0.28)" }}
      >
        <Link
          href="/home"
          aria-label="JARYQ бастапқы бетке"
          className="mx-auto mb-3 mt-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-150 hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
        >
          <Image
            src="/logo.webp"
            alt=""
            width={32}
            height={32}
            className="rounded-lg"
            aria-hidden="true"
            priority
          />
        </Link>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          <nav aria-label="Негізгі мәзір">
            <ul className="space-y-1">{mainNav.map(renderLink)}</ul>
          </nav>

          <div className="my-3 h-px bg-jaryq-border-light" aria-hidden="true" />

          <nav aria-label="Каталог мәзірі">
            <ul className="space-y-1">{catalogNav.map(renderLink)}</ul>
          </nav>
        </div>
      </nav>
    );
  }
);
