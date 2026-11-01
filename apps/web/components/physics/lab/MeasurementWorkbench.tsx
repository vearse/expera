"use client";

import { useEffect } from "react";
import type { PhysicsData, PhysicsStation, PhysicsStationId } from "@/lib/content/physics";
import type { PhysicsAction, PhysicsEntry, PhysicsLabState } from "@/lib/sim/physicsMeasurementStore";
import type { PhysicsRoomProps } from "./PhysicsLabRoom";

type Props = {
  state: PhysicsLabState;
  data: PhysicsData;
  station: PhysicsStation;
  entry: PhysicsEntry | null;
  readings: Pick<PhysicsRoomProps, "vernier" | "micrometer" | "rule" | "stopwatch" | "parallax" | "solid" | "liquid">;
  dispatch: (action: PhysicsAction) => void;
};

function ValueRow({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "accent" | "good" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 py-1.5 last:border-0">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className={`font-mono text-sm font-semibold tabular-nums ${tone === "accent" ? "text-sky-700" : tone === "good" ? "text-emerald-700" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function Nudge({ label, onNudge, disabled }: { label: string; onNudge: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onNudge}
      disabled={disabled}
      className="min-h-9 rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-700 transition hover:border-sky-500 hover:text-sky-800 disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function ActionButton({ children, onClick, variant = "primary", disabled }: { children: React.ReactNode; onClick: () => void; variant?: "primary" | "secondary" | "ghost"; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        variant === "primary"
          ? "min-h-10 rounded-lg bg-slate-900 px-3.5 text-xs font-bold text-white transition hover:bg-sky-800 disabled:opacity-40"
          : variant === "secondary"
            ? "min-h-10 rounded-lg border border-sky-800 bg-sky-50 px-3.5 text-xs font-bold text-sky-900 transition hover:bg-sky-100 disabled:opacity-40"
            : "min-h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-slate-500 disabled:opacity-40"
      }
    >
      {children}
    </button>
  );
}

function VernierControls({ state, readings, dispatch }: Props) {
  const reading = readings.vernier;
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <ValueRow label="Main scale" value={`${reading.mainScaleMm.toFixed(1)} mm`} />
        <ValueRow label="Coinciding division" value={`${reading.vernierDivision} div`} />
        <ValueRow label="Observed length" value={`${reading.displayCm.toFixed(2)} cm`} tone="accent" />
        <ValueRow label="Zero-error correction" value={`${reading.zeroErrorMm.toFixed(1)} mm`} />
        <ValueRow label="Corrected length" value={`${(reading.correctedMm / 10).toFixed(2)} cm`} tone="good" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Nudge label="−0.1 mm" onNudge={() => dispatch({ type: "nudgeVernier", steps: -1 })} />
        <input
          aria-label="Vernier jaw gap in millimetres"
          type="range"
          min={0}
          max={state.data.instruments.vernier.rangeMm}
          step={state.data.instruments.vernier.leastCountMm}
          value={state.vernier.jawGapMm}
          onChange={(event) => dispatch({ type: "setVernierJaw", value: Number(event.target.value) })}
          className="min-w-32 flex-1 accent-sky-600"
        />
        <Nudge label="+0.1 mm" onNudge={() => dispatch({ type: "nudgeVernier", steps: 1 })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={() => dispatch({ type: "closeVernierSample" })}>Close gently on the rod</ActionButton>
        <span className="self-center font-mono text-[11px] text-slate-500">jaw gap {state.vernier.jawGapMm.toFixed(1)} mm</span>
      </div>
    </div>
  );
}

function MicrometerControls({ state, readings, dispatch }: Props) {
  const reading = readings.micrometer;
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <ValueRow label="Sleeve reading" value={`${reading.sleeveMm.toFixed(1)} mm`} />
        <ValueRow label="Thimble division" value={`${reading.thimbleDivision} div`} />
        <ValueRow label="Observed thickness" value={`${reading.observedMm.toFixed(2)} mm`} tone="accent" />
        <ValueRow label="Zero error" value={`${reading.zeroErrorMm.toFixed(2)} mm`} />
        <ValueRow label="Corrected thickness" value={`${reading.correctedMm.toFixed(2)} mm`} tone="good" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Nudge label="−0.01 mm" onNudge={() => dispatch({ type: "nudgeMicrometer", steps: -1 })} />
        <input
          aria-label="Micrometer spindle gap in millimetres"
          type="range"
          min={0}
          max={state.data.instruments.micrometer.rangeMm}
          step={state.data.instruments.micrometer.leastCountMm}
          value={state.micrometer.spindleGapMm}
          onChange={(event) => dispatch({ type: "setMicrometerSpindle", value: Number(event.target.value) })}
          className="min-w-32 flex-1 accent-sky-600"
        />
        <Nudge label="+0.01 mm" onNudge={() => dispatch({ type: "nudgeMicrometer", steps: 1 })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={() => dispatch({ type: "closeMicrometerSample" })}>Use the ratchet on the gauge</ActionButton>
        <span className="self-center font-mono text-[11px] text-slate-500">spindle {state.micrometer.spindleGapMm.toFixed(2)} mm</span>
      </div>
    </div>
  );
}

function RuleControls({ state, readings, dispatch }: Props) {
  const reading = readings.rule;
  const max = state.data.instruments.metreRule.lengthCm;
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <ValueRow label="Start mark" value={`${reading.startCm.toFixed(1)} cm`} />
        <ValueRow label="End mark" value={`${reading.endCm.toFixed(1)} cm`} />
        <ValueRow label="Measured length" value={`${reading.lengthCm.toFixed(1)} cm`} tone="good" />
        <ValueRow label="Worn-zero region" value={`0.0–${state.data.instruments.metreRule.wornZeroOffsetCm.toFixed(1)} cm`} />
      </div>
      <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
        Start mark
        <input
          aria-label="Metre rule start mark in centimetres"
          type="range"
          min={0}
          max={max}
          step={0.1}
          value={state.rule.startCm}
          onChange={(event) => dispatch({ type: "setRuleStart", value: Number(event.target.value) })}
          className="accent-amber-500"
        />
      </label>
      <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
        End mark
        <input
          aria-label="Metre rule end mark in centimetres"
          type="range"
          min={0}
          max={max}
          step={0.1}
          value={state.rule.endCm}
          onChange={(event) => dispatch({ type: "setRuleEnd", value: Number(event.target.value) })}
          className="accent-amber-500"
        />
      </label>
      <ActionButton onClick={() => dispatch({ type: "placeRuleSample" })} variant="secondary">Place the wire away from the worn end</ActionButton>
    </div>
  );
}

function StopwatchControls({ state, readings, dispatch }: Props) {
  const reading = readings.stopwatch;
  const target = state.data.samples.stopwatch.targetSeconds;
  const inWindow = Math.abs(reading.seconds - target) <= 0.1;
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-slate-200 bg-slate-950 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Stopwatch display</p>
        <div className="mt-1 font-mono text-4xl font-bold tabular-nums text-amber-300" aria-live="off">{reading.display}<span className="ml-1 text-lg text-amber-500">s</span></div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>resolution {state.data.instruments.stopwatch.resolutionS.toFixed(2)} s</span>
          <span className={state.stopwatch.running ? "text-emerald-300" : ""}>{state.stopwatch.running ? "RUNNING" : "STOPPED"}</span>
        </div>
      </div>
      {state.mode === "guided" ? (
        <p className="text-[11px] text-slate-500">Guided event window: stop between {(target - 0.1).toFixed(2)} s and {(target + 0.1).toFixed(2)} s. {inWindow ? "You are inside the window." : "Keep watching the event."}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={() => dispatch({ type: "startStopwatch" })} disabled={state.stopwatch.running}>Start</ActionButton>
        <ActionButton onClick={() => dispatch({ type: "stopStopwatch" })} variant="secondary" disabled={!state.stopwatch.running}>Stop at the event</ActionButton>
        <ActionButton onClick={() => dispatch({ type: "resetStopwatch" })} variant="ghost">Reset</ActionButton>
      </div>
    </div>
  );
}

function ParallaxControls({ state, readings, dispatch }: Props) {
  const reading = readings.parallax;
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <ValueRow label="Eye offset" value={`${reading.eyeOffsetMm.toFixed(1)} mm`} />
        <ValueRow label="True scale reading" value={`${reading.trueReadingMm.toFixed(1)} mm`} />
        <ValueRow label="Observed reading" value={`${reading.observedMm.toFixed(1)} mm`} tone="accent" />
        <ValueRow label="Parallax shift" value={`${reading.shiftMm.toFixed(1)} mm`} tone={reading.aligned ? "good" : "default"} />
      </div>
      <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
        Move your eye sideways
        <input
          aria-label="Eye offset from the pointer in millimetres"
          type="range"
          min={-12}
          max={12}
          step={0.1}
          value={state.parallax.eyeOffsetMm}
          onChange={(event) => dispatch({ type: "setEyeOffset", value: Number(event.target.value) })}
          className="accent-cyan-600"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={() => dispatch({ type: "alignEye" })} variant="secondary">Align eye with pointer</ActionButton>
        <span className={`self-center text-[11px] font-semibold ${reading.aligned ? "text-emerald-700" : "text-amber-700"}`}>{reading.aligned ? "No parallax shift" : "Pointer appears shifted"}</span>
      </div>
    </div>
  );
}

function DensityControls({ state, readings, dispatch }: Props) {
  const { solid, liquid } = readings;
  const solidReady = state.density.solidDiameterMm > 0 && state.density.solidHeightMm > 0 && state.density.solidMassG > 0;
  const liquidReady = state.density.emptyMassG > 0 && state.density.filledMassG > 0 && state.density.liquidVolumeMl > 0;
  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Solid sample</p>
          <ValueRow label="Mass" value={`${state.density.solidMassG.toFixed(1)} g`} />
          <ValueRow label="Diameter" value={`${state.density.solidDiameterMm.toFixed(1)} mm`} />
          <ValueRow label="Height" value={`${state.density.solidHeightMm.toFixed(1)} mm`} />
          <ValueRow label="Volume" value={solidReady ? `${solid.volumeCm3.toFixed(2)} cm³` : "—"} />
          <ValueRow label="Density" value={solidReady ? `${solid.densityGCm3.toFixed(2)} g/cm³` : "—"} tone="good" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Liquid sample</p>
          <ValueRow label="Empty cylinder" value={`${state.density.emptyMassG.toFixed(1)} g`} />
          <ValueRow label="Filled cylinder" value={`${state.density.filledMassG.toFixed(1)} g`} />
          <ValueRow label="Liquid volume" value={`${state.density.liquidVolumeMl.toFixed(0)} cm³`} />
          <ValueRow label="Liquid density" value={liquidReady ? `${liquid.densityGCm3.toFixed(2)} g/cm³` : "—"} tone="good" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton onClick={() => dispatch({ type: "measureSolidDiameter" })} variant="secondary">Measure diameter</ActionButton>
        <ActionButton onClick={() => dispatch({ type: "measureSolidHeight" })} variant="secondary">Measure height</ActionButton>
        <ActionButton onClick={() => dispatch({ type: "measureSolidMass" })} variant="secondary">Weigh solid</ActionButton>
        <ActionButton onClick={() => dispatch({ type: "measureEmptyCylinder" })} variant="secondary">Weigh empty cylinder</ActionButton>
        <ActionButton onClick={() => dispatch({ type: "measureFilledCylinder" })} variant="secondary">Weigh filled cylinder</ActionButton>
        <ActionButton onClick={() => dispatch({ type: "resetDensity" })} variant="ghost">Reset measurements</ActionButton>
      </div>
      <p className="text-[11px] text-slate-500">Use the same balance for both mass measurements and read the cylinder at eye level.</p>
    </div>
  );
}

export function MeasurementWorkbench({ state, data, station, entry, readings, dispatch }: Props) {
  useEffect(() => {
    if (!state.stopwatch.running) return;
    const timer = window.setInterval(() => dispatch({ type: "tickStopwatch", deltaMs: 50 }), 50);
    return () => window.clearInterval(timer);
  }, [dispatch, state.stopwatch.running]);

  const nextStation = data.stations[(data.stations.findIndex((item) => item.id === station.id) + 1) % data.stations.length];
  const complete = state.completedStations.includes(station.id);

  return (
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" aria-label="Measurement workbench">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">Measurement workbench</p>
          <h2 className="mt-0.5 text-lg font-bold text-slate-900">{station.title}</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-slate-500">{station.summary}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${complete ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-amber-300 bg-amber-50 text-amber-800"}`}>
          {complete ? "Station complete" : "In progress"}
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Measurement stations">
        {data.stations.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === station.id}
            onClick={() => dispatch({ type: "selectStation", id: item.id })}
            className={`min-h-9 whitespace-nowrap rounded-lg px-2.5 text-[11px] font-semibold transition ${item.id === station.id ? "bg-slate-900 text-white" : state.completedStations.includes(item.id) ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {state.completedStations.includes(item.id) ? "✓ " : ""}{item.short}
          </button>
        ))}
      </div>

      {state.mode === "guided" && station.hint ? (
        <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-950"><strong>Hint:</strong> {station.hint}</p>
      ) : null}

      {station.id === "vernier" ? <VernierControls state={state} data={data} station={station} entry={entry} readings={readings} dispatch={dispatch} /> : null}
      {station.id === "micrometer" ? <MicrometerControls state={state} data={data} station={station} entry={entry} readings={readings} dispatch={dispatch} /> : null}
      {station.id === "metre-rule" ? <RuleControls state={state} data={data} station={station} entry={entry} readings={readings} dispatch={dispatch} /> : null}
      {station.id === "stopwatch" ? <StopwatchControls state={state} data={data} station={station} entry={entry} readings={readings} dispatch={dispatch} /> : null}
      {station.id === "parallax" ? <ParallaxControls state={state} data={data} station={station} entry={entry} readings={readings} dispatch={dispatch} /> : null}
      {station.id === "density" ? <DensityControls state={state} data={data} station={station} entry={entry} readings={readings} dispatch={dispatch} /> : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
        <ActionButton onClick={() => dispatch({ type: "recordReading", at: new Date().toISOString() })}>Record reading in notebook</ActionButton>
        <ActionButton onClick={() => dispatch({ type: "resetStation" })} variant="ghost">Reset apparatus</ActionButton>
        <button type="button" onClick={() => dispatch({ type: "selectStation", id: nextStation.id })} className="ml-auto min-h-9 text-xs font-semibold text-sky-700 underline-offset-4 hover:underline">
          Next: {nextStation.title} →
        </button>
      </div>

      <div role="status" aria-live="polite" className={`rounded-lg border px-3 py-2 text-xs ${state.feedbackKind === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : state.feedbackKind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
        {state.feedback}
      </div>
      {entry && entry.readings.length > 0 ? <p className="text-[11px] text-slate-500">Notebook draft: {entry.readings.length} instrument reading{entry.readings.length === 1 ? "" : "s"} recorded. Complete the observation and save it in the notebook.</p> : null}
    </section>
  );
}
