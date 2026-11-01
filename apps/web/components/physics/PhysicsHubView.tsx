"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PHYSICS_WAVE1_SCOPES,
  countAvailable,
  type ScopeMode,
  type WaveScopeRow,
} from "@/lib/content/wave1Catalogue";
import { ReviewBadge } from "@/components/ui";
import { XpBar } from "@/components/gamification/XpBar";
import { ProgressMap } from "@/components/gamification/ProgressMap";
import { BtnPrimary, MaterialIcon, StatusChip } from "@/components/vanguard/ui";

const TABS = ["learn", "lab", "practice", "exam"] as const;
type Tab = (typeof TABS)[number];

const TAB_META: Record<Tab, { label: string; icon: string; hint: string; blurb: string }> = {
  learn: {
    label: "Learn",
    icon: "lightbulb",
    hint: `${countAvailable(PHYSICS_WAVE1_SCOPES, "learn")} live · 6 scopes`,
    blurb: "Units, apparatus and accuracy explorers",
  },
  lab: {
    label: "Lab",
    icon: "science",
    hint: `${countAvailable(PHYSICS_WAVE1_SCOPES, "lab")} live · 6 scopes`,
    blurb: "Precision measurement and practical benches",
  },
  practice: {
    label: "Practice",
    icon: "adjust",
    hint: `${countAvailable(PHYSICS_WAVE1_SCOPES, "practice")} live`,
    blurb: "Reading-scale and calculation drills",
  },
  exam: { label: "Exam", icon: "timer", hint: "Coming soon", blurb: "WAEC & NECO practical mocks" },
};

function ScopeCard({ scope, mode }: { scope: WaveScopeRow; mode: ScopeMode }) {
  const copy = mode === "learn" ? scope.learn : mode === "lab" ? scope.lab : scope.practice;
  const href = mode === "learn" ? scope.learnHref : mode === "lab" ? scope.labHref : scope.practiceHref;
  const status = scope.status[mode];
  const body = (
    <article className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Wave {scope.wave}</span>
        <StatusChip status={status === "available" ? "available" : status === "in-development" ? "in-development" : "planned"} />
      </div>
      <h3 className="font-display text-lg font-bold leading-snug text-slate-900">{scope.title}</h3>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600">{copy}</p>
      {href && status === "available" ? <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">Open <MaterialIcon name="arrow_forward" className="text-base" /></span> : null}
    </article>
  );
  return href && status === "available" ? <Link href={href} className="block h-full">{body}</Link> : body;
}

export function PhysicsHubView({ measurementReview, pendulumReview }: { measurementReview: string; pendulumReview: string }) {
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab: Tab = TABS.includes(requested as Tab) ? (requested as Tab) : "lab";
  const meta = TAB_META[tab];
  const measurement = PHYSICS_WAVE1_SCOPES[0];
  const pendulum = PHYSICS_WAVE1_SCOPES.find((scope) => scope.id === "pendulum-oscillations")!;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 pt-6 md:px-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-h-[300px] grid-cols-1 lg:grid-cols-12">
          <div className="relative flex flex-col justify-between overflow-hidden p-6 lg:col-span-7 lg:p-9">
            <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-sky-100 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-amber-100/70 blur-3xl" />
            <div className="relative">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                  <MaterialIcon name="motion_sensor_active" className="text-sm" />
                  Physics · Wave 1 practical
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">SS1 to SS3 · NERDC &amp; WAEC aligned</span>
              </div>
              <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Measure it. Test it. <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-amber-500 bg-clip-text text-transparent">Prove it.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                Master Vernier calipers, micrometer screw gauges, parallax and experimental error analysis — then time a real pendulum and determine g from your own graph.
              </p>
            </div>
            <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
              <BtnPrimary href="/physics/lab/measurement" className="bg-sky-700 text-white shadow-sky-200 hover:bg-sky-800">
                Open measurement lab
                <MaterialIcon name="arrow_forward" className="text-base" />
              </BtnPrimary>
              <Link href="/physics/lab/pendulum" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-sky-400 hover:text-sky-800">
                Open pendulum lab
                <MaterialIcon name="arrow_forward" className="text-base" />
              </Link>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="size-2 rounded-full bg-emerald-500" />
                Interactive 3D + 2D fallback
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center border-t border-slate-800 bg-slate-950 p-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="relative w-full max-w-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">Precision console</span>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">Zero-error check</span>
              </div>
              <div className="rounded-2xl border border-sky-400/20 bg-slate-900/80 p-5 shadow-2xl backdrop-blur">
                <p className="text-xs font-medium text-slate-400">Micrometer screw gauge</p>
                <div className="mt-2 flex items-end gap-2 font-mono text-4xl font-bold text-sky-100">
                  5.76 <span className="pb-1 text-base font-medium text-slate-400">mm</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2">
                    <span className="block text-slate-400">Sleeve</span>
                    <strong className="text-sm text-slate-100">5.5 mm</strong>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2">
                    <span className="block text-slate-400">Thimble</span>
                    <strong className="text-sm text-slate-100">28</strong>
                  </div>
                  <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-2">
                    <span className="block text-amber-200/70">Zero error</span>
                    <strong className="text-sm text-amber-200">+0.02</strong>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-400/10 px-3 py-2 text-[11px] text-emerald-200">
                  <MaterialIcon name="check_circle" className="text-sm" />
                  Corrected: observed − zero error
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-slate-500">Simulation preview · every reading comes from apparatus state</p>
            </div>
          </div>
        </div>
      </section>

      <XpBar />

      <div className="flex flex-col gap-2">
        <div className="inline-flex flex-wrap gap-1 self-start rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
          {TABS.map((entry) => {
            const active = tab === entry;
            const item = TAB_META[entry];
            return (
              <Link
                key={entry}
                href={`/physics?tab=${entry}`}
                className={`flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-slate-950 text-white shadow" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <MaterialIcon name={item.icon} className={`text-lg ${active ? "text-sky-300" : ""}`} />
                {item.label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${active ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-500"}`}>{item.hint}</span>
              </Link>
            );
          })}
        </div>
        <p className="pl-2 text-sm text-slate-500">Current view: <span className="font-semibold text-slate-800">{meta.blurb}</span></p>
      </div>

      {tab === "lab" ? (
        <Link href="/physics/lab/measurement" className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-400 hover:shadow-md">
          <div className="grid lg:grid-cols-12">
            <div className="relative flex min-h-52 items-center justify-center overflow-hidden bg-slate-950 lg:col-span-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.24),transparent_60%)]" />
              <div className="relative text-center">
                <MaterialIcon name="straighten" className="text-6xl text-sky-300" />
                <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Station 01</span>
              </div>
              <span className="absolute right-3 top-3"><ReviewBadge status={measurementReview} /></span>
            </div>
            <div className="space-y-4 p-6 lg:col-span-7 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">Currently live</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-slate-950">Measurement and errors laboratory</h2>
                </div>
                <StatusChip status="available" />
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{measurement.lab}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Vernier + micrometer", "Worn-zero metre rule", "Parallax alignment", "Solid + liquid density"].map((item) => (
                  <span key={item} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                    <span className="size-1.5 rounded-full bg-sky-500" />
                    {item}
                  </span>
                ))}
              </div>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-700 px-5 text-sm font-bold text-white">
                Enter the laboratory
                <MaterialIcon name="arrow_forward" className="text-base" />
              </span>
            </div>
          </div>
        </Link>
      ) : null}

      {tab === "lab" ? (
        <Link href="/physics/lab/pendulum" className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-400 hover:shadow-md">
          <div className="grid lg:grid-cols-12">
            <div className="relative flex min-h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 lg:col-span-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(56,189,248,0.22),transparent_58%)]" />
              <div className="relative text-center">
                <MaterialIcon name="timer" className="text-5xl text-sky-300" />
                <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Station 02</span>
              </div>
              <span className="absolute right-3 top-3"><ReviewBadge status={pendulumReview} /></span>
            </div>
            <div className="space-y-3 p-5 lg:col-span-8 lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">Now live</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-slate-950">Simple pendulum and oscillations</h2>
                </div>
                <StatusChip status="available" />
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{pendulum.lab}. Measure pivot to bob centre, time repeated centre crossings, then use the gradient of T² against L to find g without relying on the small-angle shortcut for the motion.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Measure effective length", "10 or 20 oscillation timing", "Live angle–time graph", "T² against L best fit"].map((item) => (
                  <span key={item} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                    <span className="size-1.5 rounded-full bg-sky-500" />
                    {item}
                  </span>
                ))}
              </div>
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sky-700 px-4 text-xs font-bold text-white">
                Enter the pendulum laboratory
                <MaterialIcon name="arrow_forward" className="text-base" />
              </span>
            </div>
          </div>
        </Link>
      ) : null}

      {tab === "lab" ? (
        <Link href="/physics/lab/apparatus" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-400 hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <MaterialIcon name="science" className="text-2xl" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">Apparatus guide</p>
              <h2 className="font-display text-lg font-bold text-slate-950">Know every instrument before you measure</h2>
              <p className="text-xs text-slate-500">Vernier calipers, micrometer, metre rule, stopwatch, density set, parallax scale and more.</p>
            </div>
          </div>
          <span className="inline-flex min-h-10 items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-4 text-xs font-bold text-sky-800">
            Open apparatus lab
            <MaterialIcon name="arrow_forward" className="text-base" />
          </span>
        </Link>
      ) : null}

      {tab === "learn" || tab === "practice" ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHYSICS_WAVE1_SCOPES.map((scope) => <ScopeCard key={`${tab}-${scope.id}`} scope={scope} mode={tab} />)}
        </section>
      ) : null}

      {tab === "lab" ? (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PHYSICS_WAVE1_SCOPES.slice(1).map((scope) => <ScopeCard key={`lab-${scope.id}`} scope={scope} mode="lab" />)}
        </section>
      ) : null}

      {tab === "exam" ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <MaterialIcon name="timer" className="text-4xl text-slate-400" />
          <h2 className="mt-3 font-display text-xl font-bold text-slate-900">Exam preparation</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">Timed WAEC and NECO measurement mocks are being prepared. Use the measurement laboratory and practice scopes while they ship.</p>
        </section>
      ) : null}

      <ProgressMap />
    </div>
  );
}
