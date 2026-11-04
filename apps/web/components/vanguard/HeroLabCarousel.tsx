"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { MaterialIcon } from "./ui";

type Slide = {
  id: string;
  label: string;
  href: string;
  caption: string;
  render: () => ReactNode;
};

function IllustrationFrame({ children, tone = "emerald" }: { children: ReactNode; tone?: "emerald" | "amber" | "blue" }) {
  const bg =
    tone === "amber"
      ? "from-amber-50 via-white to-orange-50/80"
      : tone === "blue"
        ? "from-blue-50 via-white to-indigo-50/80"
        : "from-emerald-50 via-white to-teal-50/80";
  return (
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${bg}`}>
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#006c49_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden />
      <div className="relative flex h-full min-h-[17rem] items-center justify-center p-6 sm:min-h-[20rem] sm:p-8">{children}</div>
    </div>
  );
}

function TitrationIllustration() {
  return (
    <IllustrationFrame tone="emerald">
      <div className="relative w-full max-w-md">
        <div className="absolute -left-2 top-0 rounded-xl border border-[#d7e3dc] bg-white px-3 py-2 text-xs shadow-md">
          <span className="font-bold text-[#006c49]">Meniscus</span>
          <span className="ml-2 font-mono font-bold text-[#1a1464]">24.85 cm³</span>
        </div>
        <div className="mx-auto flex w-fit flex-col items-center pt-8">
          <div className="relative flex h-48 w-6 flex-col justify-end overflow-hidden rounded-t-lg border-2 border-slate-400/80 bg-white/90 shadow-inner">
            <div className="relative h-32 w-full bg-gradient-to-t from-emerald-500/50 to-emerald-300/30">
              <div className="meniscus-glow absolute top-[48%] h-1 w-full bg-[#4edea3] shadow-[0_0_10px_#4edea3]" />
            </div>
            {[20, 22, 24, 26].map((n) => (
              <span key={n} className="absolute right-0.5 font-mono text-[8px] text-slate-500" style={{ bottom: `${((n - 18) / 10) * 22}%` }}>
                {n}
              </span>
            ))}
          </div>
          <div className="my-1 h-2.5 w-10 rounded-sm bg-slate-400 shadow" />
          <div className="relative flex h-28 w-32 items-end justify-center">
            <div className="flex h-24 w-28 items-end justify-center overflow-hidden rounded-b-[2rem] border-2 border-slate-300/80 bg-white/50 shadow-lg">
              <div className="h-12 w-full rounded-b-[1.5rem] bg-gradient-to-t from-amber-400 to-amber-200/80" />
            </div>
            <div className="absolute -bottom-1 h-2 w-36 rounded bg-slate-200 shadow" />
          </div>
        </div>
        <div className="absolute bottom-2 right-0 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold text-[#006c49] shadow-sm">
          Concordant ±0.05 cm³
        </div>
      </div>
    </IllustrationFrame>
  );
}

function MicroscopyIllustration() {
  return (
    <IllustrationFrame tone="amber">
      <div className="relative flex max-w-md flex-col items-center gap-4 sm:flex-row sm:gap-8">
        <div className="relative">
          <div className="h-36 w-44 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-800 shadow-xl">
            <div className="absolute left-1/2 top-3 h-14 w-20 -translate-x-1/2 rounded-lg bg-slate-700" />
            <div className="absolute left-1/2 top-[4.5rem] h-16 w-3 -translate-x-1/2 bg-slate-500" />
            <div className="absolute bottom-2 left-1/2 h-10 w-32 -translate-x-1/2 rounded-lg bg-slate-700" />
          </div>
        </div>
        <div className="relative size-36 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#1a3d2e] shadow-lg ring-2 ring-amber-200">
          <div className="absolute inset-0 opacity-80 [background-image:repeating-linear-gradient(45deg,#4ade80_0_1px,transparent_1px_8px),repeating-linear-gradient(-45deg,#22c55e_0_1px,transparent_1px_12px)]" />
          <div className="absolute left-1/4 top-1/3 size-8 rounded-full border border-emerald-300/60 bg-emerald-400/20" />
          <div className="absolute right-1/4 top-1/2 size-5 rounded-full bg-emerald-300/30" />
        </div>
        <p className="absolute bottom-0 left-0 rounded-lg bg-white px-2 py-1 text-[10px] font-medium text-amber-900 shadow sm:relative sm:bottom-auto">
          Onion epidermis · 400×
        </p>
      </div>
    </IllustrationFrame>
  );
}

function ApparatusIllustration() {
  return (
    <IllustrationFrame tone="blue">
      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-lg">
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="grid size-8 place-items-center rounded-full bg-[#2f5bff] text-white">
              <MaterialIcon name="school" className="text-base" />
            </span>
            <div>
              <p className="text-xs font-bold text-[#1a1464]">Guided · Ms. Ada</p>
              <p className="text-[10px] text-slate-500">Apparatus identification</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Burette", "Pipette", "Flask"].map((label, i) => (
              <div
                key={label}
                className={`flex flex-col items-center rounded-lg border p-2 ${i === 0 ? "border-[#2f5bff] bg-blue-50 ring-2 ring-[#2f5bff]/30" : "border-slate-200 bg-slate-50"}`}
              >
                <div className={`mb-1 h-10 w-3 rounded-sm ${i === 0 ? "bg-emerald-400" : "bg-slate-300"}`} />
                <span className="text-[9px] font-semibold text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-1 top-0 rounded-xl bg-[#1a1464] px-3 py-2 text-[10px] text-white shadow-lg">
          Tap apparatus for a hint
        </div>
      </div>
    </IllustrationFrame>
  );
}

const SLIDES: Slide[] = [
  {
    id: "titration",
    label: "Chemistry · Titration",
    href: "/chemistry/lab/titration",
    caption: "Interactive volumetric analysis with live meniscus feedback.",
    render: () => <TitrationIllustration />,
  },
  {
    id: "microscopy",
    label: "Biology · Microscopy",
    href: "/biology/lab/microscopy",
    caption: "Virtual bench microscopy aligned to WAEC specimen work.",
    render: () => <MicroscopyIllustration />,
  },
  {
    id: "apparatus",
    label: "Guided · Apparatus",
    href: "/chemistry/lab/apparatus/run?mode=guided",
    caption: "Teacher-led steps through NERDC practical skills.",
    render: () => <ApparatusIllustration />,
  },
];

export function HeroLabCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[index]!;

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => go(index + 1), 5500);
    return () => window.clearInterval(id);
  }, [go, index, paused]);

  return (
    <div
      className="relative lg:col-span-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl border border-[#d7e3dc] bg-white shadow-[0_16px_40px_-24px_rgba(13,27,23,0.45)]">
        <div className="flex items-center justify-between border-b border-[#e4eee9] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="ml-1 hidden text-xs font-semibold text-[#3d4a7a] sm:inline">Expera lab preview</span>
          </div>
          <span className="rounded-full bg-[#e7f3ef] px-2.5 py-0.5 text-[10px] font-bold text-[#006c49]">Live simulation</span>
        </div>
        <div className="relative aspect-[16/10]">
          {slide.render()}
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-lg border border-[#e4eee9] bg-white/95 px-3 py-2 text-xs font-medium text-[#1a1464] shadow-sm">
            {slide.caption}
          </p>
          <button
            type="button"
            className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#d7e3dc] bg-white text-[#1a1464] shadow-sm"
            aria-label="Previous lab preview"
            onClick={() => go(index - 1)}
          >
            <MaterialIcon name="chevron_left" />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-[#d7e3dc] bg-white text-[#1a1464] shadow-sm"
            aria-label="Next lab preview"
            onClick={() => go(index + 1)}
          >
            <MaterialIcon name="chevron_right" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#e4eee9] px-4 py-3">
          <div className="flex items-center gap-2" role="tablist" aria-label="Lab preview slides">
            {SLIDES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${item.label}`}
                className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-[#006c49]" : "w-2 bg-[#c5d5cc]"}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <Link href={slide.href} className="inline-flex items-center gap-1 text-sm font-bold text-[#006c49] hover:underline">
            Open this lab
            <MaterialIcon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </div>
    </div>
  );
}
