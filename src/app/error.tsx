"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="jaryq-gradient-auth flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-black tracking-tight text-jaryq-text-primary sm:text-3xl">
        Бірдеңе дұрыс болмады
      </h1>
      <p className="mt-3 max-w-sm text-jaryq-text-secondary">
        Күтпеген қате орын алды. Қайталап көріңіз — мәселе жалғасса, кейінірек
        оралыңыз.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-2xl jaryq-gradient-cta px-6 py-3 font-bold text-white transition-transform duration-(--duration-jaryq-base) ease-jaryq-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
        style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
      >
        <RotateCw size={18} aria-hidden="true" />
        Қайталау
      </button>
    </main>
  );
}
