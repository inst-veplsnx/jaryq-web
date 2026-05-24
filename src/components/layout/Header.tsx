"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, LogOut } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function Header({ title, showSearch = true }: HeaderProps) {
  const router = useRouter();
  const { user, signOut } = useAuthStore(
    useShallow((s) => ({ user: s.user, signOut: s.signOut }))
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header
      className="lg:hidden sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-jaryq-border-light px-4 h-14 flex items-center justify-between"
      style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
    >
      <Link
        href="/home"
        aria-label="JARYQ бастапқы бетке"
        className="inline-flex items-center gap-2 rounded-md transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
      >
        <Image
          src="/logo.png"
          alt=""
          width={28}
          height={28}
          className="rounded-md"
          aria-hidden="true"
          priority
        />
        {title ? (
          <span className="font-bold tracking-tight text-jaryq-text-primary">
            {title}
          </span>
        ) : (
          <span className="text-lg font-black text-jaryq-text-primary tracking-tight">
            JARYQ
          </span>
        )}
      </Link>

      <div className="flex items-center gap-2">
        {showSearch && (
          <Link
            href="/search"
            aria-label="Іздеу"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
          >
            <Search size={20} aria-hidden="true" />
          </Link>
        )}
        {user && (
          <button
            onClick={handleSignOut}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-jaryq-text-secondary hover:bg-red-50 hover:text-red-500 transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
            aria-label="Шығу"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
