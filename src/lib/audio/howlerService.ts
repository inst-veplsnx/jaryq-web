"use client";

import { Howl } from "howler";

let howl: Howl | null = null;
let onEndCallback: (() => void) | null = null;

export const howlerService = {
  load(
    url: string,
    onEnd: () => void,
    onLoad?: () => void,
    onError?: (error: unknown) => void
  ): void {
    if (typeof window === "undefined") return;

    if (howl) {
      howl.unload();
      howl = null;
    }

    onEndCallback = onEnd;

    howl = new Howl({
      src: [url],
      html5: true,
      format: ["m4a", "mp3", "aac"],
      onend: () => {
        onEndCallback?.();
      },
      onload: () => {
        onLoad?.();
      },
      onloaderror: (_id: number, error: unknown) => {
        onError?.(error);
      },
    });
  },

  play(): void {
    howl?.play();
  },

  pause(): void {
    howl?.pause();
  },

  seekTo(seconds: number): void {
    howl?.seek(seconds);
  },

  setSpeed(rate: number): void {
    howl?.rate(rate);
  },

  getPosition(): number {
    if (!howl) return 0;
    const pos = howl.seek();
    return typeof pos === "number" ? pos : 0;
  },

  getDuration(): number {
    if (!howl) return 0;
    const dur = howl.duration();
    return typeof dur === "number" ? dur : 0;
  },

  isPlaying(): boolean {
    return howl?.playing() ?? false;
  },

  isLoaded(): boolean {
    return howl !== null && howl.state() === "loaded";
  },

  unload(): void {
    if (howl) {
      howl.unload();
      howl = null;
    }
    onEndCallback = null;
  },
};
