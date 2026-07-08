"use client";

import { useId, useRef } from "react";
import { Settings } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

interface SwitchRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function SwitchRow({ label, description, checked, onChange }: SwitchRowProps) {
  const labelId = useId();
  const descId = useId();
  return (
    <div
      className="jaryq-card p-5 rounded-2xl"
      style={{ boxShadow: "var(--shadow-jaryq-sm)" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p
            id={labelId}
            className="font-semibold tracking-tight text-jaryq-text-primary"
          >
            {label}
          </p>
          <p
            id={descId}
            className="text-sm text-jaryq-text-secondary mt-0.5"
          >
            {description}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={labelId}
          aria-describedby={descId}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative shrink-0 w-12 h-7 rounded-full transition-colors duration-(--duration-jaryq-base) ease-jaryq-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none",
            checked ? "bg-jaryq-primary" : "bg-jaryq-border-light"
          )}
          style={{
            boxShadow: checked
              ? "var(--shadow-jaryq-glow-sm), inset 0 1px 2px rgba(0,0,0,0.08)"
              : "inset 0 1px 2px rgba(0,0,0,0.08)",
          }}
        >
          <span className="sr-only">{checked ? "Қосулы" : "Өшірулі"}</span>
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-(--duration-jaryq-base) ease-jaryq-spring motion-reduce:transition-none",
              checked ? "translate-x-5" : "translate-x-0"
            )}
            style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}
          />
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { autoSave, largeText, speed, setAutoSave, setLargeText, setSpeed } =
    useSettingsStore();
  const speedLabelId = useId();
  const speedDescId = useId();
  const speedOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusSpeedOption = (index: number) => {
    const option = SPEED_OPTIONS[index];
    setSpeed(option);
    window.requestAnimationFrame(() => {
      speedOptionRefs.current[index]?.focus();
    });
  };

  const handleSpeedKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % SPEED_OPTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        (index - 1 + SPEED_OPTIONS.length) % SPEED_OPTIONS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = SPEED_OPTIONS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      focusSpeedOption(nextIndex);
    }
  };

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-10">
        <PageHeader
          icon={Settings}
          title="Баптаулар"
          subtitle="Қолданбаны өзіңізге ыңғайлап алыңыз"
        />

        <div className="space-y-4">
          <SwitchRow
            label="Автосақтау"
            description="Прогресті автоматты сақтау"
            checked={autoSave}
            onChange={setAutoSave}
          />
          <SwitchRow
            label="Үлкен мәтін"
            description="Мәтін өлшемін үлкейту"
            checked={largeText}
            onChange={setLargeText}
          />

          {/* Playback speed */}
          <div
            className="jaryq-card p-5 rounded-2xl"
            style={{ boxShadow: "var(--shadow-jaryq-sm)" }}
          >
            <p
              id={speedLabelId}
              className="font-semibold tracking-tight text-jaryq-text-primary mb-1"
            >
              Ойнату жылдамдығы
            </p>
            <p
              id={speedDescId}
              className="text-sm text-jaryq-text-secondary mb-4"
            >
              Аудиокітаптың жылдамдығын таңдаңыз
            </p>
            <div
              role="radiogroup"
              aria-labelledby={speedLabelId}
              aria-describedby={speedDescId}
              className="flex flex-wrap gap-2"
            >
              {SPEED_OPTIONS.map((s, index) => {
                const active = speed === s;
                return (
                  <button
                    key={s}
                    ref={(element) => {
                      speedOptionRefs.current[index] = element;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`${s} есе жылдамдық`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setSpeed(s)}
                    onKeyDown={(event) => handleSpeedKeyDown(event, index)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-[background-color,color,box-shadow,transform] duration-(--duration-jaryq-fast) ease-jaryq-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none",
                      active
                        ? "jaryq-gradient-cta text-white"
                        : "bg-jaryq-bg-main text-jaryq-text-secondary hover:bg-jaryq-primary-soft hover:text-jaryq-primary-strong"
                    )}
                    style={
                      active
                        ? { boxShadow: "var(--shadow-jaryq-glow-sm)" }
                        : undefined
                    }
                  >
                    <span aria-hidden="true" className="tabular-nums">
                      {s}x
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
