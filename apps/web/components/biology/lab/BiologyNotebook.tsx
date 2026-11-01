"use client";

import type { SpecimenSpec } from "@/lib/content/biology";
import {
  currentDrawingFeedback,
  currentExperiment,
  currentRecord,
  examBreakdown,
  type BiologyAction,
  type BiologyLabState,
} from "@/lib/sim/biologyMicroscopyStore";

export function BiologyNotebook({
  state,
  dispatch,
  specimens,
}: {
  state: BiologyLabState;
  dispatch: (action: BiologyAction) => void;
  specimens: SpecimenSpec[];
}) {
  const record = currentRecord(state);
  const experiment = currentExperiment(state);
  const requireActualSize = experiment?.id === "measurement-and-drawing";
  const feedback = currentDrawingFeedback(state, requireActualSize);
  const breakdown = examBreakdown(state);
  const saved = Object.values(state.records).filter((entry) => entry.savedAt).length;
  const completed = Object.values(state.records).filter((entry) => entry.completed).length;

  return (
    <section className="grid gap-4 rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm" aria-labelledby="notebook-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Step 4 · Laboratory notebook</p>
          <h2 id="notebook-heading" className="text-xl font-bold text-slate-900">Record and review</h2>
        </div>
        <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {saved}/{specimens.length} saved · {completed} complete
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="grid content-start gap-3 rounded-xl border border-slate-200 p-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Observation notes</h3>
            <p className="text-xs text-slate-500">{record?.specimenName ?? "Select and observe a specimen first."}</p>
          </div>

          <label className="grid gap-1 text-xs">
            <span className="font-semibold text-slate-700">What did you observe?</span>
            <textarea
              value={record?.observation ?? ""}
              onChange={(event) => dispatch({ type: "setObservationText", text: event.target.value })}
              rows={3}
              placeholder="Describe the cells or organisms, their arrangement and any visible structures."
              className="rounded-lg border border-slate-300 bg-white p-2.5 text-sm leading-relaxed"
              disabled={!state.activeSpecimenId}
            />
          </label>

          <label className="grid gap-1 text-xs">
            <span className="font-semibold text-slate-700">Conclusion</span>
            <textarea
              value={record?.conclusion ?? ""}
              onChange={(event) => dispatch({ type: "setConclusion", text: event.target.value })}
              rows={2}
              placeholder="Link your observations to the aim of the practical."
              className="rounded-lg border border-slate-300 bg-white p-2.5 text-sm leading-relaxed"
              disabled={!state.activeSpecimenId}
            />
          </label>

          <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-xs">
            <p className="font-semibold text-slate-700">Notebook details</p>
            <p className="text-slate-600">Total magnification: <strong className="text-slate-900">{record?.totalMagnification ? `${record.totalMagnification}×` : "record an observation"}</strong></p>
            <p className="text-slate-600">Field of view: <strong className="text-slate-900">{record?.fieldOfViewMicrometres ? `${record.fieldOfViewMicrometres.toFixed(0)} µm` : "—"}</strong></p>
            <p className="text-slate-600">Actual size: <strong className="text-slate-900">{record?.actualSizeMicrometres ? `${record.actualSizeMicrometres.toFixed(1)} µm` : "not calculated"}</strong></p>
            <p className="text-slate-600">Saved: <strong className="text-slate-900">{record?.savedAt ? new Date(record.savedAt).toLocaleString() : "not saved"}</strong></p>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: "saveObservation" })}
            className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Save notebook entry
          </button>
        </div>

        <div className="grid content-start gap-3">
          <div className={`rounded-xl border p-3 ${feedback?.ok ? "border-emerald-300 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">Drawing and record check</h3>
              <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${feedback?.ok ? "bg-emerald-700 text-white" : "bg-white text-amber-900"}`}>
                {feedback ? `${feedback.score}%` : "—"}
              </span>
            </div>
            {feedback ? (
              <>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                  <span>{feedback.hasDrawing ? "✓" : "○"} Drawing</span>
                  <span>{feedback.missingLabels.length === 0 ? "✓" : "○"} Required labels</span>
                  <span>{feedback.hasMagnification ? "✓" : "○"} Magnification</span>
                  <span>{feedback.hasActualSize || !requireActualSize ? "✓" : "○"} Actual size</span>
                </div>
                {feedback.issues.length ? (
                  <ul className="mt-2 grid gap-1 text-xs text-amber-950">
                    {feedback.issues.map((issue) => (
                      <li key={issue} className="flex gap-1.5">
                        <span aria-hidden>•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-emerald-950">The notebook entry meets the drawing and measurement criteria.</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-xs text-amber-950">Record an observation and add a drawing to see feedback.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h3 className="text-sm font-bold text-slate-900">Practical records</h3>
            <ul className="mt-2 grid gap-2">
              {specimens.map((specimen) => {
                const entry = state.records[specimen.id];
                const active = specimen.id === state.activeSpecimenId;
                return (
                  <li key={specimen.id}>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "selectSpecimen", id: specimen.id })}
                      className={`w-full rounded-lg border p-2.5 text-left text-xs transition ${active ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-400"}`}
                    >
                      <span className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-semibold text-slate-900">{specimen.name}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${entry?.completed ? "bg-emerald-700 text-white" : entry?.savedAt ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}>
                          {entry?.completed ? "complete" : entry?.savedAt ? "saved" : entry?.structures.length ? "observed" : "not started"}
                        </span>
                      </span>
                      <span className="mt-1 block text-slate-500">
                        {entry?.totalMagnification ? `${entry.totalMagnification}×` : "no observation"} · {entry?.drawing.labels.length ?? 0} labels
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Progress overview</h3>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-white p-2">
              <span className="block text-lg font-bold text-slate-900">{breakdown.saved}</span>
              <span className="text-slate-500">saved records</span>
            </div>
            <div className="rounded-lg bg-white p-2">
              <span className="block text-lg font-bold text-slate-900">{breakdown.completed}</span>
              <span className="text-slate-500">complete entries</span>
            </div>
            <div className="rounded-lg bg-white p-2">
              <span className="block text-lg font-bold text-slate-900">{breakdown.completedExperiments.length}</span>
              <span className="text-slate-500">practicals</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Review points</h3>
          {breakdown.areas.length || breakdown.mistakes.length ? (
            <ul className="mt-2 grid gap-1 text-xs text-slate-700">
              {[...new Set([...breakdown.mistakes, ...breakdown.areas])].slice(0, 6).map((item) => (
                <li key={item} className="rounded bg-white px-2 py-1.5">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-600">No review points yet. Mistakes and drawing feedback will appear here.</p>
          )}
        </div>
      </div>
    </section>
  );
}
