"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, User } from "lucide-react";
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
          className="w-20 h-20 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-2xl font-black text-[#0F0F0F] mb-2">
          Тіркелдіңіз!
        </h2>
        <p className="text-[#5C5C5C]">Бастапқы бетке бағытталып жатырсыз...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo.png"
          alt="JARYQ"
          width={80}
          height={80}
          className="rounded-2xl mb-4"
          priority
        />
        <h1 className="text-2xl font-black text-[#0F0F0F]">Тіркелу</h1>
        <p className="text-[#5C5C5C] text-sm mt-1">Тегін есептік жазба жасаңыз</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#E8E8E8]">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full name */}
          <div>
            <label
              htmlFor={nameId}
              className="block text-sm font-semibold text-[#0F0F0F] mb-1.5"
            >
              Аты-жөні
            </label>
            <div className="relative">
              <User
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
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
                className="w-full pl-9 pr-4 py-3 border border-[#E8E8E8] rounded-xl text-[#0F0F0F] placeholder:text-[#888888] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/40 transition-all bg-[#FAFAFA]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor={emailId}
              className="block text-sm font-semibold text-[#0F0F0F] mb-1.5"
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
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-[#0F0F0F] placeholder:text-[#888888] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/40 transition-all bg-[#FAFAFA]"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor={passwordId}
              className="block text-sm font-semibold text-[#0F0F0F] mb-1.5"
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
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-[#0F0F0F] placeholder:text-[#888888] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/40 transition-all bg-[#FAFAFA] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Парольді жасыру" : "Парольді көрсету"}
                aria-pressed={showPassword}
                aria-controls={passwordId}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-[#5C5C5C] hover:text-[#F97316] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
            <p id={passwordHintId} className="text-xs text-[#5C5C5C] mt-1">
              Кемінде 6 таңба
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              id={errorId}
              role="alert"
              aria-live="assertive"
              className="bg-[#FEF2F2] text-[#DC2626] text-sm px-4 py-3 rounded-xl border border-[#FECACA]"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password || !fullName}
            aria-busy={loading || undefined}
            className="w-full bg-[#F97316] text-white font-bold py-3.5 rounded-xl hover:bg-[#EA580C] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                <span>Тіркелу...</span>
              </>
            ) : (
              "Тіркелу"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#5C5C5C] mt-6">
          Есептік жазбаңыз бар ма?{" "}
          <Link
            href="/login"
            className="text-[#F97316] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded"
          >
            Кіру
          </Link>
        </p>
      </div>
    </div>
  );
}
