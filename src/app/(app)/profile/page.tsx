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
      color: "text-green-500",
      bg: "bg-green-50",
      border: "border-green-500/20",
    },
    {
      href: "/favorites",
      icon: Heart,
      label: "Таңдаулы",
      desc: "Сіздің жинағыңыз",
      color: "text-pink-500",
      bg: "bg-pink-50",
      border: "border-pink-500/20",
    },
    {
      href: "/profile/settings",
      icon: Settings,
      label: "Баптаулар",
      desc: "Қолданба баптаулары",
      color: "text-violet-500",
      bg: "bg-violet-50",
      border: "border-violet-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">

        {/* User card */}
        <div className="bg-white rounded-2xl border border-jaryq-border-light p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div
              aria-hidden="true"
              className="w-20 h-20 rounded-full bg-jaryq-primary flex items-center justify-center flex-shrink-0 shadow-[0_15px_30px_-10px_rgba(249,115,22,0.5)] ring-4 ring-jaryq-primary-soft"
            >
              <span className="text-white text-3xl font-black">
                {(user?.full_name || user?.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-jaryq-text-primary">
                {user?.full_name || "Пайдаланушы"}
              </h1>
              <p className="text-jaryq-text-secondary mt-1">{user?.email}</p>
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
                className={`group block bg-white rounded-2xl p-6 border ${border} hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
              >
                <span
                  aria-hidden="true"
                  className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
                >
                  <Icon size={24} className={color} />
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-white border border-jaryq-border-light hover:bg-red-50 hover:border-red-500/30 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 motion-reduce:transition-none"
        >
          <LogOut size={16} aria-hidden="true" />
          Шығу
        </button>

      </div>
    </div>
  );
}
