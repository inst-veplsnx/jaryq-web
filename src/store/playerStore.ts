"use client";

import { create } from "zustand";
import { Book, Chapter } from "@/types";

interface PlayerState {
  currentBook: Book | null;
  currentChapter: Chapter | null;
  chapterIndex: number;
  isPlaying: boolean;
  speed: number;
  position: number;
  duration: number;
  chapters: Chapter[];
  isLoading: boolean;
}

interface PlayerStore extends PlayerState {
  set: (partial: Partial<PlayerState>) => void;
  reset: () => void;
}

const initialState: PlayerState = {
  currentBook: null,
  currentChapter: null,
  chapterIndex: 0,
  isPlaying: false,
  speed: 1.0,
  position: 0,
  duration: 0,
  chapters: [],
  isLoading: false,
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  ...initialState,
  set: (partial) => set(partial),
  reset: () => set(initialState),
}));
