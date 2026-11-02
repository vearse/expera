"use client";

import type { Task } from "@/lib/content/schemas";
import { Button } from "@/components/ui";
import type { GuidedStepView } from "@/lib/sim/apparatusGuided";
import type { ApparatusAction, ApparatusState } from "@/lib/sim/apparatusStore";
import type { ApparatusPartStates } from "@/lib/sim/apparatusPartStates";

const READINGS = { burette: 23.45, pipette: 25, "measuring-cylinder": 48.5 } as const;

export function GuidedStepCard({
  step,
  state,
  stageTitle,
  onDispatch,
  readingChoices,
  variant = "default",
}: {
  step: GuidedStepView;
  state: ApparatusState;
  stageTitle: string;
  onDispatch: (action: ApparatusAction) => void;
  readingChoices: number[];
  variant?: "default" | "paper";
}) {
  const safetyTask =
    state.safetyTasks[state.guidedStepIndex]?.type === "choice" ? (state.safetyTasks[state.guidedStepIndex] as Task & { type: "choice" }) : null;
  const identifyTask =
    state.identifyTasks[state.guidedStepIndex]?.type === "choice" ? (state.identifyTasks[state.guidedStepIndex] as Task & { type: "choice" }) : null;
  const selected = state.items.find((i) => i.id === state.selectedId) ?? null;
  const bunsenOnBench = state.bench.includes("bunsen-burner");
  const partStates: ApparatusPartStates = state.partStates;
  const spokenHint = state.hintLevel >= 2 ? step.hint2 : state.hintLevel === 1 ? step.hint1 : null;

  return (
    <div
      className={
        variant === "paper"
          ? "pointer-events-auto flex w-full flex-col overflow-visible text-slate-900"
          : "pointer-events-auto flex max-h-[min(420px,55vh)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-violet-300/90 bg-violet-50/95 shadow-xl backdrop-blur-md"
      }
      data-testid="guided-step-card"
      aria-label="Guided step"
    >
      <div className={variant === "paper" ? "shrink-0 border-b border-dashed border-teal-800/25 px-1 py-1.5" : "shrink-0 border-b border-violet-200/80 px-3 py-2"}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${variant === "paper" ? "text-teal-800" : "text-violet-800"}`}>{stageTitle}</p>
        <p className="text-xs font-semibold text-slate-900">
          Step {step.stepIndex + 1} of {step.stepTotal} · {step.title}
        </p>
      </div>

      <div className={variant === "paper" ? "space-y-1.5 px-1 py-1.5" : "flex-1 space-y-2 overflow-y-auto px-3 py-2.5"}>
        {spokenHint ? (
          <p className="rounded-md bg-teal-50 px-2 py-1 text-[11px] leading-snug text-teal-950 ring-1 ring-teal-200" data-testid="guided-hint-text">
            Ms. Ada: {spokenHint}
          </p>
        ) : null}
        {step.primaryAction.kind === "choice" && safetyTask ? (
          <>
            <p className="text-sm font-medium text-slate-900">{safetyTask.prompt}</p>
            <div className="grid gap-1">
              {safetyTask.options.map((opt) => (
                <Button
                  key={opt.id}
                  variant="ghost"
                  className="h-auto min-h-9 justify-start whitespace-normal px-2 py-1.5 text-left text-xs"
                  onClick={() => onDispatch({ type: "answerChoice", taskId: safetyTask.id, optionId: opt.id })}
                >
                  {opt.text}
                </Button>
              ))}
            </div>
            {state.hintLevel >= 2 && step.answerReveal ? (
              <p className="rounded-md bg-white/90 px-2 py-1 text-[11px] text-emerald-800 ring-1 ring-emerald-200">Answer: {step.answerReveal}</p>
            ) : null}
          </>
        ) : null}

        {step.primaryAction.kind === "identify" && identifyTask ? (
          <>
            <p className="text-sm font-medium">{identifyTask.prompt}</p>
            <p className="text-[11px] text-violet-900">
              Target: <span className="font-semibold">{step.answerReveal ?? "—"}</span>
            </p>
            <Button variant="ghost" className="text-xs" disabled={!selected} onClick={() => selected && onDispatch({ type: "guess", id: selected.id })}>
              Submit: {selected?.name ?? "—"}
            </Button>
            {state.identifyFeedback ? <p className="text-[11px] text-slate-700">{state.identifyFeedback}</p> : null}
            {state.hintLevel >= 2 ? <p className="text-[11px] font-semibold text-emerald-800">{step.hint2}</p> : null}
          </>
        ) : null}

        {step.primaryAction.kind === "reading" ? (
          <>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(READINGS) as (keyof typeof READINGS)[]).map((target) => (
                <Button key={target} variant="ghost" className="text-xs" onClick={() => onDispatch({ type: "startReading", target, trueReading: READINGS[target] })}>
                  {state.items.find((i) => i.id === target)?.name ?? target}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {(["eye", "above", "below"] as const).map((view) => (
                <Button key={view} variant={state.view === view ? "primary" : "ghost"} className="text-xs" onClick={() => onDispatch({ type: "setView", view })}>
                  {view === "eye" ? "Eye level" : view === "above" ? "Above" : "Below"}
                </Button>
              ))}
            </div>
            {state.trueReading !== null ? (
              <div className="grid grid-cols-2 gap-1">
                {readingChoices.map((value) => (
                  <Button key={value} variant="ghost" className="text-xs" onClick={() => onDispatch({ type: "submitReading", value })}>
                    {value.toFixed(2)} cm³
                  </Button>
                ))}
              </div>
            ) : null}
            {state.readingFeedback ? <p className="text-[11px]">{state.readingFeedback}</p> : null}
          </>
        ) : null}

        {step.primaryAction.kind === "handling-bunsen" ? (
          <>
            <Button variant="ghost" className="text-xs" onClick={() => onDispatch({ type: "select", id: "bunsen-burner" })}>
              Select Bunsen
            </Button>
            {bunsenOnBench ? (
              <div className="flex flex-wrap gap-1">
                <Button variant={partStates.bunsen.lit ? "primary" : "ghost"} className="text-xs" onClick={() => onDispatch({ type: "togglePart", part: "bunsen-lit" })}>
                  Gas / flame
                </Button>
                <Button variant={partStates.bunsen.airOpen ? "primary" : "ghost"} className="text-xs" onClick={() => onDispatch({ type: "togglePart", part: "bunsen-air" })}>
                  Air hole
                </Button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-600">Place the Bunsen on the bench first.</p>
            )}
            <Button className="text-xs" disabled={!(partStates.bunsen.lit && partStates.bunsen.airOpen)} onClick={() => onDispatch({ type: "advanceGuided" })}>
              Continue
            </Button>
          </>
        ) : null}

        {(step.primaryAction.kind === "assemble" || step.primaryAction.kind === "assemble-final") && (
          <>
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => {
                const a = step.primaryAction;
                if (a.kind !== "assemble" && a.kind !== "assemble-final") return;
                onDispatch({ type: "startSetup", id: a.setupId });
              }}
            >
              Start {step.primaryAction.kind === "assemble" || step.primaryAction.kind === "assemble-final" ? step.primaryAction.setupId : ""}
            </Button>
            <Button className="text-xs" onClick={() => onDispatch({ type: "checkSetup" })}>
              Check set-up
            </Button>
            {state.setupFeedback ? <p className="text-[11px] text-slate-800">{state.setupFeedback}</p> : null}
          </>
        )}

        {step.primaryAction.kind === "cleanup" ? (
          <>
            <Button variant="ghost" className="text-xs" onClick={() => onDispatch({ type: "resetBench" })}>
              Clear bench
            </Button>
            <Button className="text-xs" onClick={() => onDispatch({ type: "advanceGuided" })}>
              Bench is tidy — continue
            </Button>
          </>
        ) : null}

        {state.choiceFeedback ? <p className="rounded-lg bg-white/90 p-2 text-[11px] ring-1 ring-slate-200">{state.choiceFeedback}</p> : null}
      </div>
    </div>
  );
}
