"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Check } from "lucide-react";
import {
  AUTH_FIELD_ICON_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_MESSAGE_CLASS,
  AUTH_SUBMIT_CLASS,
  AuthPanel,
} from "@/components/auth/AuthPanel";
import { useAuthStore } from "@/store/authStore";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const emailId = useId();
  const errorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const result = await resetPassword(email);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div
        data-testid="auth-panel"
        className="mx-auto w-full max-w-136 rounded-2xl border border-white/75 bg-white/95 p-6 text-center backdrop-blur-sm sm:p-9"
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
          Сілтеме жіберілді!
        </h1>
        <p className="mb-6 text-sm leading-6 text-jaryq-text-secondary sm:text-base">
          Парольді қалпына келтіру сілтемесі <b>{email}</b> поштасына жіберілді. Поштаңызды тексеріңіз.
        </p>
        <Link
          href="/login"
          className={AUTH_SUBMIT_CLASS}
        >
          Кіру бетіне оралу
        </Link>
      </div>
    );
  }

  return (
    <AuthPanel
      title="Парольді қалпына келтіру"
      subtitle="Электрондық поштаңызды енгізіңіз, біз сізге парольді қалпына келтіруге арналған сілтеме жібереміз"
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
            htmlFor={emailId}
            className="mb-2 block text-sm font-semibold text-jaryq-text-primary sm:text-base"
          >
            Email
          </label>
          <div className="relative">
            <Mail aria-hidden="true" className={AUTH_FIELD_ICON_CLASS} />
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              aria-required="true"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`${AUTH_INPUT_CLASS} pl-12 sm:pl-13`}
            />
          </div>
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
          disabled={loading || !email}
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
              <span>Жіберілуде...</span>
            </>
          ) : (
            "Сілтемені жіберу"
          )}
        </button>
      </form>
    </AuthPanel>
  );
}
