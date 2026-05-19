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
        className="w-20 h-20 rounded-full bg-[#FFF4ED] flex items-center justify-center mb-4"
      >
        {icon || <BookOpen className="text-[#F97316]" size={36} />}
      </div>
      <h3 className="text-lg font-semibold text-[#0F0F0F] mb-2">{title}</h3>
      {description && (
        <p className="text-[#5C5C5C] text-sm max-w-xs">{description}</p>
      )}
    </div>
  );
}
