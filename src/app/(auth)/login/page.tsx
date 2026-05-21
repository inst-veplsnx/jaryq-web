"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
          JARYQ-ке кіру
        </h1>
        <p className="text-jaryq-text-secondary text-sm mt-1">
          Аудиокітаптар платформасы
        </p>
      </div>

      {/* Card */}
      <div
        className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-jaryq-border-light"
        style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              className="w-full px-4 py-3 border border-jaryq-border-light rounded-xl text-jaryq-text-primary placeholder:text-jaryq-text-muted focus:outline-none focus:border-jaryq-primary focus:ring-2 focus:ring-jaryq-primary/40 transition-all duration-150 bg-jaryq-bg-main/60 hover:bg-jaryq-bg-main motion-reduce:transition-none"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                aria-required="true"
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? errorId : undefined}
                className="w-full px-4 py-3 border border-jaryq-border-light rounded-xl text-jaryq-text-primary placeholder:text-jaryq-text-muted focus:outline-none focus:border-jaryq-primary focus:ring-2 focus:ring-jaryq-primary/40 transition-all duration-150 bg-jaryq-bg-main/60 hover:bg-jaryq-bg-main pr-12 motion-reduce:transition-none"
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
            disabled={loading || !email || !password}
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
                <span>Кіру...</span>
              </>
            ) : (
              "Кіру"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-jaryq-text-secondary mt-6">
          Есептік жазбаңыз жоқ па?{" "}
          <Link
            href="/register"
            className="text-jaryq-primary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded"
          >
            Тіркелу
          </Link>
        </p>
      </div>
    </div>
  );
}
