"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "./ui";

/** Shown after the user scrolls past the featured preview section (`#features`). */
export function ScrollToTopFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("features");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setVisible(scrolledPast);
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const top = document.getElementById("top");
        if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="fixed bottom-6 right-6 z-[60] grid size-12 place-items-center rounded-full border border-outline-variant/40 bg-white text-primary shadow-[0_12px_32px_-8px_rgba(11,19,43,0.35)] transition hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label="Scroll back to top"
    >
      <MaterialIcon name="keyboard_arrow_up" className="text-2xl" />
    </button>
  );
}
