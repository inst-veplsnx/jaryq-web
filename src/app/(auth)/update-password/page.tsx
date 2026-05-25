"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Check } from "lucide-react";
import {
  AUTH_FIELD_ICON_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_MESSAGE_CLASS,
  AUTH_PASSWORD_TOGGLE_CLASS,
  AUTH_SUBMIT_CLASS,
  AuthPanel,
} from "@/components/auth/AuthPanel";
import { useAuthStore } from "@/store/authStore";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuthStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const passwordId = useId();
  const errorId = useId();
  const passwordHintId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password.length < 6) {
      setError("Пароль кемінде 6 таңба болуы тиіс");
      return;
    }
    setLoading(true);
    setError("");
    const result = await updatePassword(password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/home"), 1500);
    }
  };

  if (success) {
    return (
      <div
        data-testid="auth-panel"
        className="mx-auto w-full max-w-[34rem] rounded-2xl border border-white/75 bg-white/95 p-6 text-center backdrop-blur-sm sm:p-9"
        role="status"
        aria-live="polite"
        style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
      >
        <div
          aria-hidden="true"
          className="relative mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-100 sm:size-24"
          style={{ boxShadow: "0 18px 40px -14px rgba(34,197,94,0.4)" }}
        >
          <Check
            size={40}
            strokeWidth={3}
            className="text-green-600"
            aria-hidden="true"
          />
        </div>
        <h1 className="mb-2 font-display text-3xl font-black text-jaryq-text-primary sm:text-4xl">
          Жаңартылды!
        </h1>
        <p className="text-sm leading-6 text-jaryq-text-secondary sm:text-base">
          Жаңа пароль сәтті сақталды. Бастапқы бетке бағытталып жатырсыз...
        </p>
      </div>
    );
  }

  return (
    <AuthPanel
      title="Жаңа парольді енгізу"
      subtitle="Есептік жазбаңыз үшін жаңа пароль орнатыңыз"
      footer={
        <>
          <Link
            href="/login"
            className="rounded font-semibold text-jaryq-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
          >
            Кіру бетіне оралу
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
        <div>
          <label
            htmlFor={passwordId}
            className="mb-2 block text-sm font-semibold text-jaryq-text-primary sm:text-base"
          >
            Жаңа пароль
          </label>
          <div className="relative">
            <Lock aria-hidden="true" className={AUTH_FIELD_ICON_CLASS} />
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Кемінде 6 таңба"
              required
              minLength={6}
              aria-required="true"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={`${passwordHintId}${error ? ` ${errorId}` : ""}`}
              className={`${AUTH_INPUT_CLASS} pl-12 pr-14 sm:pl-[3.25rem] sm:pr-16`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Парольді жасыру" : "Парольді көрсету"}
              aria-pressed={showPassword}
              aria-controls={passwordId}
              className={AUTH_PASSWORD_TOGGLE_CLASS}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>
          <p id={passwordHintId} className="mt-2 text-xs text-jaryq-text-secondary sm:text-sm">
            Кемінде 6 таңба
          </p>
        </div>

        {error && (
          <div
            id={errorId}
            role="alert"
            aria-live="assertive"
            className={`${AUTH_MESSAGE_CLASS} border-red-200 bg-red-50 text-red-700`}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          aria-busy={loading || undefined}
          className={AUTH_SUBMIT_CLASS}
          style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
        >
          {loading ? (
            <>
              <Loader2
                size={20}
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span>Жаңартылуда...</span>
            </>
          ) : (
            "Парольді жаңарту"
          )}
        </button>
      </form>
    </AuthPanel>
  );
}
