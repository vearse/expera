"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { ReviewBadge } from "@/components/ui";
import type { PendulumData } from "@/lib/content/pendulum";
import {
  createPendulumStore,
  currentGravity,
  evaluatePendulum,
  graphRows,
  type PendulumAction,
  type PendulumStore,
} from "@/lib/sim/pendulumStore";
import { PendulumGraphs } from "./PendulumGraphs";
import { PendulumNotebook } from "./PendulumNotebook";
import { PendulumPanel } from "./PendulumPanel";
import { PendulumRoom } from "./PendulumRoom";

export function PendulumLaboratory({ data }: { data: PendulumData }) {
  const store = useMemo(() => createPendulumStore(data, 1), [data]);
  const state = useStore(store) as PendulumStore;
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (!state.simulation.running) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const current = store.getState();
      if (!current.simulation.running) return;
      const deltaS = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      current.dispatch({ type: "advance", deltaS });
      if (store.getState().simulation.running) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [store, state.simulation.running]);

  const dispatch = (action: PendulumAction) => store.getState().dispatch(action);
  const evaluation = evaluatePendulum(state);
  const gravity = currentGravity(state);
  const rows = graphRows(state);
  const minRows = data.analysis.minRows;
  const minLengths = data.analysis.minDistinctLengths;
  const lengthProgress = Math.min(1, evaluation.distinctLengths / minLengths);
  const rowProgress = Math.min(1, rows.length / minRows);
  const percent = evaluation.ok ? 100 : Math.round(Math.min(95, lengthProgress * 65 + rowProgress * 20 + (evaluation.analysis ? 10 : 0)));

  return (
    <div data-lab-ready={ready ? "true" : "false"} className="mx-auto grid max-w-7xl gap-4 px-3 pb-20 pt-5 sm:px-6">
      <header className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/physics" className="text-xs font-semibold text-sky-700 underline-offset-4 hover:underline">← Physics subject hub</Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">Physics · Simple pendulum practical</p>
              <ReviewBadge status={data.review} />
            </div>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{data.lab.title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{data.lab.summary}</p>
          </div>
          <div className="min-w-48 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <span>Practical evidence</span>
              <span>{percent}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600">
              {rows.length}/{minRows} rows · {evaluation.distinctLengths}/{minLengths} lengths
            </p>
            <p className="text-[10px] font-medium text-slate-500">
              {evaluation.analysis ? `g = ${evaluation.analysis.gMeasuredMS2.toFixed(2)} m/s² · ${evaluation.analysis.percentError.toFixed(1)}% error` : evaluation.graphReady ? "Graph ready for analysis" : `${gravity.name} · ${state.rows.length} saved row${state.rows.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {([
            { mode: "guided", title: "Guided practice", copy: "Procedural hints and immediate measurement feedback. Try again without penalty." },
            { mode: "independent", title: "Independent task", copy: "No procedural hints. Record valid evidence and receive the full mistake breakdown after analysis." },
          ] as const).map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => dispatch({ type: "setMode", mode: option.mode, seed: state.seed })}
              aria-pressed={state.mode === option.mode}
              className={`min-h-14 rounded-xl border p-2.5 text-left transition ${state.mode === option.mode ? "border-sky-700 bg-sky-50 ring-2 ring-sky-200" : "border-slate-200 bg-slate-50 hover:border-sky-400"}`}
            >
              <span className="block text-xs font-bold text-slate-900">{option.title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-slate-600">{option.copy}</span>
            </button>
          ))}
        </div>

        <details className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <summary className="cursor-pointer font-semibold text-slate-800">Aim, apparatus and success criteria</summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Aim</p>
              <p className="mt-0.5 leading-relaxed">{data.lab.aim}</p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-slate-500">Apparatus</p>
              <p className="mt-0.5 leading-relaxed">Retort stand and clamp, inextensible string, {data.bobs.map((bob) => bob.name).join(", ")}, metre rule, protractor, stopwatch.</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Success criteria</p>
              <ul className="mt-0.5 grid list-inside list-disc gap-0.5 leading-relaxed">
                {data.lab.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
              </ul>
            </div>
          </div>
        </details>
      </header>

      <PendulumRoom state={state} dispatch={dispatch} />
      <PendulumGraphs state={state} />

      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <PendulumPanel state={state} dispatch={dispatch} />
        <PendulumNotebook state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
