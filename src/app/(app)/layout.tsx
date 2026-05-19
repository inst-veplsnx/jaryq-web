import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PlayerBar } from "@/components/player/PlayerBar";
import { MainContent } from "@/components/layout/MainContent";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <a href="#main-content" className="jaryq-skip-link">
        Мазмұнға өту
      </a>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area — padding adjusts dynamically when player is active */}
      <MainContent>{children}</MainContent>

      {/* Mobile bottom tabs */}
      <MobileNav />

      {/* Audio player bar */}
      <PlayerBar />
    </div>
  );
}
