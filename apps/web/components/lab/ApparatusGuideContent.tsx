"use client";

import type { ReactNode } from "react";
import type { Apparatus } from "@/lib/content/schemas";
import { ReviewBadge } from "@/components/ui";

export function ApparatusGuideContent({
  item,
  variant,
  viewer,
}: {
  item: Apparatus;
  variant: "full" | "compact";
  viewer?: ReactNode;
}) {
  if (variant === "compact") {
    return (
      <div className="grid gap-2 text-slate-700" data-testid="apparatus-guide-compact">
        <p className="text-sm leading-relaxed">{item.use}</p>
        {item.safety ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50/90 px-2 py-1.5 text-[11px] text-rose-950">
            <span className="font-semibold text-rose-800">Safety: </span>
            {item.safety}
          </p>
        ) : null}
        {(item.howTo ?? []).length ? (
          <ol className="grid gap-1.5 text-[11px] text-slate-700">
            {(item.howTo ?? []).map((step, index) => (
              <li key={step} className="flex gap-1.5">
                <span className="font-bold text-sky-800">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {item.tip ? <p className="text-[11px] font-medium text-sky-800">{item.tip}</p> : null}
      </div>
    );
  }

  return (
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
              <li key={step} className="flex gap-2">
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
      {viewer ? <div className="lg:hidden">{viewer}</div> : null}
      <ReviewBadge status={item.review} />
    </div>
  );
}
