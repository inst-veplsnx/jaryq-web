import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  variant?: "display" | "eyebrow";
  id?: string;
  className?: string;
  href?: string;
  hrefLabel?: string;
}

export function SectionTitle({
  children,
  variant = "display",
  id,
  className,
  href,
  hrefLabel = "Барлығы",
}: SectionTitleProps) {
  const heading =
    variant === "display" ? (
      <h2
        id={id}
        className="font-display text-xl lg:text-2xl font-black tracking-tight text-jaryq-text-primary"
      >
        {children}
      </h2>
    ) : (
      <h2
        id={id}
        className="text-xs font-semibold text-jaryq-text-muted uppercase tracking-widest"
      >
        {children}
      </h2>
    );

  if (!href) {
    return <div className={cn("mb-5", className)}>{heading}</div>;
  }

  return (
    <div
      className={cn("flex items-center justify-between gap-4 mb-5", className)}
    >
      {heading}
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-sm font-semibold text-jaryq-primary hover:text-jaryq-primary-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded motion-reduce:transition-none"
      >
        {hrefLabel}
        <ArrowRight
          size={14}
          aria-hidden="true"
          className="transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </Link>
    </div>
  );
}
