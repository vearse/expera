"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExperaLogo } from "./ExperaLogo";
import { BtnPrimary } from "./ui";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#subjects", label: "Subjects" },
  { href: "#branches", label: "Branches" },
  { href: "#teachers", label: "For teachers" },
  { href: "#schools", label: "For schools" },
];

export function VanguardLandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition ${
        scrolled ? "border-outline-variant/30 bg-lab-bg/95 shadow-sm backdrop-blur-md" : "border-transparent bg-lab-bg/80"
      }`}
    >
      <div className="vanguard-container flex h-20 items-center justify-between gap-4">
        <Link href="#top" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 p-1.5">
            <ExperaLogo className="size-full text-primary" />
          </div>
          <span className="font-display text-xl font-bold text-brand-ink">Expera</span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-on-surface-variant hover:text-primary">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden sm:block">
          <BtnPrimary href="#waitlist">Join the waitlist</BtnPrimary>
        </div>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg border border-outline-variant lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 bg-brand-ink transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-brand-ink ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-brand-ink transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {open ? (
        <div className="border-t border-outline-variant/30 px-4 py-4 lg:hidden">
          <nav className="grid gap-2">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3">
            <BtnPrimary href="#waitlist" className="w-full">
              Join the waitlist
            </BtnPrimary>
          </div>
        </div>
      ) : null}
    </header>
  );
}
