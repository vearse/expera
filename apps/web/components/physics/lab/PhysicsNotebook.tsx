"use client";

import { useMemo, useState } from "react";
import type { PhysicsData, PhysicsStation } from "@/lib/content/physics";
import { examBreakdown, type PhysicsAction, type PhysicsEntry, type PhysicsLabState } from "@/lib/sim/physicsMeasurementStore";

type Props = {
  state: PhysicsLabState;
  data: PhysicsData;
  station: PhysicsStation;
  entry: PhysicsEntry | null;
  dispatch: (action: PhysicsAction) => void;
};

export function PhysicsNotebook({ state, data, station, entry, dispatch }: Props) {
  const [open, setOpen] = useState(false);
  const breakdown = useMemo(() => examBreakdown(state), [state]);
  const savedEntries = Object.values(state.entries).filter((item): item is PhysicsEntry => Boolean(item?.savedAt));
  const canSave = Boolean(entry && entry.readings.length > 0 && entry.observation.trim().length >= 8);

  return (
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" aria-label="Physics laboratory notebook">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">Laboratory notebook</p>
          <h2 className="mt-0.5 text-lg font-bold text-slate-900">Evidence from your measurements</h2>
          <p className="mt-0.5 text-xs text-slate-500">Only readings you record appear here. Nothing is filled in automatically.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{savedEntries.length}/{data.stations.length} saved</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <p className="text-xs font-bold text-slate-800">{station.title}</p>
          <span className="font-mono text-[10px] text-slate-500">{entry?.recordedAt ? new Date(entry.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "no reading yet"}</span>
        </div>
        {entry ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Instrument readings</p>
              {entry.readings.map((row) => (
                <div key={`${row.label}-${row.unit}`} className="flex justify-between gap-2 border-b border-slate-200 py-1 text-[11px] last:border-0">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-mono font-semibold text-slate-900">{row.value} {row.unit}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Derived values</p>
              {entry.derived.length === 0 ? <p className="text-[11px] text-slate-400">Complete the station measurements.</p> : entry.derived.map((row) => (
                <div key={`${row.label}-${row.unit}`} className="flex justify-between gap-2 border-b border-slate-200 py-1 text-[11px] last:border-0">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-mono font-semibold text-sky-800">{row.value} {row.unit}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-[11px] text-slate-400">No reading recorded for {station.short}. Use the apparatus, then press “Record reading in notebook”.</p>
        )}

        <label className="mt-3 grid gap-1 text-[11px] font-semibold text-slate-700">
          Observation
          <textarea
            value={entry?.observation ?? ""}
            onChange={(event) => dispatch({ type: "setObservationText", text: event.target.value })}
            disabled={!entry}
            rows={3}
            placeholder="What did you adjust, read and notice? Write at least one sentence."
            className="min-h-20 resize-y rounded-lg border border-slate-300 bg-white p-2 text-xs font-normal leading-relaxed text-slate-900 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
          />
        </label>
        <label className="mt-2 grid gap-1 text-[11px] font-semibold text-slate-700">
          Conclusion
          <textarea
            value={entry?.conclusion ?? ""}
            onChange={(event) => dispatch({ type: "setConclusion", text: event.target.value })}
            disabled={!entry}
            rows={2}
            placeholder="State the measured value, its unit and one source of uncertainty."
            className="min-h-14 resize-y rounded-lg border border-slate-300 bg-white p-2 text-xs font-normal leading-relaxed text-slate-900 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "saveEntry", at: new Date().toISOString() })}
            disabled={!canSave}
            className="min-h-10 rounded-lg bg-emerald-700 px-3.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save station evidence
          </button>
          <span className="text-[10px] text-slate-500">{canSave ? "Your observation will be checked against the simulated measurement." : "Record a reading and write an observation to save."}</span>
        </div>
        {entry?.savedAt ? (
          <p role="status" className={`mt-2 rounded-lg border px-3 py-2 text-[11px] ${entry.completed ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            {entry.completed ? "Saved and verified." : "Saved. The evidence is incomplete, so this station is not marked complete."}
          </p>
        ) : null}
      </div>

      {state.mode === "independent" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-900">Independent assessment breakdown</p>
          <p className="mt-1 text-xs text-amber-950">{breakdown.saved} saved · {breakdown.completed}/{breakdown.total} complete</p>
          {breakdown.mistakes.length > 0 ? (
            <ul className="mt-2 grid gap-1 text-[11px] text-amber-900">
              {breakdown.mistakes.map((mistake) => <li key={mistake}>• {mistake}</li>)}
            </ul>
          ) : <p className="mt-2 text-[11px] text-amber-800">No saved mistakes recorded yet.</p>}
        </div>
      ) : null}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex min-h-9 items-center justify-between rounded-lg bg-slate-100 px-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-200">
        <span>All saved evidence ({savedEntries.length})</span>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="grid gap-2">
          {savedEntries.length === 0 ? <p className="text-xs text-slate-400">Nothing saved yet.</p> : savedEntries.map((item) => (
            <details key={item.stationId} className="rounded-lg border border-slate-200 bg-white p-2">
              <summary className="cursor-pointer text-xs font-semibold text-slate-700">{item.title} · {item.completed ? "complete" : "incomplete"}</summary>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{item.observation}</p>
              {item.conclusion ? <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Conclusion: {item.conclusion}</p> : null}
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}
