"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ENVIRONMENTS } from "./landing-data";
import { GhostButton, PrimaryButton } from "./LandingPrimitives";

const HeroScene3D = dynamic(() => import("./HeroScene3D").then((m) => m.HeroScene3D), {
  ssr: false,
  loading: () => null,
});

function HeroStaticVisual() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--expera-radius-xl)] border border-expera-border bg-gradient-to-br from-expera-bg-warm via-expera-surface to-[oklch(0.94_0.03_195_/_0.35)] shadow-[0_24px_60px_var(--expera-shadow)]">
      <div className="landing-grid-bg absolute inset-0 opacity-40" aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <svg viewBox="0 0 400 320" className="h-full w-full max-w-md" role="img" aria-label="Illustration of laboratory equipment and learning environments">
          <defs>
            <linearGradient id="flask" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2a9d8f" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#457b9d" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <rect x="48" y="200" width="304" height="8" rx="4" fill="#cbd5e1" />
          <path d="M170 80 L155 200 L215 200 L200 80 Z" fill="url(#flask)" stroke="#0c1a2e" strokeWidth="2" />
          <ellipse cx="185" cy="78" rx="18" ry="6" fill="#e2e8f0" stroke="#0c1a2e" strokeWidth="2" />
          <circle cx="285" cy="130" r="42" fill="#f8fafc" stroke="#0c1a2e" strokeWidth="2" />
          <circle cx="285" cy="130" r="18" fill="#334155" opacity="0.85" />
          <rect x="268" y="168" width="34" height="32" rx="4" fill="#64748b" />
          <text x="72" y="56" fill="#0c1a2e" fontSize="13" fontFamily="system-ui" fontWeight="600">
            Learn
          </text>
          <text x="300" y="56" fill="#0c1a2e" fontSize="13" fontFamily="system-ui" fontWeight="600">
            Lab
          </text>
          <text x="72" y="248" fill="#0c1a2e" fontSize="13" fontFamily="system-ui" fontWeight="600">
            Practice
          </text>
          <text x="288" y="248" fill="#0c1a2e" fontSize="13" fontFamily="system-ui" fontWeight="600">
            Exam
          </text>
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-x-6 bottom-6 flex flex-wrap gap-2">
        {ENVIRONMENTS.map((env) => (
          <span
            key={env.id}
            className="rounded-full bg-expera-surface/90 px-3 py-1 text-xs font-semibold text-expera-navy shadow-sm ring-1 ring-expera-border"
          >
            {env.title}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const [show3d, setShow3d] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timeout = window.setTimeout(() => setShow3d(true), 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <section id="top" className="expera-section pt-28 md:pt-32">
      <div className="expera-container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-expera-primary-deep">Expera — Science is better when you can experience it.</p>
          <h1 className="mt-4 text-[clamp(2.25rem,5.5vw,3.65rem)] font-bold leading-[1.06] tracking-tight text-expera-navy">
            Science isn&apos;t meant to be read alone. It&apos;s meant to be experienced.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-expera-ink-soft">
            Explore scientific concepts, perform virtual experiments and discover how the world works. Expera brings interactive STEM
            learning and virtual laboratories into one accessible platform, designed around the Nigerian curriculum and built for the
            future of education.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton href="#early-access">Join early access</PrimaryButton>
            <GhostButton href="#experience">Explore the experience</GhostButton>
          </div>
        </div>
        <div className="relative">
          <HeroStaticVisual />
          {show3d ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--expera-radius-xl)] opacity-70 mix-blend-multiply">
              <HeroScene3D />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
