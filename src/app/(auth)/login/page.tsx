"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import {
  AUTH_FIELD_ICON_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_MESSAGE_CLASS,
  AUTH_PASSWORD_TOGGLE_CLASS,
  AUTH_SUBMIT_CLASS,
  AuthPanel,
} from "@/components/auth/AuthPanel";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/home");
    }
  };

  return (
    <AuthPanel
      title="JARYQ-ке кіру"
      subtitle="Аудиокітаптар платформасы"
      footer={
        <div className="flex flex-col gap-3">
          <div>
            Аккаунтыңыз жоқ па?{" "}
            <Link
              href="/register"
              className="rounded font-semibold text-jaryq-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
            >
              Тіркелу
            </Link>
          </div>
          <div>
            Парольді ұмыттыңыз ба?{" "}
            <Link
              href="/forgot-password"
              className="rounded font-semibold text-jaryq-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
            >
              Қалпына келтіру
            </Link>
          </div>
        </div>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              aria-required="true"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
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
          disabled={loading || !email || !password}
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
              <span>Кіру...</span>
            </>
          ) : (
            "Кіру"
          )}
        </button>
      </form>
    </AuthPanel>
  );
}
