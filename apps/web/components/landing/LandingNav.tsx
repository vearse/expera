"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS } from "./landing-data";
import { GhostButton, PrimaryButton } from "./LandingPrimitives";

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border] ${
        scrolled ? "border-b border-expera-border/80 bg-expera-bg/85 shadow-sm backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="expera-container flex items-center gap-4 py-3">
        <a href="#top" className="text-xl font-bold tracking-tight text-expera-primary-deep">
          Expera
        </a>
        <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-expera-navy-muted hover:text-expera-navy">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <PrimaryButton href="#early-access">Join early access</PrimaryButton>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-expera-border bg-expera-surface md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 bg-expera-navy transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-expera-navy transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-expera-navy transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {open ? (
        <div id="mobile-nav" className="border-t border-expera-border bg-expera-bg px-4 py-4 md:hidden">
          <nav className="grid gap-2" aria-label="Mobile primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-expera-navy"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid gap-2">
            <PrimaryButton href="#early-access" className="w-full">
              Join early access
            </PrimaryButton>
            <GhostButton href="#experience" className="w-full">
              Explore the experience
            </GhostButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
