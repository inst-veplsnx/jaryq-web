"use client";

import { usePathname } from "next/navigation";

interface PageLoadTransitionProps {
  children: React.ReactNode;
}

export function PageLoadTransition({ children }: PageLoadTransitionProps) {
  const pathname = usePathname() ?? "initial";

  return (
    <div key={pathname} className="jaryq-page-load min-h-full w-full">
      {children}
    </div>
  );
}
