"use client";

import { useId } from "react";
import { Settings } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function SettingsPage() {
  const { autoSave, largeText, speed, setAutoSave, setLargeText, setSpeed } =
    useSettingsStore();
  const autoSaveLabelId = useId();
  const autoSaveDescId = useId();
  const largeTextLabelId = useId();
  const largeTextDescId = useId();
  const speedLabelId = useId();
  const speedDescId = useId();

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="bg-white border-b border-jaryq-border-light px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 bg-jaryq-bg-main rounded-xl flex items-center justify-center"
          >
            <Settings size={20} className="text-jaryq-text-secondary" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-jaryq-text-primary">
              Баптаулар
            </h1>
            <p className="text-sm text-jaryq-text-secondary">Қосымша баптаулары</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 max-w-2xl">
        {/* Auto save */}
        <div className="bg-white rounded-2xl p-5 border border-jaryq-border-light shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                id={autoSaveLabelId}
                className="font-semibold tracking-tight text-jaryq-text-primary"
              >
                Автосақтау
              </p>
              <p id={autoSaveDescId} className="text-sm text-jaryq-text-secondary mt-0.5">
                Прогресті автоматты сақтау
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoSave}
              aria-labelledby={autoSaveLabelId}
              aria-describedby={autoSaveDescId}
              onClick={() => setAutoSave(!autoSave)}
              className={`shrink-0 w-12 h-6 rounded-full transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${
                autoSave ? "bg-jaryq-primary" : "bg-jaryq-text-muted"
              } relative`}
            >
              <span className="sr-only">
                {autoSave ? "Қосулы" : "Өшірулі"}
              </span>
              <span
                aria-hidden="true"
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 motion-reduce:transition-none ${
                  autoSave ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Large text */}
        <div className="bg-white rounded-2xl p-5 border border-jaryq-border-light shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                id={largeTextLabelId}
                className="font-semibold tracking-tight text-jaryq-text-primary"
              >
                Үлкен мәтін
              </p>
              <p
                id={largeTextDescId}
                className="text-sm text-jaryq-text-secondary mt-0.5"
              >
                Мәтін өлшемін үлкейту
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={largeText}
              aria-labelledby={largeTextLabelId}
              aria-describedby={largeTextDescId}
              onClick={() => setLargeText(!largeText)}
              className={`shrink-0 w-12 h-6 rounded-full transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${
                largeText ? "bg-jaryq-primary" : "bg-jaryq-text-muted"
              } relative`}
            >
              <span className="sr-only">
                {largeText ? "Қосулы" : "Өшірулі"}
              </span>
              <span
                aria-hidden="true"
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 motion-reduce:transition-none ${
                  largeText ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Playback speed */}
        <div className="bg-white rounded-2xl p-5 border border-jaryq-border-light shadow-sm">
          <p
            id={speedLabelId}
            className="font-semibold tracking-tight text-jaryq-text-primary mb-1"
          >
            Ойнату жылдамдығы
          </p>
          <p id={speedDescId} className="text-sm text-jaryq-text-secondary mb-4">
            Аудиокітаптың жылдамдығын таңдаңыз
          </p>
          <div
            role="radiogroup"
            aria-labelledby={speedLabelId}
            aria-describedby={speedDescId}
            className="flex flex-wrap gap-2"
          >
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={speed === s}
                aria-label={`${s} есе жылдамдық`}
                onClick={() => setSpeed(s)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${
                  speed === s
                    ? "bg-jaryq-primary text-white shadow-sm"
                    : "bg-jaryq-bg-main text-jaryq-text-secondary hover:bg-jaryq-primary-soft hover:text-jaryq-primary"
                }`}
              >
                <span aria-hidden="true" className="tabular-nums">
                  {s}x
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
