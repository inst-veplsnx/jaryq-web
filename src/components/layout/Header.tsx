"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function Header({ title, showSearch = true }: HeaderProps) {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#E8E8E8] px-4 h-14 flex items-center justify-between">
      <Link
        href="/home"
        aria-label="JARYQ бастапқы бетке"
        className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
      >
        <Image
          src="/logo.png"
          alt="JARYQ"
          width={28}
          height={28}
          className="rounded-md"
          aria-hidden="true"
        />
        {title ? (
          <span className="font-bold text-[#0F0F0F]">{title}</span>
        ) : (
          <span className="text-lg font-black text-[#0F0F0F] tracking-tight">
            JARYQ
          </span>
        )}
      </Link>

      <div className="flex items-center gap-2">
        {showSearch && (
          <Link
            href="/search"
            aria-label="Іздеу"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-[#5C5C5C] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
          >
            <Search size={20} aria-hidden="true" />
          </Link>
        )}
        {user && (
          <button
            onClick={handleSignOut}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-[#5C5C5C] hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            aria-label="Шығу"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
