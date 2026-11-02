"use client";

export function MsAdaTeacherPanel({
  message,
  heading = "Ms. Ada",
  hintLevel,
  onRequestHint,
  stageComplete,
  stageCompleteAcknowledged,
  onStageCompleteNext,
  onAdvanceStage,
  nextStageTitle,
}: {
  message: string;
  heading?: string;
  hintLevel?: number;
  onRequestHint?: () => void;
  stageComplete?: boolean;
  stageCompleteAcknowledged?: boolean;
  onStageCompleteNext?: () => void;
  onAdvanceStage?: () => void;
  nextStageTitle?: string | null;
}) {
  const showHint = onRequestHint && !stageComplete && hintLevel !== undefined;

  return (
    <div
      className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-teal-200 bg-teal-50/95 p-3 text-teal-950 shadow-lg backdrop-blur-md"
      aria-live="polite"
      data-testid="ms-ada-teacher-panel"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">MA</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">{heading}</p>
        <p className="mt-0.5 text-sm leading-snug">{message}</p>
        {showHint ? (
          <button type="button" className="mt-2 text-xs font-bold text-teal-800 underline" onClick={onRequestHint} data-testid="guided-request-hint">
            Need a hint? ({hintLevel}/2)
          </button>
        ) : null}
        {stageComplete && !stageCompleteAcknowledged ? (
          <button type="button" className="mt-2 min-h-9 rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white shadow-sm hover:bg-teal-800" onClick={onStageCompleteNext}>
            Next →
          </button>
        ) : null}
        {stageComplete && stageCompleteAcknowledged ? (
          <button
            type="button"
            className="mt-2 min-h-9 rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white shadow-sm hover:bg-teal-800"
            onClick={onAdvanceStage}
            data-testid="ms-ada-next-stage"
          >
            Next stage{nextStageTitle ? `: ${nextStageTitle}` : ""} →
          </button>
        ) : null}
      </div>
    </div>
  );
}
