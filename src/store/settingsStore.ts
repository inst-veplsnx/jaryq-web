"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  autoSave: boolean;
  largeText: boolean;
  speed: number;
  setAutoSave: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
  setSpeed: (value: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoSave: true,
      largeText: false,
      speed: 1.0,
      setAutoSave: (value) => set({ autoSave: value }),
      setLargeText: (value) => set({ largeText: value }),
      setSpeed: (value) => set({ speed: value }),
    }),
    {
      name: "jaryq-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
