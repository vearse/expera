import Link from "next/link";
import type { ModuleDetail } from "@/lib/modules/types";
import { moduleRunPath, moduleTopicPath } from "@/lib/modules/paths";
import { BtnPrimary, BtnSecondary, MaterialIcon, StatusChip } from "@/components/vanguard/ui";

function hubTab(detail: ModuleDetail): string {
  return `/${detail.subject}?tab=${detail.kind === "learn" ? "learn" : "lab"}`;
}

export function ModuleTopicPage({ detail }: { detail: ModuleDetail }) {
  const runBase = moduleRunPath(detail.subject, detail.kind, detail.id);
  const isLab = detail.kind === "lab";

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pb-16 pt-2 lg:px-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-secondary" aria-label="Breadcrumb">
        <Link href={`/${detail.subject}`} className="hover:text-primary capitalize">
          {detail.subject} hub
        </Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <Link href={hubTab(detail)} className="hover:text-primary capitalize">
          {detail.kind}
        </Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <span className="font-semibold text-on-surface">{detail.title}</span>
      </nav>

      <section className="grid items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-primary">{detail.grades}</span>
            {detail.examAlignment ? (
              <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <MaterialIcon name="verified" className="text-sm" />
                {detail.examAlignment}
              </span>
            ) : null}
            <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface-variant">{detail.view}</span>
            {detail.durationMinutes ? (
              <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-xs text-secondary">⏱ {detail.durationMinutes} mins</span>
            ) : null}
            {detail.difficulty ? (
              <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-xs text-secondary">{detail.difficulty}</span>
            ) : null}
            <StatusChip status={detail.runAvailable ? "available" : "planned"} />
          </div>

          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-on-surface lg:text-5xl">{detail.title}</h1>
            <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">{detail.objective}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5 lab-card-elevation">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
                <MaterialIcon name="flag" className="text-lg" />
                Objective
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{detail.objective}</p>
            </article>
            <article className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5 lab-card-elevation">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
                <MaterialIcon name="psychology" className="text-lg" />
                Purpose
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{detail.purpose}</p>
            </article>
          </div>

          <p className="text-sm text-secondary">
            <span className="font-semibold text-on-surface">Curriculum scope:</span> {detail.curriculumScope}
          </p>

          {detail.proTip ? (
            <div className="flex items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
              <MaterialIcon name="lightbulb" className="mt-0.5 text-primary" />
              <p className="text-sm text-on-surface-variant">
                <strong className="text-on-surface">Exam tip:</strong> {detail.proTip}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            {detail.runAvailable ? (
              isLab ? (
                <>
                  <BtnPrimary href={`${runBase}?mode=guided`}>
                    <MaterialIcon name="science" />
                    Start guided lab
                  </BtnPrimary>
                  <BtnSecondary href={`${runBase}?mode=explore`}>
                    <MaterialIcon name="bolt" />
                    Explore freely
                  </BtnSecondary>
                </>
              ) : (
                <BtnPrimary href={runBase}>
                  <MaterialIcon name="play_circle" />
                  Open explorer
                </BtnPrimary>
              )
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-outline-variant px-5 py-3 text-sm font-semibold text-secondary">
                <MaterialIcon name="schedule" />
                Simulation coming soon — review objective and purpose above
              </span>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-inverse-surface p-6 text-inverse-on-surface shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-fixed">Module preview</span>
              <span className="text-xs text-inverse-on-surface/70">Wave {detail.wave}</span>
            </div>
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
              <MaterialIcon name={isLab ? "science" : "lightbulb"} className="text-6xl text-primary-fixed/80" />
              <p className="max-w-xs text-center text-sm text-inverse-on-surface/80">{detail.purpose}</p>
            </div>
          </div>
        </div>
      </section>

      {detail.prerequisites?.length ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">Prepare first</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {detail.prerequisites.map((p) => (
              <Link
                key={`${p.kind}-${p.id}`}
                href={moduleTopicPath(detail.subject, p.kind, p.id)}
                className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4 lab-card-elevation hover:border-primary/40"
              >
                <span className="text-xs font-bold uppercase text-secondary">{p.kind}</span>
                <p className="mt-1 font-semibold text-on-surface">{p.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {isLab && (detail.guidedMode || detail.exploreMode) ? (
        <section id="lab-modes" className="grid gap-6 md:grid-cols-2">
          {detail.guidedMode ? (
            <article className="rounded-xl border-2 border-primary-container/50 bg-surface-container-lowest p-6 lab-card-elevation">
              <h3 className="font-display text-lg font-bold">Guided mode</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{detail.guidedMode}</p>
              {detail.runAvailable ? (
                <Link href={`${runBase}?mode=guided`} className="mt-4 inline-flex text-sm font-bold text-primary hover:underline">
                  Launch guided →
                </Link>
              ) : null}
            </article>
          ) : null}
          {detail.exploreMode ? (
            <article className="rounded-xl border border-outline-variant/40 bg-surface p-6 lab-card-elevation">
              <h3 className="font-display text-lg font-bold">Explore mode</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{detail.exploreMode}</p>
              {detail.runAvailable ? (
                <Link href={`${runBase}?mode=explore`} className="mt-4 inline-flex text-sm font-bold text-primary hover:underline">
                  Launch explore →
                </Link>
              ) : null}
            </article>
          ) : null}
        </section>
      ) : null}

      {detail.apparatusAndReagents ? (
        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 lab-card-elevation">
          <h2 className="font-display text-lg font-bold">Apparatus and reagents</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{detail.apparatusAndReagents}</p>
        </section>
      ) : null}

      {detail.mistakesToDetect?.length ? (
        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 lab-card-elevation">
          <h2 className="font-display text-lg font-bold">Mistakes the lab detects</h2>
          <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
            {detail.mistakesToDetect.map((m) => (
              <li key={m} className="flex gap-2">
                <MaterialIcon name="warning" className="shrink-0 text-amber-600" />
                {m}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.preparesFor ? (
        <section className="rounded-xl border border-primary/20 bg-primary-container/5 p-6">
          <h2 className="font-display text-lg font-bold text-primary">Prepares for</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{detail.preparesFor}</p>
          {detail.relatedPracticeIds?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {detail.relatedPracticeIds.map((pid) => (
                <Link
                  key={pid}
                  href={`/${detail.subject}/practice/${pid}`}
                  className="rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1 text-xs font-semibold hover:border-primary"
                >
                  Practice: {pid.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
