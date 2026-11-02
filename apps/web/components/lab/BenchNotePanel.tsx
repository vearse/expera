"use client";

import type { BenchNoteData } from "@/components/sim3d/BenchNote";
import { Button } from "@/components/ui";
import { GuidedStepCard } from "@/components/lab/GuidedStepCard";
import type { GuidedStepView } from "@/lib/sim/apparatusGuided";
import type { ApparatusAction, ApparatusState } from "@/lib/sim/apparatusStore";

export function BenchNotePanel({
  note,
  guided,
  step,
  state,
  stageTitle,
  onDispatch,
  readingChoices,
}: {
  note: BenchNoteData;
  guided: boolean;
  step: GuidedStepView | null;
  state: ApparatusState;
  stageTitle: string;
  onDispatch: (action: ApparatusAction) => void;
  readingChoices: number[];
}) {
  const accent = note.accent ?? "#0f766e";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[8px] bg-[#fbf7ea] text-slate-900" data-testid="bench-note-panel">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-1 pt-2.5">
        <div className="border-b border-dashed border-slate-400/40 pb-1.5">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.18em]" style={{ color: accent }}>
            {note.eyebrow}
          </p>
          <h3 className="text-base font-extrabold leading-tight text-slate-900">{note.title}</h3>
          <ul className="mt-1 space-y-0.5">
            {note.lines.map((line) => (
              <li key={line} className="flex gap-1.5 text-[10.5px] leading-snug text-slate-700">
                <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {note.footer ? <p className="mt-1 text-[9.5px] italic leading-snug text-slate-500">{note.footer}</p> : null}
        </div>

        {step ? (
          <div className="pt-1">
            <GuidedStepCard
              variant="paper"
              step={step}
              state={state}
              stageTitle={stageTitle}
              onDispatch={onDispatch}
              readingChoices={readingChoices}
            />
          </div>
        ) : (
          <p className="px-1 pt-2 text-[11px] leading-snug text-slate-700">
            {guided
              ? "This stage is complete. Click Ms. Ada for the next stage, or use the button below."
              : "Select apparatus in the room to read its note here. Ask Ms. Ada if you need a hint."}
          </p>
        )}
      </div>

      {guided ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-dashed border-slate-400/40 px-2 py-1.5">
          {step ? (
            <Button
              variant="ghost"
              className="h-8 px-2 text-[11px]"
              data-testid="guided-request-hint"
              onClick={() => onDispatch({ type: "requestHint" })}
            >
              Ask Ms. Ada ({state.hintLevel}/2)
            </Button>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-800">Stage complete</span>
          )}
          <Button className="h-8 px-2.5 text-[11px]" disabled={!state.stageComplete} onClick={() => onDispatch({ type: "advanceGuided" })}>
            {state.stageComplete ? "Next stage" : "Finish this step first"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
