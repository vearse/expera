"use client";

import type { ReactNode } from "react";

export function GuidedInstructionCard({
  title,
  stepNumber,
  totalSteps,
  instruction,
  hint,
  hintLevel,
  onHint,
  feedback,
  notice,
  progress,
  actions,
  className = "",
}: {
  title: string | null;
  stepNumber: number;
  totalSteps: number;
  instruction: string;
  hint?: string | null;
  hintLevel?: number;
  onHint?: () => void;
  feedback?: string | null;
  notice?: string | null;
  progress?: number;
  actions?: ReactNode;
  className?: string;
}) {
  const percent = Math.round(Math.min(1, Math.max(0, progress ?? 0)) * 100);

  return (
    <div
      className={`pointer-events-auto w-full max-w-md rounded-xl border border-white/70 bg-white/92 p-3 text-slate-800 shadow-xl backdrop-blur-md ${className}`}
      aria-live="polite"
      data-testid="guided-instruction-card"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
          {title ? `Guided step ${stepNumber} of ${totalSteps}` : "Experiment complete"}
        </p>
        {onHint && title ? (
          <button
            type="button"
            onClick={onHint}
            className="min-h-8 shrink-0 rounded-md border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hint {hintLevel ? `${hintLevel}/2` : ""}
          </button>
        ) : null}
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden>
        <div className="h-full rounded-full bg-teal-600 transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>

      {title ? <p className="mt-2 text-sm font-bold leading-tight">{title}</p> : null}
      <p className="mt-0.5 text-xs leading-snug text-slate-600">{hint ?? instruction}</p>

      {feedback ? (
        <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium leading-snug text-amber-900 ring-1 ring-amber-200">{feedback}</p>
      ) : null}
      {notice ? (
        <p className="mt-1.5 rounded-md bg-sky-50 px-2 py-1 text-[11px] leading-snug text-sky-900 ring-1 ring-sky-200">{notice}</p>
      ) : null}

      {actions ? <div className="mt-2 flex flex-wrap items-center gap-1.5">{actions}</div> : null}
    </div>
  );
}
