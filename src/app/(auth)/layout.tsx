export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-jaryq-primary-soft via-white to-jaryq-primary-soft flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient orbs for warmth */}
      <span
        aria-hidden="true"
        className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-jaryq-primary/15 rounded-full blur-3xl pointer-events-none animate-[jaryq-ambient-drift_18s_ease-in-out_infinite] motion-reduce:animate-none"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-jaryq-primary-med/25 rounded-full blur-3xl pointer-events-none animate-[jaryq-ambient-drift-alt_24s_ease-in-out_infinite] motion-reduce:animate-none"
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </main>
  );
}
