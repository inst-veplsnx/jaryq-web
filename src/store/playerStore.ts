"use client";

import { create } from "zustand";
import { Book, Chapter } from "@/types";

interface PlayerState {
  currentBook: Book | null;
  currentChapter: Chapter | null;
  chapterIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  chapters: Chapter[];
  isLoading: boolean;
  _pendingLoad: { index: number; startPosition: number } | null;
}

interface PlayerStore extends PlayerState {
  set: (partial: Partial<PlayerState>) => void;
  reset: () => void;
  _loadChapterFn: ((index: number, startPosition: number) => void) | null;
  registerLoadChapter: (fn: ((index: number, startPosition: number) => void) | null) => void;
  loadChapter: (book: Book, chapters: Chapter[], index: number, startPosition?: number) => void;
}

const initialState: PlayerState = {
  currentBook: null,
  currentChapter: null,
  chapterIndex: 0,
  isPlaying: false,
  position: 0,
  duration: 0,
  chapters: [],
  isLoading: false,
  _pendingLoad: null,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,
  _loadChapterFn: null,
  set: (partial) => set(partial),
  reset: () => set({ ...initialState, _loadChapterFn: get()._loadChapterFn }),
  registerLoadChapter: (fn) => {
    set({ _loadChapterFn: fn });
    if (!fn) return;
    const { _pendingLoad } = get();
    if (_pendingLoad) {
      set({ isLoading: true, _pendingLoad: null });
      fn(_pendingLoad.index, _pendingLoad.startPosition);
    }
  },
  loadChapter: (book, chapters, index, startPosition = 0) => {
    set({ currentBook: book, chapters, chapterIndex: index });
    const fn = get()._loadChapterFn;
    if (!fn) {
      // PlayerBar not yet mounted; store intent and execute when it registers
      set({ _pendingLoad: { index, startPosition } });
      return;
    }
    set({ isLoading: true });
    fn(index, startPosition);
  },
}));
