"use client";

import { forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useShallow } from "zustand/react/shallow";
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

const collapsedLink = "h-11 justify-center gap-0 px-0";
const navLabel =
  "min-w-0 max-w-[10rem] overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-jaryq-out motion-reduce:transition-none";
const collapsedLabel = "max-w-0 -translate-x-1 opacity-0";

interface SidebarProps {
  isCollapsed?: boolean;
  onActivity?: () => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { isCollapsed = false, onActivity },
  ref
) {
  const pathname = usePathname();
  const { signOut, user } = useAuthStore(
    useShallow((s) => ({ signOut: s.signOut, user: s.user }))
  );

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <aside
      ref={ref}
      aria-label="Бүйір мәзір"
      onFocusCapture={onActivity}
      onPointerDown={onActivity}
      onPointerEnter={onActivity}
      className={cn(
        "hidden lg:flex flex-col h-screen fixed left-0 top-0 bg-white border-r border-jaryq-border-light z-30 overflow-hidden transition-[width,box-shadow] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
        isCollapsed
          ? "w-[4.5rem] shadow-[10px_0_30px_-24px_rgba(15,15,15,0.28)]"
          : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "py-5 border-b border-jaryq-border-light transition-[padding] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
          isCollapsed ? "px-4" : "px-6"
        )}
      >
        <Link
          href="/home"
          aria-label="JARYQ бастапқы бетке"
          className={cn(
            "inline-flex items-center gap-2 rounded-md transition-[transform,gap] duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none motion-reduce:hover:scale-100",
            isCollapsed && "w-full justify-center gap-0"
          )}
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
          <span
            aria-hidden={isCollapsed}
            className={cn(
              "text-xl font-black text-jaryq-text-primary tracking-tight",
              navLabel,
              isCollapsed && collapsedLabel
            )}
          >
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
                    aria-label={isCollapsed ? label : undefined}
                    title={isCollapsed ? label : undefined}
                    className={cn(
                      linkBase,
                      isCollapsed && collapsedLink,
                      active
                        ? "bg-jaryq-primary-soft text-jaryq-primary-strong shadow-[inset_0_-1px_0_rgba(249,115,22,0.08)]"
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
                    <span
                      aria-hidden={isCollapsed}
                      className={cn(navLabel, isCollapsed && collapsedLabel)}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "transition-[padding] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
            isCollapsed ? "pt-3" : "pt-4"
          )}
        >
          <h2
            id="sidebar-catalog-heading"
            className={cn(
              "px-3 text-[10px] font-semibold text-jaryq-text-secondary uppercase tracking-widest transition-[height,margin,opacity] duration-200 ease-jaryq-out motion-reduce:transition-none",
              isCollapsed ? "h-0 mb-0 overflow-hidden opacity-0" : "mb-2"
            )}
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
                      aria-label={isCollapsed ? label : undefined}
                      title={isCollapsed ? label : undefined}
                      className={cn(
                        linkBase,
                        isCollapsed && collapsedLink,
                        active
                          ? "bg-jaryq-primary-soft text-jaryq-primary-strong"
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
                      <span
                        aria-hidden={isCollapsed}
                        className={cn(navLabel, isCollapsed && collapsedLabel)}
                      >
                        {label}
                      </span>
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
          <div
            className={cn(
              "px-4 pt-3 pb-2 transition-[padding] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
              isCollapsed && "px-3"
            )}
          >
            <p
              aria-hidden={isCollapsed}
              className={cn(
                "text-[10px] font-semibold text-jaryq-text-muted uppercase tracking-widest px-1 transition-[height,margin,opacity] duration-200 ease-jaryq-out motion-reduce:transition-none",
                isCollapsed ? "h-0 mb-0 overflow-hidden opacity-0" : "mb-2"
              )}
            >
              Аккаунт
            </p>
            <div
              className={cn(
                "flex items-center gap-3 transition-[gap] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
                isCollapsed && "justify-center gap-0"
              )}
              title={
                isCollapsed
                  ? user.full_name || user.email || "Пайдаланушы"
                  : undefined
              }
            >
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-jaryq-primary flex items-center justify-center flex-shrink-0 ring-2 ring-jaryq-primary-soft"
              >
                <span className="text-white text-sm font-bold">
                  {(user.full_name || user.email || "?")[0].toUpperCase()}
                </span>
              </div>
              <div
                aria-hidden={isCollapsed}
                className={cn(
                  "flex-1 min-w-0 transition-[max-width,opacity,transform] duration-200 ease-jaryq-out motion-reduce:transition-none",
                  isCollapsed
                    ? "max-w-0 -translate-x-1 overflow-hidden opacity-0"
                    : "max-w-[10rem] opacity-100"
                )}
              >
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
          <div
            className={cn(
              "px-4 pb-4 pt-1 border-t border-jaryq-border-light transition-[padding] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
              isCollapsed && "px-3"
            )}
          >
            <button
              onClick={handleSignOut}
              aria-label={isCollapsed ? "Шығу" : undefined}
              title={isCollapsed ? "Шығу" : undefined}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 bg-red-50/60 hover:bg-red-50 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 motion-reduce:transition-none",
                isCollapsed && "h-10 justify-center gap-0 px-0"
              )}
            >
              <LogOut size={16} aria-hidden="true" />
              <span
                aria-hidden={isCollapsed}
                className={cn(navLabel, isCollapsed && collapsedLabel)}
              >
                Шығу
              </span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
});
