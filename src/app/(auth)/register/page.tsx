"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, User, Check, Lock, Mail } from "lucide-react";
import {
  AUTH_FIELD_ICON_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_MESSAGE_CLASS,
  AUTH_PASSWORD_TOGGLE_CLASS,
  AUTH_SUBMIT_CLASS,
  AuthPanel,
} from "@/components/auth/AuthPanel";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const passwordHintId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    if (password.length < 6) {
      setError("Пароль кемінде 6 таңба болуы тиіс");
      return;
    }
    setLoading(true);
    setError("");
    const result = await signUp(email, password, fullName);
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
          Тіркелдіңіз!
        </h1>
        <p className="text-sm leading-6 text-jaryq-text-secondary sm:text-base">
          Бастапқы бетке бағытталып жатырсыз...
        </p>
      </div>
    );
  }

  return (
    <AuthPanel
      title="Тіркелу"
      subtitle="Тегін есептік жазба жасаңыз"
      footer={
        <>
          Аккаунтыңыз бар ма?{" "}
          <Link
            href="/login"
            className="rounded font-semibold text-jaryq-primary-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
          >
            Кіру
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
        <div>
          <label
            htmlFor={nameId}
            className="mb-2 block text-sm font-semibold text-jaryq-text-primary sm:text-base"
          >
            Аты-жөніңіз
          </label>
          <div className="relative">
            <User aria-hidden="true" className={AUTH_FIELD_ICON_CLASS} />
            <input
              id={nameId}
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Айгерім Бекова"
              required
              aria-required="true"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`${AUTH_INPUT_CLASS} pl-12 sm:pl-13`}
            />
          </div>
        </div>

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

        <div>
          <label
            htmlFor={passwordId}
            className="mb-2 block text-sm font-semibold text-jaryq-text-primary sm:text-base"
          >
            Пароль
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
              className={`${AUTH_INPUT_CLASS} pl-12 pr-14 sm:pl-13 sm:pr-16`}
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
          disabled={loading || !email || !password || !fullName}
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
              <span>Тіркелу...</span>
            </>
          ) : (
            "Тіркелу"
          )}
        </button>
      </form>
    </AuthPanel>
  );
}
