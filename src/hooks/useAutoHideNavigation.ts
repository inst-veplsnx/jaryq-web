"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const DEFAULT_IDLE_DELAY_MS = 2400;
const ACTIVITY_THROTTLE_MS = 120;
const MOBILE_VIEWPORT_QUERY = "(max-width: 1023px)";
const EMPTY_NAVIGATION_REFS: Array<RefObject<HTMLElement | null>> = [];
const MOBILE_ACTIVITY_EVENTS = [
  "pointerdown",
  "touchstart",
  "keydown",
  "focusin",
] as const;

interface UseAutoHideNavigationOptions {
  idleDelayMs?: number;
  initialHidden?: boolean;
  mobileViewportQuery?: string;
  navigationRefs?: Array<RefObject<HTMLElement | null>>;
}

export function useAutoHideNavigation({
  idleDelayMs = DEFAULT_IDLE_DELAY_MS,
  initialHidden = false,
  mobileViewportQuery = MOBILE_VIEWPORT_QUERY,
  navigationRefs = EMPTY_NAVIGATION_REFS,
}: UseAutoHideNavigationOptions = {}) {
  const [isNavigationHidden, setIsNavigationHidden] = useState(initialHidden);
  const hideTimerRef = useRef<number | null>(null);
  const hiddenRef = useRef(initialHidden);
  const lastActivityRef = useRef(0);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hasActiveNavigation = useCallback(() => {
    const activeElement = document.activeElement;

    return navigationRefs.some((navigationRef) => {
      const element = navigationRef.current;
      if (!element) return false;

      return (
        (activeElement ? element.contains(activeElement) : false) ||
        element.matches(":hover")
      );
    });
  }, [navigationRefs]);

  const scheduleHide = useCallback(() => {
    clearHideTimer();

    function hideWhenReady() {
      if (hasActiveNavigation()) {
        hideTimerRef.current = window.setTimeout(hideWhenReady, idleDelayMs);
        return;
      }

      hiddenRef.current = true;
      setIsNavigationHidden(true);
    }

    hideTimerRef.current = window.setTimeout(hideWhenReady, idleDelayMs);
  }, [clearHideTimer, hasActiveNavigation, idleDelayMs]);

  const isMobileViewport = useCallback(
    () => window.matchMedia(mobileViewportQuery).matches,
    [mobileViewportQuery]
  );

  const revealNavigation = useCallback(() => {
    const now = window.performance.now();
    if (
      !hiddenRef.current &&
      now - lastActivityRef.current < ACTIVITY_THROTTLE_MS
    ) {
      return;
    }

    lastActivityRef.current = now;
    hiddenRef.current = false;
    setIsNavigationHidden(false);
    scheduleHide();
  }, [scheduleHide]);

  const revealNavigationOnMobileActivity = useCallback(() => {
    if (isMobileViewport()) {
      revealNavigation();
    }
  }, [isMobileViewport, revealNavigation]);

  useEffect(() => {
    scheduleHide();

    const listenerOptions: AddEventListenerOptions = {
      capture: true,
      passive: true,
    };

    MOBILE_ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(
        eventName,
        revealNavigationOnMobileActivity,
        listenerOptions
      );
    });

    return () => {
      clearHideTimer();
      MOBILE_ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(
          eventName,
          revealNavigationOnMobileActivity,
          listenerOptions
        );
      });
    };
  }, [clearHideTimer, revealNavigationOnMobileActivity, scheduleHide]);

  return {
    isNavigationHidden,
    revealNavigation,
    revealNavigationOnMobileActivity,
  };
}
