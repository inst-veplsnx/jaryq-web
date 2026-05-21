export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen jaryq-gradient-warm flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient orbs */}
      <span
        aria-hidden="true"
        className="jaryq-blob-drift absolute top-[-10%] left-[-10%] w-80 h-80 bg-jaryq-primary/15 rounded-full blur-3xl pointer-events-none"
      />
      <span
        aria-hidden="true"
        className="jaryq-blob-drift-alt absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-jaryq-primary-med/25 rounded-full blur-3xl pointer-events-none"
      />
      {/* Subtle grain */}
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(15,15,15,0.6) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </main>
  );
}
