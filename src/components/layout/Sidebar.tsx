"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  BookMarked,
  User,
  Sparkles,
  Flame,
  BookOpen,
  Heart,
  Layers,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const mainNav = [
  { href: "/home", icon: Home, label: "Басты бет" },
  { href: "/search", icon: Search, label: "Іздеу" },
  { href: "/library", icon: BookMarked, label: "Кітап сөресі" },
  { href: "/profile", icon: User, label: "Профиль" },
];

const catalogNav = [
  { href: "/new-arrivals", icon: Sparkles, label: "Жаңа кітаптар" },
  { href: "/popular", icon: Flame, label: "Танымал" },
  { href: "/books", icon: BookOpen, label: "Барлық кітаптар" },
  { href: "/genres", icon: Layers, label: "Жанрлар" },
  { href: "/favorites", icon: Heart, label: "Таңдаулы" },
];

const linkBase =
  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside
      aria-label="Бүйір мәзір"
      className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 bg-white border-r border-jaryq-border-light z-30"
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-jaryq-border-light">
        <Link
          href="/home"
          aria-label="JARYQ бастапқы бетке"
          className="inline-flex items-center gap-2 rounded-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="rounded-lg"
            aria-hidden="true"
          />
          <span className="text-xl font-black text-jaryq-text-primary tracking-tight">
            JARYQ
          </span>
        </Link>
      </div>

      {/* Main nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <nav aria-label="Негізгі мәзір">
          <ul className="space-y-0.5">
            {mainNav.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      linkBase,
                      active
                        ? "bg-jaryq-primary-soft text-jaryq-primary shadow-[inset_0_-1px_0_rgba(249,115,22,0.08)]"
                        : "text-jaryq-text-secondary hover:bg-jaryq-bg-main hover:text-jaryq-text-primary"
                    )}
                  >
                    {/* Active indicator rail */}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-jaryq-primary"
                      />
                    )}
                    <Icon
                      size={18}
                      aria-hidden="true"
                      className={cn(
                        "transition-transform duration-150 motion-reduce:transition-none",
                        active && "scale-110"
                      )}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pt-4">
          <h2
            id="sidebar-catalog-heading"
            className="px-3 text-[10px] font-semibold text-jaryq-text-secondary uppercase tracking-widest mb-2"
          >
            Каталог
          </h2>
          <nav aria-labelledby="sidebar-catalog-heading">
            <ul className="space-y-0.5">
              {catalogNav.map(({ href, icon: Icon, label }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        linkBase,
                        active
                          ? "bg-jaryq-primary-soft text-jaryq-primary"
                          : "text-jaryq-text-secondary hover:bg-jaryq-bg-main hover:text-jaryq-text-primary"
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-jaryq-primary"
                        />
                      )}
                      <Icon
                        size={18}
                        aria-hidden="true"
                        className={cn(
                          "transition-transform duration-150 motion-reduce:transition-none",
                          active && "scale-110"
                        )}
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* User footer */}
      {user && (
        <div className="border-t border-jaryq-border-light">
          {/* User info */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] font-semibold text-jaryq-text-muted uppercase tracking-widest px-1 mb-2">
              Аккаунт
            </p>
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-jaryq-primary flex items-center justify-center flex-shrink-0 ring-2 ring-jaryq-primary-soft"
              >
                <span className="text-white text-sm font-bold">
                  {(user.full_name || user.email || "?")[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-tight text-jaryq-text-primary truncate">
                  {user.full_name || "Пайдаланушы"}
                </p>
                <p className="text-xs text-jaryq-text-secondary truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          {/* Logout — visually separated destructive action */}
          <div className="px-4 pb-4 pt-1 border-t border-jaryq-border-light">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 bg-red-50/60 hover:bg-red-50 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 motion-reduce:transition-none"
            >
              <LogOut size={16} aria-hidden="true" />
              Шығу
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
