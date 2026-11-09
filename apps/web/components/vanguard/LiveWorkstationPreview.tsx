"use client";

import Link from "next/link";
import { useState } from "react";
import { MaterialIcon } from "./ui";

const TABS = [
  { id: "titration", label: "Acid-base titration", href: "/chemistry/lab/titration", icon: "science" },
  { id: "apparatus", label: "Apparatus storeroom", href: "/chemistry/lab/apparatus", icon: "home_storage" },
  { id: "periodic", label: "Periodic table learn", href: "/chemistry/learn/periodic-table", icon: "grid_view" },
  { id: "microscopy", label: "Microscopy lab", href: "/biology/lab/microscopy", icon: "biotech" },
] as const;

export function LiveWorkstationPreview() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("titration");
  const current = TABS.find((t) => t.id === active)!;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold sm:text-sm ${
              active === tab.id
                ? "bg-brand-ink text-white shadow-md"
                : "border border-brand-mint bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MaterialIcon name={tab.icon} className={`text-sm ${active === tab.id ? "text-[#7eb6ff]" : ""}`} />
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#0b1613] shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 bg-[#07100e] px-6 py-3.5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 font-mono text-xs text-emerald-400">
              <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
              SENSOR_FEED: PREVIEW
            </span>
            <span className="hidden text-emerald-500/40 sm:inline">|</span>
            <span className="hidden font-mono text-xs text-gray-400 sm:inline">{current.label}</span>
          </div>
          <Link href={current.href} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-brand-ink hover:bg-emerald-600">
            Open in app
          </Link>
        </div>
        <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-12">
          <div className="relative flex flex-col justify-between border-b border-emerald-500/20 p-6 lg:col-span-8 lg:border-b-0 lg:border-r lg:p-10">
            <div className="lab-grid-dark absolute inset-0 opacity-40" />
            <div className="relative flex h-72 items-center justify-center sm:h-80">
              <svg className="max-h-80 w-full drop-shadow-xl" viewBox="0 0 600 360" aria-hidden>
                <rect fill="#1b322a" height="14" rx="4" stroke="#2dd4bf" strokeWidth="1.5" width="240" x="180" y="320" />
                <line stroke="#4ade80" strokeLinecap="round" strokeWidth="4" x1="240" x2="240" y1="320" y2="40" />
                <rect fill="#2dd4bf" height="8" opacity="0.8" rx="2" width="70" x="238" y="90" />
                <rect fill="rgba(45, 212, 191, 0.08)" height="200" rx="3" stroke="#34d399" strokeWidth="2" width="24" x="300" y="40" />
                <rect fill="rgba(16, 185, 129, 0.45)" height="128" width="20" x="302" y="110" />
                <path d="M298 274 L326 274 L350 325 L274 325 Z" fill="rgba(255, 255, 255, 0.05)" stroke="#34d399" strokeLinejoin="round" strokeWidth="2" />
                <polygon fill="rgba(236, 72, 153, 0.45)" points="280,323 344,323 336,306 288,306" />
              </svg>
              <div className="absolute bottom-4 right-4 rounded-xl border border-emerald-500/40 bg-[#11241f]/90 p-3 font-mono text-xs backdrop-blur-md">
                <div className="mb-1 font-bold text-emerald-400">LIVE ROUTE</div>
                <div className="text-gray-300">{current.href}</div>
              </div>
            </div>
            <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-emerald-500/20 pt-4">
              <Link href={current.href} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-brand-ink">
                <MaterialIcon name="play_arrow" className="text-sm" />
                Launch module
              </Link>
              <span className="font-mono text-xs text-emerald-400/80">2D schematic preview · 3D in app</span>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6 bg-[#091411] p-6 lg:col-span-4">
            <div>
              <div className="mb-5 flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-300">Reaction telemetry</span>
                <span className="rounded border border-emerald-500/30 bg-emerald-950 px-2 py-0.5 font-mono text-[11px] text-emerald-400">Preview UI</span>
              </div>
              {[
                { label: "Meniscus reading", value: "Eye level guidance", width: "100%" },
                { label: "Titre concordance", value: "Practice in Lab tab", width: "82%" },
                { label: "Solution temp", value: "Room temperature model", width: "48%" },
              ].map((g) => (
                <div key={g.label} className="mb-5">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-gray-300">{g.label}</span>
                    <span className="font-mono font-bold text-emerald-400">{g.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/60 p-0.5">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: g.width }} />
                  </div>
                </div>
              ))}
            </div>
            <Link href={current.href} className="w-full rounded-xl bg-emerald-500 py-3 text-center text-xs font-bold uppercase tracking-wider text-brand-ink shadow-lg shadow-emerald-500/20 hover:bg-emerald-600">
              Open {current.label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
