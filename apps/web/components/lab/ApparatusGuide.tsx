"use client";

import type { ReactNode } from "react";
import type { Apparatus } from "@/lib/content/schemas";
import { ReviewBadge } from "@/components/ui";

export function ApparatusGuide({ item, viewer, onClose }: { item: Apparatus; viewer?: ReactNode; onClose?: () => void }) {
  return (
    <section id={`apparatus-${item.id}`} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Apparatus guide</p>
          <h2 className="text-2xl font-bold text-slate-900">{item.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <ReviewBadge status={item.review} />
          {onClose ? (
            <button type="button" onClick={onClose} className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50" aria-label="Close apparatus guide">
              Close
            </button>
          ) : null}
        </div>
      </div>

      <div className={`grid gap-4 ${viewer ? "lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]" : ""}`}>
        {viewer ? <div className="grid content-start gap-2">{viewer}</div> : null}

        <div className="grid content-start gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">What it is used for</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.use}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">How to use it</h3>
              <ol className="mt-2 grid gap-2 text-sm text-slate-700">
                {(item.howTo ?? []).map((step, index) => (
                  <li key={`${item.id}-${index}`} className="flex gap-2">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-sky-700 text-[11px] font-bold text-white">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {item.tip ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-950">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Key point</h3>
                <p className="mt-1 text-sm">{item.tip}</p>
              </div>
            ) : null}
            {item.safety ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Safety</h3>
                <p className="mt-1 text-sm">{item.safety}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
