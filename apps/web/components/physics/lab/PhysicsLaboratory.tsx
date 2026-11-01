"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { ReviewBadge } from "@/components/ui";
import type { PhysicsData, PhysicsStationId } from "@/lib/content/physics";
import type { Apparatus } from "@/lib/content/schemas";
import {
  createPhysicsMeasurementStore,
  currentEntry,
  currentLiquidDensity,
  currentMicrometer,
  currentParallax,
  currentRule,
  currentSolidDensity,
  currentStation,
  currentStopwatch,
  currentVernier,
  examBreakdown,
  type PhysicsAction,
  type PhysicsStore,
} from "@/lib/sim/physicsMeasurementStore";
import { MeasurementWorkbench } from "./MeasurementWorkbench";
import { PhysicsLabRoom } from "./PhysicsLabRoom";
import { PhysicsNotebook } from "./PhysicsNotebook";
import { ApparatusGuide } from "@/components/lab/ApparatusGuide";

export function PhysicsLaboratory({ data, apparatus }: { data: PhysicsData; apparatus: Apparatus[] }) {
  const store = useMemo(() => createPhysicsMeasurementStore(data, 1), [data]);
  const state = useStore(store) as PhysicsStore;
  const [ready, setReady] = useState(false);
  const [inspectedId, setInspectedId] = useState<PhysicsStationId | null>(null);
  useEffect(() => setReady(true), []);
  const station = currentStation(state);
  const entry = currentEntry(state);
  const breakdown = examBreakdown(state);
  const readings = {
    vernier: currentVernier(state),
    micrometer: currentMicrometer(state),
    rule: currentRule(state),
    stopwatch: currentStopwatch(state),
    parallax: currentParallax(state),
    solid: currentSolidDensity(state),
    liquid: currentLiquidDensity(state),
  };
  const dispatch = (action: PhysicsAction) => store.getState().dispatch(action);
  const completed = state.completedStations.length;
  const percent = Math.round((completed / data.stations.length) * 100);
  const guide = inspectedId ? apparatus.find((item) => item.id === inspectedId) ?? null : null;
  const selectStation = (id: PhysicsStationId) => {
    dispatch({ type: "selectStation", id });
    setInspectedId(id);
  };

  return (
    <div data-lab-ready={ready ? "true" : "false"} className="mx-auto grid max-w-7xl gap-4 px-3 pb-20 pt-5 sm:px-6">
      <header className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/physics" className="text-xs font-semibold text-sky-700 underline-offset-4 hover:underline">← Physics subject hub</Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">Physics · Wave 1 practical</p>
              <ReviewBadge status={data.review} />
            </div>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{data.lab.title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{data.lab.summary}</p>
          </div>
          <div className="min-w-44 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <span>Practical progress</span>
              <span>{percent}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600">{completed} of {data.stations.length} stations verified · {breakdown.saved} saved</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {([
            { mode: "guided", title: "Guided practice", copy: "Hints and immediate instrument feedback. Retry without penalty." },
            { mode: "independent", title: "Independent assessment", copy: "No procedural hints. Save evidence and receive a mistake breakdown." },
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
      </header>

      <PhysicsLabRoom
        activeStationId={state.activeStationId}
        stations={data.stations}
        completedStations={state.completedStations}
        mode={state.mode}
        vernier={readings.vernier}
        micrometer={readings.micrometer}
        rule={readings.rule}
        stopwatch={readings.stopwatch}
        parallax={readings.parallax}
        solid={readings.solid}
        liquid={readings.liquid}
        guide={guide}
        onDismissGuide={() => setInspectedId(null)}
        onSelectStation={selectStation}
      />

      {guide ? <ApparatusGuide item={guide} onClose={() => setInspectedId(null)} /> : null}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <MeasurementWorkbench state={state} data={data} station={station} entry={entry} readings={readings} dispatch={dispatch} />
        <PhysicsNotebook state={state} data={data} station={station} entry={entry} dispatch={dispatch} />
      </div>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Practical completion summary">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">Lab record</p>
            <h2 className="text-lg font-bold text-slate-900">Measurement evidence checklist</h2>
            <p className="text-xs text-slate-500">A station is complete only when its recorded reading and observation pass the checks.</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${completed === data.stations.length ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"}`}>
            {completed === data.stations.length ? "All stations complete" : `${data.stations.length - completed} remaining`}
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.stations.map((item) => {
            const done = state.completedStations.includes(item.id);
            const check = breakdown.stationChecks.find((entryCheck) => entryCheck.stationId === item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectStation(item.id)}
                className={`min-h-16 rounded-xl border p-2.5 text-left transition ${item.id === state.activeStationId ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-slate-400"}`}
              >
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className={`inline-block size-2 rounded-full ${done ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {item.title}
                </span>
                <span className="mt-1 block text-[10px] leading-snug text-slate-500">
                  {done ? "Verified and saved" : check?.ok ? "Checks pass — save the notebook entry" : check?.mistakes[0] ?? "Not recorded yet"}
                </span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
          {data.lab.criteria.map((criterion) => (
            <p key={criterion} className="flex gap-1.5 text-[11px] leading-relaxed text-slate-600"><span className="text-sky-600" aria-hidden>✓</span>{criterion}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
