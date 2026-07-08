import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "muted";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  tone?: Tone;
  action?: React.ReactNode;
}

const toneStyles: Record<
  Tone,
  { bg: string; ring: string; glow: string; iconColor: string }
> = {
  default: {
    bg: "from-jaryq-primary-soft to-jaryq-primary-med/30",
    ring: "ring-jaryq-primary/10",
    glow: "bg-jaryq-primary/10",
    iconColor: "text-jaryq-primary-strong",
  },
  muted: {
    bg: "from-jaryq-ink-soft to-jaryq-ink/10",
    ring: "ring-jaryq-ink/10",
    glow: "bg-jaryq-ink/10",
    iconColor: "text-jaryq-ink",
  },
};

export function EmptyState({
  title,
  description,
  icon,
  tone = "default",
  action,
}: EmptyStateProps) {
  const t = toneStyles[tone];

  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center px-4"
      role="status"
    >
      <div
        aria-hidden="true"
        className={cn(
          "relative w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center mb-5 ring-1",
          t.bg,
          t.ring
        )}
        style={{ boxShadow: "var(--shadow-jaryq-sm)" }}
      >
        <span
          aria-hidden="true"
          className={cn("absolute inset-0 rounded-full blur-xl", t.glow)}
        />
        <span className={cn("relative", t.iconColor)}>
          {icon || <BookOpen size={36} />}
        </span>
      </div>
      <h3 className="text-lg font-bold tracking-tight text-jaryq-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-jaryq-text-secondary text-sm max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
