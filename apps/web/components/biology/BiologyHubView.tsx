"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { z } from "zod";
import { Review as ReviewSchema } from "@/lib/content/schemas";
import {
  BIOLOGY_WAVE1_SCOPES,
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

const learnCount = countAvailable(BIOLOGY_WAVE1_SCOPES, "learn");
const labCount = countAvailable(BIOLOGY_WAVE1_SCOPES, "lab");
const practiceCount = countAvailable(BIOLOGY_WAVE1_SCOPES, "practice");

const TAB_META: Record<Tab, { label: string; icon: string; hint: string; blurb: string }> = {
  learn: { label: "Learn", icon: "lightbulb", hint: `${learnCount} live · 6 scopes`, blurb: "Kingdom and body explorers" },
  lab: { label: "Lab", icon: "biotech", hint: `${labCount} live · 6 scopes`, blurb: "Microscopy and specimen benches" },
  practice: { label: "Practice", icon: "adjust", hint: `${practiceCount} live`, blurb: "Exam-style drills" },
  exam: { label: "Exam", icon: "timer", hint: "Coming soon", blurb: "WAEC & NECO mocks" },
};

function ScopeCard({ scope, mode }: { scope: WaveScopeRow; mode: ScopeMode }) {
  const copy = mode === "learn" ? scope.learn : mode === "lab" ? scope.lab : scope.practice;
  const href = mode === "learn" ? scope.learnHref : mode === "lab" ? scope.labHref : scope.practiceHref;
  const status = scope.status[mode];
  const body = (
    <article className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-5 lab-card-elevation">
      <div className="mb-2 flex justify-between gap-2">
        <span className="text-xs font-bold uppercase text-secondary">Wave {scope.wave}</span>
        <StatusChip status={status === "available" ? "available" : status === "in-development" ? "in-development" : "planned"} />
      </div>
      <h3 className="font-display font-bold">{scope.title}</h3>
      <p className="mt-2 text-sm text-secondary line-clamp-4">{copy}</p>
      {href && status === "available" ? <span className="mt-3 inline-flex text-sm font-semibold text-primary">Open →</span> : null}
    </article>
  );
  if (href && status === "available") {
    return (
      <Link href={href} className="block hover:border-primary/50">
        {body}
      </Link>
    );
  }
  return body;
}

export function BiologyHubView({ specimensReview }: { specimensReview: z.infer<typeof ReviewSchema> }) {
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab: Tab = TABS.includes(requested as Tab) ? (requested as Tab) : "lab";
  const meta = TAB_META[tab];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 pt-6 md:px-8">
      <section className="overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest lab-card-elevation">
        <div className="grid min-h-[220px] grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-between p-6 lg:col-span-7 lg:p-8">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1 text-xs font-semibold text-primary">
                <MaterialIcon name="verified" className="text-sm" />
                SS1 to SS3 · NERDC &amp; WAEC syllabus aligned
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Biology{" "}
                <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Hub</span>
              </h1>
              <p className="mt-1 text-lg text-secondary">Look closer at life — six Wave 1 scopes from cells to human body systems.</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-outline-variant/30 pt-4">
              <StatusChip status="available" />
              <BtnPrimary href="/biology/lab/microscopy">
                Continue: cells and microscopy
                <MaterialIcon name="biotech" className="text-base" />
              </BtnPrimary>
            </div>
          </div>
          <div className="relative flex items-center justify-center border-t border-outline-variant/30 bg-inverse-surface p-6 lg:col-span-5 lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] opacity-15 [background-size:16px_16px]" />
            <div className="relative z-10 w-full max-w-sm rounded-xl border border-outline/40 bg-inverse-surface/80 p-4 text-inverse-on-surface backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-outline/40 pb-2">
                <span className="text-xs font-semibold text-primary-fixed">Active bench: microscopy</span>
                <span className="rounded border border-primary-fixed/30 px-2 py-0.5 text-[10px]">Compound microscope</span>
              </div>
              <p className="mt-3 text-sm text-secondary-fixed-dim">Onion epidermal lattice · magnification and labelling</p>
            </div>
          </div>
        </div>
      </section>

      <XpBar />

      <div className="space-y-2">
        <div className="inline-flex flex-wrap gap-1 rounded-full border border-outline-variant/40 bg-surface-container-high/60 p-1.5 active-dock-elevation">
          {TABS.map((t) => {
            const active = tab === t;
            const m = TAB_META[t];
            return (
              <Link
                key={t}
                href={`/biology?tab=${t}`}
                className={`flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-on-surface text-surface-container-lowest shadow-md" : "text-secondary hover:text-on-surface"
                }`}
              >
                <MaterialIcon name={m.icon} className={`text-lg ${active ? "text-primary-fixed" : ""}`} />
                {m.label}
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase">{m.hint}</span>
              </Link>
            );
          })}
        </div>
        <p className="pl-2 text-sm text-secondary">
          Current view: <span className="font-semibold text-on-surface">{meta.blurb}</span>
        </p>
      </div>

      {tab === "lab" && (
        <Link href="/biology/lab/microscopy" className="block overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest lab-card-elevation hover:border-primary/50">
          <div className="grid lg:grid-cols-12">
            <div className="relative flex h-48 items-center justify-center bg-inverse-surface lg:col-span-5">
              <MaterialIcon name="biotech" className="text-6xl text-primary-fixed" />
              <span className="absolute right-3 top-3">
                <ReviewBadge status={specimensReview} />
              </span>
            </div>
            <div className="space-y-3 p-6 lg:col-span-7">
              <h2 className="font-display text-2xl font-bold">Cells and microscopy</h2>
              <p className="text-sm text-secondary">{BIOLOGY_WAVE1_SCOPES[0].lab}</p>
              <span className="inline-flex rounded-full bg-primary-container px-4 py-2 text-xs font-bold text-on-primary-container">Resume lab</span>
            </div>
          </div>
        </Link>
      )}

      {tab === "lab" && (
        <Link href="/biology/lab/apparatus" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-5 lab-card-elevation hover:border-primary/50">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary-container text-primary">
              <MaterialIcon name="science" className="text-2xl" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Apparatus guide</p>
              <h2 className="font-display text-lg font-bold">Know the microscope bench before you begin</h2>
              <p className="text-xs text-secondary">Compound microscope, slides, coverslips, forceps, iodine stain and specimen jars.</p>
            </div>
          </div>
          <span className="inline-flex min-h-10 items-center gap-1 rounded-full border border-primary/30 bg-primary-container px-4 text-xs font-bold text-on-primary-container">
            Open apparatus lab
            <MaterialIcon name="arrow_forward" className="text-base" />
          </span>
        </Link>
      )}

      {tab === "learn" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BIOLOGY_WAVE1_SCOPES.map((scope) => (
            <ScopeCard key={scope.id} scope={scope} mode="learn" />
          ))}
        </section>
      )}

      {tab === "lab" && (
        <section className="grid gap-4 md:grid-cols-2">
          {BIOLOGY_WAVE1_SCOPES.map((scope) => (
            <ScopeCard key={`lab-${scope.id}`} scope={scope} mode="lab" />
          ))}
        </section>
      )}

      {tab === "practice" && (
        <section className="grid gap-4 sm:grid-cols-2">
          {BIOLOGY_WAVE1_SCOPES.map((scope) => (
            <ScopeCard key={`pr-${scope.id}`} scope={scope} mode="practice" />
          ))}
        </section>
      )}

      {tab === "exam" && (
        <section className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-6">
          <StatusChip status="coming-soon" />
          <h2 className="mt-3 font-display text-xl font-bold">Exam preparation</h2>
          <p className="mt-2 text-sm text-secondary">Specimen identification and structured mocks are in development. Use microscopy lab and Practice scopes as they ship.</p>
        </section>
      )}

      <ProgressMap />
    </div>
  );
}
