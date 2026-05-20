import { BookOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center px-4"
      role="status"
    >
      <div
        aria-hidden="true"
        className="relative w-20 h-20 rounded-full bg-gradient-to-br from-jaryq-primary-soft to-jaryq-primary-med/30 flex items-center justify-center mb-4 shadow-sm ring-1 ring-jaryq-primary/10"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-jaryq-primary/10 blur-xl"
        />
        <span className="relative">
          {icon || <BookOpen className="text-jaryq-primary" size={36} />}
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
    </div>
  );
}
