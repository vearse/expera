"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** On small screens the opened menu collapses back to its icon after this long without use. */
const AUTO_CLOSE_MS = 10_000;

export function LabMenu({
  children,
  label = "Laboratory controls",
  className = "",
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let timer = window.setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    const restartTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
      else restartTimer();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      else restartTimer();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? `Close ${label.toLowerCase()}` : `Open ${label.toLowerCase()}`}
        className="grid size-11 place-items-center rounded-xl border border-white/70 bg-white/92 text-slate-800 shadow-lg backdrop-blur transition hover:bg-white sm:hidden"
      >
        <span className="material-symbols-outlined text-[22px] leading-none">{open ? "close" : "tune"}</span>
      </button>

      <div
        className={`${
          open ? "flex" : "hidden"
        } absolute right-0 top-[3.25rem] z-40 max-h-[min(70vh,26rem)] w-60 flex-col gap-1 overflow-y-auto overscroll-contain rounded-xl border border-white/70 bg-white/96 p-2 shadow-2xl backdrop-blur sm:static sm:flex sm:max-h-none sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-1.5 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
        onClick={() => setOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
