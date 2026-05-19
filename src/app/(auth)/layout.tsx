export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF4ED] via-white to-[#FFF4ED] flex flex-col items-center justify-center px-4 py-12">
      {children}
    </main>
  );
}
