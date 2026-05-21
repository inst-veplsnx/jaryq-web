"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, User, Check } from "lucide-react";
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
      <div className="w-full max-w-sm text-center" role="status" aria-live="polite">
        <div
          aria-hidden="true"
          className="relative w-20 h-20 rounded-full bg-green-50 ring-4 ring-green-100 flex items-center justify-center mx-auto mb-4"
          style={{ boxShadow: "0 18px 40px -14px rgba(34,197,94,0.4)" }}
        >
          <Check size={36} strokeWidth={3} className="text-green-600" aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl lg:text-3xl font-black tracking-tight text-jaryq-text-primary mb-2">
          Тіркелдіңіз!
        </h2>
        <p className="text-jaryq-text-secondary">
          Бастапқы бетке бағытталып жатырсыз...
        </p>
      </div>
    );
  }

  const inputBase =
    "w-full px-4 py-3 border border-jaryq-border-light rounded-xl text-jaryq-text-primary placeholder:text-jaryq-text-muted focus:outline-none focus:border-jaryq-primary focus:ring-2 focus:ring-jaryq-primary/40 transition-all duration-150 bg-jaryq-bg-main/60 hover:bg-jaryq-bg-main motion-reduce:transition-none";

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl blur-2xl bg-jaryq-primary/30"
          />
          <Image
            src="/logo.png"
            alt="JARYQ"
            width={80}
            height={80}
            className="relative rounded-2xl"
            priority
            style={{ boxShadow: "var(--shadow-jaryq-glow)" }}
          />
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-black tracking-tight text-jaryq-text-primary">
          Тіркелу
        </h1>
        <p className="text-jaryq-text-secondary text-sm mt-1">
          Тегін есептік жазба жасаңыз
        </p>
      </div>

      {/* Card */}
      <div
        className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-jaryq-border-light"
        style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full name */}
          <div>
            <label
              htmlFor={nameId}
              className="block text-sm font-semibold text-jaryq-text-primary mb-1.5"
            >
              Аты-жөні
            </label>
            <div className="relative">
              <User
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-jaryq-text-muted"
              />
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
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor={emailId}
              className="block text-sm font-semibold text-jaryq-text-primary mb-1.5"
            >
              Email
            </label>
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
              className={inputBase}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor={passwordId}
              className="block text-sm font-semibold text-jaryq-text-primary mb-1.5"
            >
              Пароль
            </label>
            <div className="relative">
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
                className={`${inputBase} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Парольді жасыру" : "Парольді көрсету"}
                aria-pressed={showPassword}
                aria-controls={passwordId}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-jaryq-text-secondary hover:text-jaryq-primary hover:bg-jaryq-primary-soft transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
            <p id={passwordHintId} className="text-xs text-jaryq-text-secondary mt-1">
              Кемінде 6 таңба
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              id={errorId}
              role="alert"
              aria-live="assertive"
              className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password || !fullName}
            aria-busy={loading || undefined}
            className="w-full jaryq-gradient-cta text-white font-bold py-3.5 rounded-xl hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-[transform,box-shadow] duration-(--duration-jaryq-base) ease-jaryq-spring flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
            style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
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

        <p className="text-center text-sm text-jaryq-text-secondary mt-6">
          Есептік жазбаңыз бар ма?{" "}
          <Link
            href="/login"
            className="text-jaryq-primary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded"
          >
            Кіру
          </Link>
        </p>
      </div>
    </div>
  );
}
