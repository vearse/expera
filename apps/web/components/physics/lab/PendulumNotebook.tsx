"use client";

import {
  currentGravity,
  evaluatePendulum,
  graphRows,
  type PendulumAction,
  type PendulumLabState,
} from "@/lib/sim/pendulumStore";

const accuracyCopy = {
  excellent: { label: "Excellent", tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  good: { label: "Good", tone: "bg-sky-100 text-sky-800 border-sky-200" },
  review: { label: "Review", tone: "bg-amber-100 text-amber-900 border-amber-200" },
  "not-ready": { label: "Not ready", tone: "bg-slate-100 text-slate-600 border-slate-200" },
} as const;

function CheckIcon({ done }: { done: boolean }) {
  return (
    <span className={`material-symbols-outlined text-[16px] ${done ? "text-emerald-600" : "text-slate-300"}`} aria-hidden="true">
      {done ? "check_circle" : "radio_button_unchecked"}
    </span>
  );
}

export function PendulumNotebook({ state, dispatch }: { state: PendulumLabState; dispatch: (action: PendulumAction) => void }) {
  const evaluation = evaluatePendulum(state);
  const gravity = currentGravity(state);
  const rows = graphRows(state);
  const analysis = state.analysis;
  const accuracy = accuracyCopy[evaluation.accuracy];
  const showChecks = state.mode === "guided" || Boolean(analysis);
  const minRows = state.data.analysis.minRows;
  const minLengths = state.data.analysis.minDistinctLengths;

  return (
    <div className="grid min-w-0 gap-2.5">
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-labelledby="pendulum-notebook-title">
        <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700">4 · Notebook</p>
            <h3 id="pendulum-notebook-title" className="text-sm font-bold text-slate-950">Student timing records</h3>
            <p className="text-[10.5px] text-slate-500">Only rows you record appear here. The graph uses rows at {gravity.name}.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${evaluation.graphReady ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
              {evaluation.distinctLengths}/{minLengths} lengths
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">{rows.length}/{minRows} rows</span>
          </div>
        </div>

        <div className="w-full max-w-full overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-left text-[10.5px]">
            <caption className="sr-only">Pendulum measurements recorded by the student</caption>
            <thead className="bg-slate-100 text-[9px] uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-2 py-1.5 font-bold">#</th>
                <th className="px-2 py-1.5 font-bold">L / m</th>
                <th className="px-2 py-1.5 font-bold">Method</th>
                <th className="px-2 py-1.5 font-bold">θ / °</th>
                <th className="px-2 py-1.5 font-bold">n</th>
                <th className="px-2 py-1.5 font-bold">t / s</th>
                <th className="px-2 py-1.5 font-bold">T / s</th>
                <th className="px-2 py-1.5 font-bold">T² / s²</th>
                <th className="px-2 py-1.5 font-bold">g</th>
              </tr>
            </thead>
            <tbody>
              {state.rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">No rows yet. Measure the length and angle, then complete a timing run.</td>
                </tr>
              ) : state.rows.map((row) => {
                const otherGravity = row.gravityId !== state.params.gravityId;
                return (
                  <tr key={row.id} className={`border-t border-slate-100 ${otherGravity ? "bg-amber-50/60 text-slate-400" : "text-slate-700"}`}>
                    <td className="px-2 py-1.5 font-mono">{row.sequence}</td>
                    <td className="px-2 py-1.5 font-mono font-semibold">{row.lengthM.toFixed(3)}</td>
                    <td className={`px-2 py-1.5 ${row.method === "bottom" ? "font-semibold text-rose-700" : ""}`}>{row.method === "bottom" ? "bottom" : "centre"}</td>
                    <td className="px-2 py-1.5 font-mono">{row.measuredAngleDeg.toFixed(1)}</td>
                    <td className="px-2 py-1.5 font-mono">{row.n}</td>
                    <td className="px-2 py-1.5 font-mono">{row.totalTimeS.toFixed(2)}</td>
                    <td className="px-2 py-1.5 font-mono font-semibold text-slate-900">{row.periodS.toFixed(3)}</td>
                    <td className="px-2 py-1.5 font-mono">{row.periodSquaredS2.toFixed(3)}</td>
                    <td className="px-2 py-1.5">{otherGravity ? <span className="whitespace-nowrap rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-800">{row.gravityId}</span> : gravity.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => dispatch({ type: "analyse" })}
            disabled={!evaluation.graphReady}
            className="min-h-9 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {analysis ? "Recalculate g from the graph" : "Plot T² against L and calculate g"}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "clearRows" })}
            disabled={state.rows.length === 0}
            className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-35"
          >
            Clear rows
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "resetExperiment" })}
            className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Reset whole experiment
          </button>
          {state.rows.length > rows.length ? <span className="text-[10px] text-amber-700">{state.rows.length - rows.length} row(s) at other gravity settings are excluded from this fit.</span> : null}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-labelledby="pendulum-analysis-title">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700">5 · Analysis</p>
            <h3 id="pendulum-analysis-title" className="text-sm font-bold text-slate-950">Gradient and experimental g</h3>
          </div>
          <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${accuracy.tone}`}>{accuracy.label}</span>
        </div>
        {analysis ? (
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Gradient</p>
                <p className="font-mono text-sm font-bold text-slate-950">{analysis.fit.slope.toFixed(3)}</p>
                <p className="text-[9px] text-slate-500">s² m⁻¹</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Experimental g</p>
                <p className="font-mono text-sm font-bold text-slate-950">{analysis.gMeasuredMS2.toFixed(2)}</p>
                <p className="text-[9px] text-slate-500">m s⁻²</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Percentage error</p>
                <p className="font-mono text-sm font-bold text-slate-950">{analysis.percentError.toFixed(2)}%</p>
                <p className="text-[9px] text-slate-500">against {analysis.acceptedGMS2.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Fit quality</p>
                <p className="font-mono text-sm font-bold text-slate-950">r² {analysis.fit.r2.toFixed(4)}</p>
                <p className="text-[9px] text-slate-500">{analysis.rowCount} points</p>
              </div>
            </div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2 text-[11px] leading-relaxed text-sky-950">
              Gradient = 4π²/g, so g = 4π² ÷ gradient. Intercept = {analysis.fit.intercept.toFixed(3)} s². A non-zero intercept usually means a length or timing systematic error.
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-[11px] text-slate-600">
            {evaluation.graphReady ? "Your data meet the graph requirements. Plot T² against L and calculate g from the best-fit gradient." : `You need ${minRows} rows over ${minLengths} distinct lengths at ${gravity.name}. You currently have ${rows.length} row(s) over ${evaluation.distinctLengths} distinct length(s).`}
          </p>
        )}
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-labelledby="pendulum-tasks-title">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700">6 · Discovery</p>
        <h3 id="pendulum-tasks-title" className="mb-2 text-sm font-bold text-slate-950">Evidence for each relationship</h3>
        <div className="grid gap-1.5">
          {evaluation.tasks.map((task) => (
            <div key={task.id} className={`rounded-lg border p-2 ${task.done ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-start gap-1.5">
                <CheckIcon done={task.done} />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-900">{task.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">{task.description}</p>
                  <p className={`mt-1 text-[10px] leading-relaxed ${task.done ? "font-medium text-emerald-800" : "text-slate-500"}`}>
                    <strong>{task.done ? "Evidence: " : "Next: "}</strong>{task.evidence}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border p-3 shadow-sm ${evaluation.ok ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`} aria-labelledby="pendulum-summary-title">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700">7 · Summary</p>
            <h3 id="pendulum-summary-title" className="text-sm font-bold text-slate-950">Practical record and next revision</h3>
          </div>
          <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${evaluation.ok ? "border-emerald-300 bg-white text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
            {evaluation.ok ? "Practical evidence complete" : evaluation.graphReady ? "Analysis in progress" : "Evidence building"}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Completed checks</p>
            {showChecks ? (
              <ul className="grid gap-1">
                {evaluation.completedChecks.length === 0 ? <li className="text-[10.5px] text-slate-500">No checks complete yet.</li> : evaluation.completedChecks.map((check) => (
                  <li key={check} className="flex items-start gap-1.5 text-[10.5px] text-slate-700"><CheckIcon done /><span>{check}</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-[10.5px] leading-relaxed text-slate-500">Your completed checks and final mistake breakdown appear after you plot and analyse the graph.</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Mistake check</p>
            {showChecks ? (
              evaluation.mistakes.length === 0 ? (
                <p className="text-[10.5px] font-medium text-emerald-700">No measurement or method mistakes detected in the recorded evidence.</p>
              ) : (
                <ul className="grid gap-1">
                  {evaluation.mistakes.map((mistake) => (
                    <li key={mistake} className="flex items-start gap-1.5 text-[10.5px] text-amber-900"><span className="material-symbols-outlined text-[15px] text-amber-600" aria-hidden="true">warning</span><span>{mistake}</span></li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-[10.5px] leading-relaxed text-slate-500">Independent mode: the full mistake breakdown is revealed after analysis.</p>
            )}
          </div>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-sky-700">Key idea</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-sky-950">{evaluation.keyIdea}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-600">Revise next</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-800">{evaluation.revision}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
