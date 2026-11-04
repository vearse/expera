"use client";

import { useEffect, useState } from "react";
import { EarlyAccessForm } from "@/components/landing/EarlyAccessForm";
import { MaterialIcon } from "./ui";

export function EarlyAccessModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    const onHash = () => {
      if (window.location.hash === "#waitlist") show();
    };
    window.addEventListener("expera-early-access", show);
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => {
      window.removeEventListener("expera-early-access", show);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-[#0b132b]/60" aria-label="Close early access" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="early-access-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-6 text-on-surface shadow-2xl sm:p-8"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Early access cohort</p>
            <h2 id="early-access-title" className="mt-1 font-display text-2xl font-bold text-[#1a1464]">
              Join the waitlist
            </h2>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-outline-variant text-on-surface"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        <EarlyAccessForm />
      </div>
    </div>
  );
}
