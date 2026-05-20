"use client";

import { Howl } from "howler";

let howl: Howl | null = null;
let onEndCallback: (() => void) | null = null;
let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;

function clearLoadTimeout() {
  if (loadTimeoutId !== null) {
    clearTimeout(loadTimeoutId);
    loadTimeoutId = null;
  }
}

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

    clearLoadTimeout();
    onEndCallback = onEnd;

    // Safety net: if the browser never fires onload or onloaderror
    // (CORS silent failure, hanging request, etc.) resolve after 15 s.
    loadTimeoutId = setTimeout(() => {
      onError?.("timeout");
    }, 15_000);

    howl = new Howl({
      src: [url],
      html5: true,
      format: ["m4a", "mp3", "aac"],
      onend: () => {
        onEndCallback?.();
      },
      onload: () => {
        clearLoadTimeout();
        onLoad?.();
      },
      onloaderror: (_id: number, error: unknown) => {
        clearLoadTimeout();
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
    clearLoadTimeout();
    if (howl) {
      howl.unload();
      howl = null;
    }
    onEndCallback = null;
  },
};
