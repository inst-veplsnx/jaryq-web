import { PageLoadTransition } from "@/components/layout/PageLoadTransition";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-dvh overflow-hidden px-4 py-6 jaryq-gradient-auth sm:px-6 sm:py-8 lg:px-8">
      <div className="relative z-10 w-full">
        <PageLoadTransition>
          <div className="flex min-h-[calc(100dvh-3rem)] w-full items-center justify-center sm:min-h-[calc(100dvh-4rem)]">
            {children}
          </div>
        </PageLoadTransition>
      </div>
    </main>
  );
}
