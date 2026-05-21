"use client";

import { usePlayerStore } from "@/store/playerStore";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const hasPlayer = usePlayerStore((s) => !!s.currentBook);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        "flex-1 lg:ml-60 overflow-y-auto lg:pb-24 focus:outline-none transition-all duration-200",
        hasPlayer ? "pb-35" : "pb-20"
      )}
    >
      {children}
    </main>
  );
}
