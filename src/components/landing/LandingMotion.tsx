"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = "[data-scroll-reveal]";

export function LandingMotion() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    );

    if (!elements.length) return;

    const root = document.documentElement;
    const reveal = (element: HTMLElement) => {
      element.dataset.revealVisible = "true";
    };

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      elements.forEach(reveal);
      return;
    }

    root.classList.add("jaryq-scroll-motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      root.classList.remove("jaryq-scroll-motion-ready");
    };
  }, []);

  return null;
}
