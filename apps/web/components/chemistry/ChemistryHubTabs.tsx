"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EXAM_TOPICS } from "@/lib/content/catalogue";
import { CHEMISTRY_LAB_MODULES, CHEMISTRY_LEARN_MODULES } from "@/lib/modules/catalogue/chemistry";
import type { Experiment } from "@/lib/content/schemas";
import {
  CHEMISTRY_WAVE1_SCOPES,
  countAvailable,
  type ScopeMode,
  type WaveScopeRow,
} from "@/lib/content/wave1Catalogue";
import { ReviewBadge } from "@/components/ui";
import { ProgressMap } from "@/components/gamification/ProgressMap";
import { XpBar } from "@/components/gamification/XpBar";
import { ProgressBadge } from "@/components/ProgressBadge";
import { BtnPrimary, MaterialIcon, StatusChip } from "@/components/vanguard/ui";

export type HubBench = Pick<Experiment, "id" | "title" | "scope" | "review">;

const TABS = ["learn", "lab", "practice", "exam"] as const;
type Tab = (typeof TABS)[number];

const learnCount = countAvailable(CHEMISTRY_WAVE1_SCOPES, "learn");
const labCount = countAvailable(CHEMISTRY_WAVE1_SCOPES, "lab");
const practiceCount = countAvailable(CHEMISTRY_WAVE1_SCOPES, "practice");

const TAB_META: Record<Tab, { label: string; icon: string; hint: string; blurb: string }> = {
  learn: {
    label: "Learn",
    icon: "lightbulb",
    hint: `${learnCount} live · ${CHEMISTRY_WAVE1_SCOPES.length} scopes`,
    blurb: "Interactive explorers",
  },
  lab: {
    label: "Lab",
    icon: "science",
    hint: `${labCount} live · ${CHEMISTRY_WAVE1_SCOPES.length} scopes`,
    blurb: "Interactive laboratories",
  },
  practice: {
    label: "Practice",
    icon: "adjust",
    hint: `${practiceCount} live practicals`,
    blurb: "Guided practical worksheets",
  },
  exam: {
    label: "Exam",
    icon: "timer",
    hint: "Coming soon",
    blurb: "WAEC & JAMB mocks",
  },
};

function modeStatusChip(status: WaveScopeRow["status"][ScopeMode]) {
  if (status === "available") return <StatusChip status="available" />;
  if (status === "in-development") return <StatusChip status="in-development" />;
  return <StatusChip status="planned" />;
}

function ScopeCard({ scope, mode }: { scope: WaveScopeRow; mode: ScopeMode }) {
  const copy = mode === "learn" ? scope.learn : mode === "lab" ? scope.lab : scope.practice;
  const href = mode === "learn" ? scope.learnHref : mode === "lab" ? scope.labHref : scope.practiceHref;
  const status = scope.status[mode];
  const isModuleTopic = mode === "learn" || mode === "lab";
  const linkable = href && (isModuleTopic || status === "available");
  const inner = (
    <article className={`rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-5 lab-card-elevation ${linkable ? "hover:border-primary/50" : "opacity-90"}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase text-secondary">Wave {scope.wave}</span>
        {modeStatusChip(status)}
      </div>
      <h3 className="font-display text-lg font-bold text-on-surface">{scope.title}</h3>
      <p className="mt-2 text-sm text-secondary line-clamp-4">{copy}</p>
      {linkable ? (
        <span className="mt-4 inline-flex text-sm font-semibold text-primary">
          {isModuleTopic ? "Review module →" : "Open →"}
        </span>
      ) : (
        <span className="mt-4 inline-flex text-sm text-outline">On the Wave 1 roadmap</span>
      )}
    </article>
  );
  if (linkable) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function ChemistryHubTabs({ benches }: { benches: HubBench[] }) {
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab: Tab = TABS.includes(requested as Tab) ? (requested as Tab) : "learn";
  const meta = TAB_META[tab];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 pt-6 md:px-8">
      <section className="relative overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6 lab-card-elevation md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="relative grid items-center gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1 text-label-sm font-semibold">
              <span className="size-2 rounded-full bg-primary-container" />
              SS1 to SS3 · NERDC &amp; WAEC syllabus aligned
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Chemistry{" "}
              <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">Hub</span>
            </h1>
            <p className="text-lg text-secondary">Mix, measure and discover how matter works.</p>
            <div className="flex flex-wrap items-center gap-4 border-t border-outline-variant/30 pt-4">
              <div className="flex items-center gap-3 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1.5">
                <span className="text-xs font-bold text-primary">{learnCount + labCount + practiceCount}</span>
                <span className="text-label-md">Wave 1 activities live</span>
              </div>
              <BtnPrimary href="/chemistry/lab/titration">
                Continue: acid-base titration
                <MaterialIcon name="science" className="text-base" />
              </BtnPrimary>
            </div>
          </div>
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="relative flex h-48 w-full max-w-sm items-center justify-between overflow-hidden rounded-xl border border-outline-variant/30 bg-gradient-to-br from-inverse-surface to-on-surface p-4 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] opacity-20 [background-size:16px_16px]" />
              <div className="z-10 w-24 rounded-lg border border-white/20 bg-white/10 p-2.5 text-white backdrop-blur-md">
                <div className="text-[10px] text-primary-fixed">11</div>
                <div className="text-center text-xl font-bold">Na</div>
              </div>
              <div className="z-10 flex flex-col items-center">
                <div className="h-20 w-16 rounded-b-2xl border-2 border-primary-fixed/60 bg-primary/20" />
                <span className="mt-1 font-mono text-[10px] text-primary-fixed">25.00 mL V₁</span>
              </div>
              <div className="z-10 flex size-16 items-center justify-center">
                <div className="size-4 rounded-full bg-primary-fixed shadow-[0_0_12px_#10b981]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-outline-variant/30 bg-surface-container-lowest px-5 py-2.5 lab-card-elevation">
        <XpBar />
      </div>

      <div className="space-y-2 pt-2">
        <div className="inline-flex flex-wrap gap-1 rounded-full border border-outline-variant/40 bg-surface-container-high/60 p-1.5 active-dock-elevation">
          {TABS.map((t) => {
            const active = tab === t;
            const m = TAB_META[t];
            return (
              <Link
                key={t}
                href={`/chemistry?tab=${t}`}
                className={`flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-on-surface text-surface-container-lowest shadow-md" : "text-secondary hover:text-on-surface"
                }`}
                aria-current={active ? "page" : undefined}
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
        <article className="grid overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest lab-card-elevation lg:grid-cols-12">
          <div className="relative flex min-h-[260px] items-center justify-center bg-inverse-surface p-6 lg:col-span-5">
            <span className="absolute left-4 top-4 rounded-full border border-primary/30 bg-inverse-surface/80 px-2.5 py-1 text-label-sm text-primary-fixed backdrop-blur-md">
              3D live simulation
            </span>
            <MaterialIcon name="science" className="text-7xl text-primary-fixed/80" />
          </div>
          <div className="flex flex-col justify-between gap-4 p-6 md:p-8 lg:col-span-7">
            <div>
              <h2 className="font-display text-2xl font-bold">Acid-base titration laboratory</h2>
              <p className="mt-2 text-secondary">
                Perform volumetric neutralisation, calibrate meniscus levels, and determine concordant titre values — Wave 1 scope: volumetric analysis.
              </p>
            </div>
            <BtnPrimary href="/chemistry/lab/titration/run?mode=guided">Resume titration lab →</BtnPrimary>
          </div>
        </article>
      )}

      {tab === "learn" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHEMISTRY_LEARN_MODULES.map((mod) => (
            <Link
              key={mod.id}
              href={`/chemistry/learn/${mod.id}`}
              className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-5 lab-card-elevation hover:border-primary/50"
            >
              <StatusChip status={mod.runAvailable ? "available" : "planned"} />
              <h3 className="mt-2 font-display text-lg font-bold text-on-surface">{mod.title}</h3>
              <p className="mt-2 text-sm text-secondary line-clamp-3">{mod.objective}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-primary">Review module →</span>
            </Link>
          ))}
        </section>
      )}

      {tab === "lab" && (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CHEMISTRY_LAB_MODULES.map((mod) => (
            <Link
              key={mod.id}
              href={`/chemistry/lab/${mod.id}`}
              className="flex flex-col justify-between overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest lab-card-elevation hover:border-primary"
            >
              <div className="flex h-36 items-center justify-center bg-surface-container-low">
                <MaterialIcon name="science" className="text-5xl text-primary/70" />
              </div>
              <div className="space-y-2 p-5">
                <StatusChip status={mod.runAvailable ? "available" : "planned"} />
                <h3 className="font-display font-bold">{mod.title}</h3>
                <p className="text-sm text-secondary line-clamp-3">{mod.objective}</p>
                <span className="text-xs font-semibold text-primary">Review module →</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {tab === "practice" && (
        <section className="grid gap-4 sm:grid-cols-2">
          {benches.map((e) => (
            <Link key={e.id} href={`/chemistry/practice/${e.id}`} className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-5 lab-card-elevation hover:border-primary/40">
              <span className="font-display font-bold">{e.title}</span> <ReviewBadge status={e.review} />
              <p className="mt-2 text-sm text-secondary">{e.scope}</p>
              <ProgressBadge experimentId={e.id} />
            </Link>
          ))}
          {CHEMISTRY_WAVE1_SCOPES.filter((s) => !s.practiceHref).map((scope) => (
            <ScopeCard key={`pr-${scope.id}`} scope={scope} mode="practice" />
          ))}
        </section>
      )}

      {tab === "exam" && (
        <section className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-6">
          <StatusChip status="coming-soon" />
          <h2 className="mt-3 font-display text-xl font-bold">Exam preparation</h2>
          <p className="mt-2 text-sm text-secondary">Structured mock assessments are in development. Use Practice for guided exam-style preparation.</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
            {EXAM_TOPICS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <ProgressMap />
    </div>
  );
}
