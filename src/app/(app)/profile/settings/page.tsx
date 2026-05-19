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
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-white border-b border-[#E8E8E8] px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center"
          >
            <Settings size={20} className="text-[#5C5C5C]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0F0F0F]">Баптаулар</h1>
            <p className="text-sm text-[#5C5C5C]">Қосымша баптаулары</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Auto save */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
          <div className="flex items-center justify-between">
            <div>
              <p id={autoSaveLabelId} className="font-semibold text-[#0F0F0F]">
                Автосақтау
              </p>
              <p id={autoSaveDescId} className="text-sm text-[#5C5C5C] mt-0.5">
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
              className={`w-12 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 ${
                autoSave ? "bg-[#F97316]" : "bg-[#888888]"
              } relative`}
            >
              <span className="sr-only">
                {autoSave ? "Қосулы" : "Өшірулі"}
              </span>
              <span
                aria-hidden="true"
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  autoSave ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Large text */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
          <div className="flex items-center justify-between">
            <div>
              <p id={largeTextLabelId} className="font-semibold text-[#0F0F0F]">
                Үлкен мәтін
              </p>
              <p id={largeTextDescId} className="text-sm text-[#5C5C5C] mt-0.5">
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
              className={`w-12 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 ${
                largeText ? "bg-[#F97316]" : "bg-[#888888]"
              } relative`}
            >
              <span className="sr-only">
                {largeText ? "Қосулы" : "Өшірулі"}
              </span>
              <span
                aria-hidden="true"
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  largeText ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Playback speed */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
          <p id={speedLabelId} className="font-semibold text-[#0F0F0F] mb-1">
            Ойнату жылдамдығы
          </p>
          <p id={speedDescId} className="text-sm text-[#5C5C5C] mb-4">
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
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 ${
                  speed === s
                    ? "bg-[#F97316] text-white"
                    : "bg-[#F5F5F5] text-[#3B3B3B] hover:bg-[#FFF4ED] hover:text-[#F97316]"
                }`}
              >
                <span aria-hidden="true">{s}x</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
