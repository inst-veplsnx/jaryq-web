"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, BookMarked, Heart, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const links = [
    {
      href: "/library",
      icon: BookMarked,
      label: "Кітап сөресі",
      desc: "Тыңдап жатқандарыңыз",
      color: "text-[#22C55E]",
      bg: "bg-[#F0FDF4]",
      border: "border-[#22C55E]/20",
    },
    {
      href: "/favorites",
      icon: Heart,
      label: "Таңдаулы",
      desc: "Сіздің жинағыңыз",
      color: "text-[#EC4899]",
      bg: "bg-[#FDF2F8]",
      border: "border-[#EC4899]/20",
    },
    {
      href: "/profile/settings",
      icon: Settings,
      label: "Баптаулар",
      desc: "Қолданба баптаулары",
      color: "text-[#8B5CF6]",
      bg: "bg-[#F5F3FF]",
      border: "border-[#8B5CF6]/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">

        {/* User card */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-8">
          <div className="flex items-center gap-6">
            <div
              aria-hidden="true"
              className="w-20 h-20 rounded-full bg-[#F97316] flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <span className="text-white text-3xl font-black">
                {(user?.full_name || user?.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0F0F0F]">
                {user?.full_name || "Пайдаланушы"}
              </h1>
              <p className="text-[#5C5C5C] mt-1">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation cards */}
        <nav aria-label="Профиль мәзірі">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {links.map(({ href, icon: Icon, label, desc, color, bg, border }) => (
              <Link
                key={href}
                href={href}
                className={`block bg-white rounded-2xl p-6 border ${border} hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2`}
              >
                <span
                  aria-hidden="true"
                  className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon size={24} className={color} />
                </span>
                <p className="font-bold text-[#0F0F0F]">{label}</p>
                <p className="text-[#5C5C5C] text-sm mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </nav>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#EF4444] bg-white border border-[#E8E8E8] hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
        >
          <LogOut size={16} aria-hidden="true" />
          Шығу
        </button>

      </div>
    </div>
  );
}
