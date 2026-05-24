"use client";

import { useMemo, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PlayerBar } from "@/components/player/PlayerBar";
import { MainContent } from "@/components/layout/MainContent";
import { useAutoHideNavigation } from "@/hooks/useAutoHideNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const navigationRefs = useMemo(
    () => [sidebarRef, mobileNavRef],
    [mobileNavRef, sidebarRef]
  );
  const {
    isNavigationHidden,
    revealNavigation,
    revealNavigationOnMobileActivity,
  } = useAutoHideNavigation({ initialHidden: true, navigationRefs });

  return (
    <div className="flex h-screen overflow-hidden">
      <a href="#main-content" className="jaryq-skip-link">
        Мазмұнға өту
      </a>

      <Sidebar
        ref={sidebarRef}
        isCollapsed={isNavigationHidden}
        onActivity={revealNavigation}
      />

      <MainContent
        isNavigationCollapsed={isNavigationHidden}
        onActivity={revealNavigationOnMobileActivity}
      >
        {children}
      </MainContent>

      <MobileNav
        ref={mobileNavRef}
        isHidden={isNavigationHidden}
        onActivity={revealNavigation}
      />

      <PlayerBar isNavigationCollapsed={isNavigationHidden} />
    </div>
  );
}
