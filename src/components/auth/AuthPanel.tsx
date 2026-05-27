import Image from "next/image";
import type { ReactNode } from "react";

export const AUTH_INPUT_CLASS =
  "min-h-[3.25rem] w-full rounded-2xl border border-jaryq-border-light bg-jaryq-bg-cream/35 px-4 py-3 text-base text-jaryq-text-primary shadow-sm transition-[background-color,border-color,box-shadow] duration-(--duration-jaryq-fast) placeholder:text-jaryq-text-muted hover:border-jaryq-border-warm hover:bg-white focus:border-jaryq-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-jaryq-primary/35 sm:min-h-14 sm:px-5 sm:py-3.5 sm:text-[1.0625rem] motion-reduce:transition-none";

export const AUTH_FIELD_ICON_CLASS =
  "pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-jaryq-text-muted";

export const AUTH_PASSWORD_TOGGLE_CLASS =
  "absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-jaryq-text-secondary transition-[background-color,color,transform] duration-(--duration-jaryq-fast) hover:bg-jaryq-primary-soft hover:text-jaryq-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary sm:size-12 motion-reduce:transition-none";

export const AUTH_SUBMIT_CLASS =
  "flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-bold text-white jaryq-gradient-cta transition-[transform,box-shadow,opacity] duration-(--duration-jaryq-base) ease-jaryq-spring hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 sm:min-h-14 sm:py-3.5 sm:text-[1.0625rem] motion-reduce:transition-none motion-reduce:hover:scale-100";

export const AUTH_MESSAGE_CLASS =
  "rounded-2xl border px-4 py-3 text-sm leading-relaxed sm:px-5 sm:py-4";

interface AuthPanelProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPanel({
  title,
  subtitle,
  children,
  footer,
}: AuthPanelProps) {
  return (
    <section data-testid="auth-panel" className="mx-auto w-full max-w-[34rem]">
      <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
        <div className="relative mb-4 sm:mb-5">
          <span
            aria-hidden="true"
            className="absolute -inset-2 rounded-3xl border border-white/70 bg-white/55"
          />
          <div
            className="relative flex size-20 items-center justify-center rounded-2xl border border-jaryq-border-warm bg-white sm:size-24"
            style={{ boxShadow: "var(--shadow-jaryq-md)" }}
          >
            <Image
              src="/logo.webp"
              alt="JARYQ"
              width={84}
              height={84}
              className="rounded-2xl"
              priority
            />
          </div>
        </div>
        <h1 className="font-display text-3xl font-black leading-tight text-jaryq-text-primary sm:text-5xl">
          {title}
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-jaryq-text-secondary sm:mt-3 sm:text-base">
          {subtitle}
        </p>
      </div>

      <div
        className="relative w-full rounded-2xl border border-white/75 bg-white/95 p-5 backdrop-blur-sm sm:p-8"
        style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
      >
        {children}
        {footer && (
          <div className="mt-6 border-t border-jaryq-border-light pt-5 text-center text-sm leading-6 text-jaryq-text-secondary sm:mt-7 sm:pt-6 sm:text-base">
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}
