"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BookMarked, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/playerStore";

const tabs = [
  { href: "/home", icon: Home, label: "Басты" },
  { href: "/search", icon: Search, label: "Іздеу" },
  { href: "/library", icon: BookMarked, label: "Сөре" },
  { href: "/profile", icon: User, label: "Профиль" },
];

interface MobileNavProps {
  isHidden?: boolean;
  onActivity?: () => void;
}

export const MobileNav = forwardRef<HTMLElement, MobileNavProps>(
  function MobileNav({ isHidden = false, onActivity }, ref) {
    const pathname = usePathname();
    const hasPlayer = usePlayerStore((s) => !!s.currentBook);

    return (
      <nav
        ref={ref}
        aria-label="Мобильді мәзір"
        onFocusCapture={onActivity}
        onPointerDown={onActivity}
        className={cn(
          "lg:hidden fixed left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-jaryq-border-light pb-safe transform-gpu will-change-transform transition-[bottom,transform] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
          hasPlayer ? "bottom-17" : "bottom-0",
          isHidden
            ? "translate-y-[calc(100%+0.75rem+env(safe-area-inset-bottom))] pointer-events-none"
            : "translate-y-0"
        )}
        style={{ boxShadow: "0 -8px 24px -16px rgba(15,15,15,0.10)" }}
      >
        <ul className="flex items-center justify-around h-16">
          {tabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none",
                    active ? "text-jaryq-primary" : "text-jaryq-text-secondary"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "p-1.5 rounded-lg transition-all duration-200 motion-reduce:transition-none",
                      active && "bg-jaryq-primary-soft scale-110"
                    )}
                  >
                    <Icon size={22} />
                  </span>
                  <span
                    className={cn(
                      "text-xs transition-all duration-150 motion-reduce:transition-none",
                      active ? "font-semibold" : "font-medium"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
);
