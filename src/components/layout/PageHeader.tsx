import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  eyebrow?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  eyebrow,
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 lg:mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        {Icon && (
          <span
            aria-hidden="true"
            className="shrink-0 w-12 h-12 rounded-xl bg-jaryq-primary-soft ring-1 ring-jaryq-primary/15 flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
          >
            <Icon className="text-jaryq-primary-strong" size={22} />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-jaryq-text-muted mb-2">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              "font-display text-3xl lg:text-4xl font-black tracking-tight text-jaryq-text-primary leading-[1.1]"
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-jaryq-text-secondary mt-2 text-sm lg:text-base">
              {subtitle}
            </p>
          )}
          {meta && (
            <p className="text-sm text-jaryq-text-muted mt-2 tabular-nums">
              {meta}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </header>
  );
}
