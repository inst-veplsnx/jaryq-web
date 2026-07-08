"use client";

import Link from "next/link";
import { Settings, BookMarked, Heart, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface ProfileLink {
  href: string;
  icon: typeof Settings;
  label: string;
  desc: string;
  iconClass: string;
  bgClass: string;
}

const PROFILE_LINKS: ProfileLink[] = [
  {
    href: "/library",
    icon: BookMarked,
    label: "Кітап сөресі",
    desc: "Тыңдап жатқандарыңыз",
    iconClass: "text-jaryq-primary-strong",
    bgClass: "bg-jaryq-primary-soft",
  },
  {
    href: "/favorites",
    icon: Heart,
    label: "Таңдаулы",
    desc: "Сіздің жинағыңыз",
    iconClass: "text-rose-600",
    bgClass: "bg-rose-50",
  },
  {
    href: "/profile/settings",
    icon: Settings,
    label: "Баптаулар",
    desc: "Қолданба баптаулары",
    iconClass: "text-jaryq-ink",
    bgClass: "bg-jaryq-ink-soft",
  },
];

export default function ProfilePage() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-10 space-y-8">

        {/* User card */}
        <div
          className="jaryq-card p-8 rounded-2xl"
          style={{ boxShadow: "var(--shadow-jaryq-sm)" }}
        >
          <div className="flex items-center gap-6">
            <div
              aria-hidden="true"
              className="w-20 h-20 rounded-full jaryq-gradient-cta-radial flex items-center justify-center flex-shrink-0 ring-4 ring-jaryq-primary-soft"
              style={{ boxShadow: "var(--shadow-jaryq-glow)" }}
            >
              <span className="text-white text-3xl font-black drop-shadow-sm">
                {(user?.full_name || user?.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl lg:text-3xl font-black tracking-tight text-jaryq-text-primary leading-[1.1] truncate">
                {user?.full_name || "Пайдаланушы"}
              </h1>
              <p className="text-jaryq-text-secondary mt-1 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation cards */}
        <nav aria-label="Профиль мәзірі">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROFILE_LINKS.map(({ href, icon: Icon, label, desc, iconClass, bgClass }) => (
              <Link
                key={href}
                href={href}
                className="jaryq-card jaryq-card-hover group block rounded-2xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-(--duration-jaryq-base) group-hover:scale-110 group-hover:-rotate-4 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0",
                    bgClass
                  )}
                >
                  <Icon size={24} className={iconClass} />
                </span>
                <p className="font-bold tracking-tight text-jaryq-text-primary">
                  {label}
                </p>
                <p className="text-jaryq-text-secondary text-sm mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </nav>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-white border border-jaryq-border-light hover:bg-red-50 hover:border-red-500/30 active:scale-[0.98] transition-[background-color,border-color,transform] duration-(--duration-jaryq-fast) ease-jaryq-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 motion-reduce:transition-none"
        >
          <LogOut size={16} aria-hidden="true" />
          Шығу
        </button>

      </div>
    </div>
  );
}
