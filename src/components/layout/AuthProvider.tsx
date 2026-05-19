"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const largeText = useSettingsStore((s) => s.largeText);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const root = document.documentElement;
    if (largeText) {
      root.classList.add("jaryq-large-text");
    } else {
      root.classList.remove("jaryq-large-text");
    }
  }, [largeText]);

  return <>{children}</>;
}
