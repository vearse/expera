"use client";

import { useEffect, useState } from "react";
import {
  currentBob,
  currentGravity,
  stopwatchDisplay,
  type PendulumAction,
  type PendulumLabState,
} from "@/lib/sim/pendulumStore";

function Card({ eyebrow, title, aside, children }: { eyebrow: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700">{eyebrow}</p>
          <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="flex items-baseline justify-between gap-2 text-[11px] font-semibold text-slate-700">
        {label}
        {hint ? <span className="font-normal text-slate-500">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClass = "min-h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

export function PendulumPanel({ state, dispatch }: { state: PendulumLabState; dispatch: (action: PendulumAction) => void }) {
  const [method, setMethod] = useState<"centre" | "bottom">("centre");
  const [lengthText, setLengthText] = useState(state.params.stringLengthM.toFixed(2));
  const [angleText, setAngleText] = useState(state.params.releaseAngleDeg.toFixed(0));

  useEffect(() => setLengthText(state.params.stringLengthM.toFixed(2)), [state.params.stringLengthM]);
  useEffect(() => setAngleText(state.params.releaseAngleDeg.toFixed(0)), [state.params.releaseAngleDeg]);

  const commitLength = (raw: string) => {
    const value = Number.parseFloat(raw);
    if (Number.isFinite(value)) dispatch({ type: "setStringLength", value });
    setLengthText(state.params.stringLengthM.toFixed(2));
  };
  const commitAngle = (raw: string) => {
    const value = Number.parseFloat(raw);
    if (Number.isFinite(value)) dispatch({ type: "setReleaseAngle", value });
    setAngleText(state.params.releaseAngleDeg.toFixed(0));
  };
  const bob = currentBob(state);
  const gravity = currentGravity(state);
  const timingLocked = state.timing.phase === "waiting" || state.timing.phase === "timing" || state.timing.phase === "stopping";
  const readout = stopwatchDisplay(state);
  const feedbackTone = state.feedbackKind === "success"
    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
    : state.feedbackKind === "error"
      ? "border-rose-300 bg-rose-50 text-rose-950"
      : "border-sky-200 bg-sky-50 text-sky-950";
  const measured = state.measuredLength;
  const angle = state.measuredAngle;
  const releaseAngle = state.params.releaseAngleDeg;

  return (
    <div className="grid min-w-0 gap-2.5">
      <Card eyebrow="1 · Set up" title="Change one variable deliberately" aside={<span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">g = {gravity.accelerationMS2.toFixed(2)} m/s²</span>}>
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Pendulum bob" hint={`${(bob.massKg * 1000).toFixed(0)} g`}>
              <select
                value={state.params.bobId}
                onChange={(event) => dispatch({ type: "setBob", id: event.target.value })}
                className={inputClass}
                aria-label="Pendulum bob"
              >
                {state.data.bobs.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Gravity setting">
              <select
                value={state.params.gravityId}
                onChange={(event) => dispatch({ type: "setGravity", id: event.target.value })}
                className={inputClass}
                aria-label="Gravity setting"
              >
                {state.data.gravityPresets.map((option) => (
                  <option key={option.id} value={option.id}>{option.name} · {option.accelerationMS2.toFixed(2)} m/s²</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="String length" hint="0.20–1.50 m">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={state.data.length.minM}
                max={state.data.length.maxM}
                step={state.data.length.resolutionM}
                value={state.params.stringLengthM}
                onChange={(event) => dispatch({ type: "setStringLength", value: Number(event.target.value) })}
                className="min-w-0 flex-1 accent-sky-700"
                aria-label="String length slider in metres"
              />
              <div className="flex min-w-[7.2rem] items-center rounded-lg border border-slate-300 bg-slate-50 pl-2 shadow-sm">
                <input
                  type="number"
                  min={state.data.length.minM}
                  max={state.data.length.maxM}
                  step={state.data.length.resolutionM}
                  value={lengthText}
                  onChange={(event) => setLengthText(event.target.value)}
                  onBlur={(event) => commitLength(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
                  className="min-h-9 min-w-0 flex-1 bg-transparent text-sm font-semibold tabular-nums text-slate-900 outline-none"
                  aria-label="String length in metres"
                />
                <span className="pr-2 text-xs font-semibold text-slate-500">m</span>
              </div>
            </div>
          </Field>

          <Field label="Release angle" hint="small angles only for the simple model">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={state.data.angle.minDeg}
                max={state.data.angle.maxDeg}
                step={state.data.angle.resolutionDeg}
                value={state.params.releaseAngleDeg}
                onChange={(event) => dispatch({ type: "setReleaseAngle", value: Number(event.target.value) })}
                className="min-w-0 flex-1 accent-sky-700"
                aria-label="Release angle slider in degrees"
              />
              <div className="flex min-w-[7.2rem] items-center rounded-lg border border-slate-300 bg-slate-50 pl-2 shadow-sm">
                <input
                  type="number"
                  min={state.data.angle.minDeg}
                  max={state.data.angle.maxDeg}
                  step={state.data.angle.resolutionDeg}
                  value={angleText}
                  onChange={(event) => setAngleText(event.target.value)}
                  onBlur={(event) => commitAngle(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
                  className="min-h-9 min-w-0 flex-1 bg-transparent text-sm font-semibold tabular-nums text-slate-900 outline-none"
                  aria-label="Release angle in degrees"
                />
                <span className="pr-2 text-xs font-semibold text-slate-500">°</span>
              </div>
            </div>
          </Field>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Air resistance / damping</p>
              <p className="text-[10px] text-slate-500">{state.params.dampingOn ? "Amplitude decays; compare the period." : "Negligible damping for repeated timing."}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "setDamping", enabled: !state.params.dampingOn })}
              aria-pressed={state.params.dampingOn}
              className={`min-h-8 rounded-full px-3 text-[11px] font-bold shadow-sm transition ${state.params.dampingOn ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
            >
              {state.params.dampingOn ? "On" : "Off"}
            </button>
          </div>
        </div>
      </Card>

      <Card eyebrow="2 · Measure" title="Record your readings" aside={<span className="text-[10px] font-medium text-slate-500">not auto-filled</span>}>
        <div className="grid gap-2.5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="mb-1.5 text-[11px] font-semibold text-slate-800">Effective length method</p>
            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Length measurement method">
              {([
                ["centre", "Pivot → bob centre"],
                ["bottom", "Pivot → bob bottom"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  aria-pressed={method === value}
                  className={`min-h-8 rounded-md border px-2 text-[10.5px] font-semibold transition ${method === value ? "border-sky-600 bg-sky-700 text-white" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "measureLength", method })}
              className="mt-2 min-h-9 w-full rounded-lg bg-slate-900 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Measure effective length
            </button>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-500">Recorded L</span>
              <span className={`font-mono font-bold ${measured ? "text-slate-950" : "text-slate-400"}`}>{measured ? `${measured.measuredM.toFixed(3)} m` : "—"}</span>
            </div>
            {measured?.method === "bottom" && state.mode === "guided" ? (
              <p className="mt-1 rounded-md bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-800">This is systematically too long by one bob radius. Measure to the centre.</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-800">Release angle</p>
                <p className="text-[10px] text-slate-500">Read the protractor at the pivot.</p>
              </div>
              <span className={`font-mono text-xs font-bold ${angle ? "text-slate-950" : "text-slate-400"}`}>{angle ? `${angle.valueDeg.toFixed(1)}°` : "—"}</span>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "measureReleaseAngle" })}
              className="mt-2 min-h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-100"
            >
              Measure release angle
            </button>
          </div>
        </div>
      </Card>

      <Card eyebrow="3 · Time" title="Measure repeated oscillations" aside={<span className="rounded-full bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-sky-300">{readout} s</span>}>
        <div className="grid gap-2.5">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-slate-700">Number of oscillations</p>
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Number of oscillations">
              {state.data.timing.oscillationOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={timingLocked}
                  onClick={() => dispatch({ type: "setOscillations", n })}
                  aria-pressed={state.timing.n === n}
                  className={`min-h-8 rounded-md border text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${state.timing.n === n ? "border-sky-600 bg-sky-700 text-white" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                  {n === 1 ? "1 swing" : `${n} swings`}
                </button>
              ))}
            </div>
            {state.timing.n === 1 ? <p className="mt-1 text-[10px] font-medium text-amber-700">A single swing includes your full reaction-time error.</p> : null}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center shadow-inner">
            <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-slate-400">Simulated stopwatch</p>
            <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-emerald-300" aria-live="off">{readout}</p>
            <p className="mt-0.5 text-[9px] font-medium text-slate-400">
              {state.timing.phase === "waiting" ? "waiting for a centre crossing…" : state.timing.phase === "timing" ? `timing ${state.timing.n} oscillations…` : state.timing.phase === "complete" ? `T = ${(state.timing.periodS ?? 0).toFixed(3)} s` : timingLocked ? "stopping…" : "reads to " + state.data.stopwatch.resolutionS.toFixed(2) + " s"}
            </p>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "beginTiming" })}
              disabled={timingLocked}
              className="min-h-10 rounded-lg bg-sky-700 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {timingLocked ? "Timing in progress…" : `Release and time ${state.timing.n === 1 ? "one swing" : `${state.timing.n} oscillations`}`}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "recordRow" })}
              disabled={state.timing.phase !== "complete"}
              className="min-h-10 rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Record row in notebook
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "release" })}
              className="text-[10.5px] font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-800"
            >
              Reset swing only
            </button>
            <span className="text-[10px] text-slate-400">stopwatch resolution {state.data.stopwatch.resolutionS.toFixed(2)} s</span>
          </div>
        </div>
      </Card>

      <div className={`rounded-xl border px-3 py-2.5 text-xs shadow-sm ${feedbackTone}`} role="status" aria-live="polite">
        <div className="flex gap-2">
          <span className="material-symbols-outlined mt-0.5 text-[17px]" aria-hidden="true">
            {state.feedbackKind === "success" ? "check_circle" : state.feedbackKind === "error" ? "error" : "info"}
          </span>
          <p className="leading-relaxed">{state.feedback}</p>
        </div>
      </div>

      {state.mode === "guided" ? (
        <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50/70 px-3 py-2.5">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-sky-800">Guided reminders</p>
          <ol className="grid list-inside list-decimal gap-0.5 text-[10.5px] leading-relaxed text-sky-950">
            <li>Measure from the pivot to the centre of the bob.</li>
            <li>Read the release angle with the protractor before timing.</li>
            <li>Use 10 or 20 oscillations, and start/stop at centre crossings.</li>
            <li>Collect five lengths at the same gravity before plotting T² against L.</li>
            <li>Keep mass and amplitude controlled when investigating another variable.</li>
          </ol>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 px-3 py-2.5 text-[10.5px] leading-relaxed text-amber-950">
          <strong>Independent task.</strong> Hints are hidden. Keep the angle small, choose clean controls, record enough repeated-swing timings and use one gravity setting for your final graph. Your mistake breakdown appears after analysis.
        </div>
      )}
      <p className="text-[10px] text-slate-500">Current setup: {bob.name}, {releaseAngle.toFixed(0)}°, {state.params.dampingOn ? "damping on" : "damping off"}. Angle and length are measured, not copied from the setup sliders.</p>
    </div>
  );
}
