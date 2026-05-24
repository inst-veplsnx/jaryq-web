"use client";

import { usePlayerStore } from "@/store/playerStore";
import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
  isNavigationCollapsed?: boolean;
  onActivity?: () => void;
}

export function MainContent({
  children,
  isNavigationCollapsed = false,
  onActivity,
}: MainContentProps) {
  const hasPlayer = usePlayerStore((s) => !!s.currentBook);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      onScrollCapture={onActivity}
      onFocusCapture={onActivity}
      className={cn(
        "flex-1 overflow-y-auto lg:pb-24 focus:outline-none transition-[margin,padding] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
        isNavigationCollapsed ? "lg:ml-[4.5rem]" : "lg:ml-60",
        hasPlayer ? "pb-35" : "pb-20"
      )}
    >
      {children}
    </main>
  );
}
