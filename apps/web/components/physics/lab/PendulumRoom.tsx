"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectWebGL } from "@/lib/device";
import {
  currentBob,
  currentEffectiveLengthM,
  currentGravity,
  stopwatchDisplay,
  type PendulumAction,
  type PendulumLabState,
} from "@/lib/sim/pendulumStore";
import type { PendulumRigProps } from "@/components/sim3d/physics/PendulumRig";

const PendulumRig = dynamic<PendulumRigProps>(() => import("@/components/sim3d/physics/PendulumRig"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[430px] place-items-center rounded-2xl border border-slate-300 bg-slate-100 text-sm text-slate-500 sm:h-[560px]">
      Preparing the 3D laboratory…
    </div>
  ),
});

function PendulumBench2D({ state }: { state: PendulumLabState }) {
  const bob = currentBob(state);
  const gravity = currentGravity(state);
  const effectiveLengthM = currentEffectiveLengthM(state);
  const pivotX = 432;
  const pivotY = 92;
  const lengthScale = 198;
  const lengthPx = effectiveLengthM * lengthScale;
  const thetaDeg = (state.simulation.thetaRad * 180) / Math.PI;
  const bobRadius = Math.max(10, bob.radiusM * 330);
  const bobX = pivotX + Math.sin(state.simulation.thetaRad) * lengthPx;
  const bobY = pivotY + Math.cos(state.simulation.thetaRad) * lengthPx;
  const measuredLengthM = state.measuredLength?.measuredM ?? null;
  const measuredPx = (measuredLengthM ?? effectiveLengthM) * lengthScale;
  const arcRadius = 58;
  const arcEndX = pivotX + Math.sin(state.simulation.thetaRad) * arcRadius;
  const arcEndY = pivotY + Math.cos(state.simulation.thetaRad) * arcRadius;
  const statusLabel = state.simulation.running ? "Swinging" : state.timing.phase === "complete" ? "Timing complete" : "Ready to release";
  const ticks = Array.from({ length: 13 }, (_, index) => -30 + index * 5);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-[#d9e7f0] shadow-lg" aria-label="2D laboratory side view of the simple pendulum. The same controls and timing work in this view.">
      <svg viewBox="0 0 900 470" className="h-[430px] w-full sm:h-[560px]" role="img" aria-label={`2D laboratory side view. Simple pendulum with a ${bob.name}, effective length ${effectiveLengthM.toFixed(2)} metres, at ${thetaDeg.toFixed(1)} degrees.`}>
        <defs>
          <linearGradient id="pendulum-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8f1f7" />
            <stop offset="1" stopColor="#d3e2ed" />
          </linearGradient>
          <linearGradient id="pendulum-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5f9fc" />
            <stop offset="1" stopColor="#e5eef6" />
          </linearGradient>
          <radialGradient id="pendulum-bob" cx="0.34" cy="0.28" r="0.78">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.82" />
            <stop offset="0.34" stopColor={bob.colour} />
            <stop offset="1" stopColor="#1e293b" stopOpacity="0.82" />
          </radialGradient>
          <filter id="pendulum-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#1e293b" floodOpacity="0.24" />
          </filter>
          <pattern id="pendulum-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#b7c9d7" strokeWidth="1" opacity="0.38" />
          </pattern>
        </defs>

        <rect width="900" height="360" fill="url(#pendulum-wall)" />
        <rect width="900" height="360" fill="url(#pendulum-grid)" />
        <rect y="360" width="900" height="110" fill="url(#pendulum-floor)" />
        <line x1="0" y1="360" x2="900" y2="360" stroke="#aebfcc" strokeWidth="2" />

        <g opacity="0.9">
          <text x="34" y="42" fill="#0f172a" fontSize="17" fontWeight="800" letterSpacing="1.3">EXPERA PHYSICS LABORATORY</text>
          <text x="34" y="61" fill="#64748b" fontSize="10" fontWeight="700" letterSpacing="1.2">SIMPLE PENDULUM · OSCILLATIONS</text>
        </g>

        <g transform="translate(660 22)">
          <rect width="210" height="64" rx="12" fill="#0f172a" />
          <rect x="8" y="8" width="194" height="48" rx="8" fill="#111c2e" stroke="#334155" />
          <text x="20" y="28" fill="#94a3b8" fontSize="8" fontWeight="700" letterSpacing="1.2">STOPWATCH · {state.timing.n} OSCILLATIONS</text>
          <text x="20" y="50" fill="#7dd3fc" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="23" fontWeight="700">{stopwatchDisplay(state)} s</text>
          <circle cx="190" cy="38" r="5" fill={state.simulation.running ? "#f59e0b" : state.timing.phase === "complete" ? "#34d399" : "#475569"} />
        </g>

        <g transform="translate(34 22)" opacity="0.95">
          <rect width="170" height="28" rx="14" fill="#ffffff" stroke="#cbd5e1" />
          <circle cx="15" cy="14" r="4" fill={state.mode === "guided" ? "#0ea5e9" : "#f59e0b"} />
          <text x="27" y="18" fill="#334155" fontSize="10" fontWeight="700">{state.mode === "guided" ? "GUIDED PRACTICE" : "INDEPENDENT TASK"}</text>
        </g>

        <g filter="url(#pendulum-shadow)">
          <rect x="242" y="366" width="320" height="18" rx="6" fill="#334155" />
          <rect x="250" y="102" width="18" height="270" rx="6" fill="#94a3b8" />
          <rect x="250" y="86" width="182" height="15" rx="6" fill="#cbd5e1" />
          <rect x="248" y="72" width="42" height="36" rx="5" fill="#475569" />
        </g>
        <rect x="244" y="394" width="316" height="13" rx="4" fill="#1e293b" opacity="0.2" />

        <g transform={`translate(${pivotX} ${pivotY})`}>
          <circle r="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
          {ticks.map((tick) => {
            const radians = (tick * Math.PI) / 180;
            const major = tick % 10 === 0;
            return (
              <line
                key={tick}
                x1={Math.sin(radians) * 51}
                y1={Math.cos(radians) * 51}
                x2={Math.sin(radians) * (major ? 64 : 58)}
                y2={Math.cos(radians) * (major ? 64 : 58)}
                stroke="#64748b"
                strokeWidth={major ? 1.6 : 1}
              />
            );
          })}
          <path
            d={`M 0 ${arcRadius} A ${arcRadius} ${arcRadius} 0 0 ${thetaDeg >= 0 ? 1 : 0} ${arcEndX - pivotX} ${arcEndY - pivotY}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1={0}
            y1={0}
            x2={Math.sin(state.simulation.thetaRad) * lengthPx}
            y2={Math.cos(state.simulation.thetaRad) * lengthPx}
            stroke="#475569"
            strokeWidth="1.8"
          />
          <circle cx={Math.sin(state.simulation.thetaRad) * lengthPx} cy={Math.cos(state.simulation.thetaRad) * lengthPx} r={bobRadius} fill="url(#pendulum-bob)" stroke="#0f172a" strokeOpacity="0.42" strokeWidth="1.2" />
          <circle cx={Math.sin(state.simulation.thetaRad) * lengthPx - bobRadius * 0.25} cy={Math.cos(state.simulation.thetaRad) * lengthPx - bobRadius * 0.3} r={bobRadius * 0.28} fill="#ffffff" opacity="0.48" />
        </g>

        <text x={pivotX + (thetaDeg >= 0 ? 22 : -22)} y={pivotY + 70} fill="#0284c7" fontSize="11" fontWeight="800" textAnchor={thetaDeg >= 0 ? "start" : "end"}>θ = {thetaDeg.toFixed(1)}°</text>
        <text x={pivotX + 14} y={pivotY + 24} fill="#64748b" fontSize="9" fontWeight="700">PIVOT</text>

        <ellipse cx={bobX + 16} cy={379} rx={bobRadius * 1.25} ry="7" fill="#0f172a" opacity={0.13 + Math.min(0.12, Math.abs(Math.sin(state.simulation.thetaRad)) * 0.12)} />
        <line x1={bobX} y1={bobY} x2={bobX + 18} y2={378} stroke="#0f172a" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="3 4" />

        <g transform="translate(742 78)">
          <rect width="54" height="292" rx="6" fill="#fcd34d" stroke="#b45309" strokeWidth="1.4" />
          {Array.from({ length: 31 }).map((_, index) => (
            <g key={index}>
              <line x1="7" y1={12 + index * 8.8} x2={index % 10 === 0 ? 25 : index % 5 === 0 ? 20 : 14} y2={12 + index * 8.8} stroke="#78350f" strokeWidth={index % 10 === 0 ? 1.5 : 1} />
              {index % 10 === 0 ? <text x="30" y={15 + index * 8.8} fill="#78350f" fontSize="7">{index / 10}</text> : null}
            </g>
          ))}
          <line x1="2" y1={12 + (measuredPx / lengthScale) * 88} x2="52" y2={12 + (measuredPx / lengthScale) * 88} stroke="#dc2626" strokeWidth="2.4" />
          <text x="27" y="310" fill="#78350f" fontSize="8.5" fontWeight="800" textAnchor="middle">metre rule</text>
        </g>
        <g transform="translate(678 150)">
          <rect width="46" height="32" rx="7" fill="#ffffff" stroke="#cbd5e1" />
          <text x="23" y="14" fill="#64748b" fontSize="7.5" fontWeight="800" textAnchor="middle">MEASURED L</text>
          <text x="23" y="26" fill="#0f172a" fontSize="10" fontWeight="800" textAnchor="middle">{measuredLengthM === null ? "—" : `${measuredLengthM.toFixed(3)} m`}</text>
        </g>

        <g transform="translate(34 404)">
          <rect width="234" height="42" rx="10" fill="#ffffff" stroke="#cbd5e1" />
          <text x="13" y="17" fill="#64748b" fontSize="8" fontWeight="800" letterSpacing="0.8">CURRENT SETUP</text>
          <text x="13" y="32" fill="#0f172a" fontSize="10.5" fontWeight="700">{bob.name} · L = {effectiveLengthM.toFixed(3)} m</text>
          <text x="168" y="32" fill="#64748b" fontSize="9">{gravity.name}</text>
        </g>

        <g transform="translate(286 404)">
          <rect width="170" height="42" rx="10" fill={state.simulation.running ? "#ecfeff" : "#ffffff"} stroke={state.simulation.running ? "#67e8f9" : "#cbd5e1"} />
          <circle cx="17" cy="21" r="5" fill={state.simulation.running ? "#f59e0b" : state.timing.phase === "complete" ? "#10b981" : "#94a3b8"} />
          <text x="30" y="18" fill="#64748b" fontSize="8" fontWeight="800" letterSpacing="0.7">STATUS</text>
          <text x="30" y="31" fill="#0f172a" fontSize="10.5" fontWeight="700">{statusLabel}</text>
        </g>

        <g transform="translate(470 404)">
          <rect width="396" height="42" rx="10" fill="#ffffff" stroke="#cbd5e1" />
          <text x="13" y="17" fill="#64748b" fontSize="8" fontWeight="800" letterSpacing="0.7">SCIENTIFIC MODEL</text>
          <text x="13" y="32" fill="#334155" fontSize="10.2">RK4 integration of θ″ = −(g/L) sin θ {state.params.dampingOn ? "− cθ′" : ""}</text>
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-lg backdrop-blur">
          Side view drawn from the same simulation state as the 3D laboratory
        </div>
        <div className="pointer-events-auto rounded-lg border border-sky-200 bg-sky-50/95 px-3 py-2 text-[11px] font-semibold text-sky-800 shadow-lg backdrop-blur">
          {state.simulation.running ? "Live physics" : "Paused"}
        </div>
      </div>
    </div>
  );
}

export function PendulumRoom({ state }: { state: PendulumLabState; dispatch: (action: PendulumAction) => void }) {
  const [view, setView] = useState<"3d" | "2d">("2d");
  const [supports3d, setSupports3d] = useState(false);

  useEffect(() => {
    const supported = detectWebGL();
    setSupports3d(supported);
    if (supported) setView("3d");
  }, []);

  return (
    <section className="min-w-0" aria-label="Pendulum laboratory room">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">Practical room</p>
          <p className="text-xs text-slate-500">Watch the real equations drive the bob, then time the centre crossings.</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm" role="group" aria-label="Laboratory view">
          <button
            type="button"
            onClick={() => setView("3d")}
            disabled={!supports3d}
            aria-pressed={view === "3d"}
            className={`min-h-8 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${view === "3d" ? "bg-sky-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            3D laboratory
          </button>
          <button
            type="button"
            onClick={() => setView("2d")}
            aria-pressed={view === "2d"}
            className={`min-h-8 rounded-lg px-3 text-xs font-semibold transition ${view === "2d" ? "bg-sky-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            2D bench
          </button>
        </div>
      </div>
      {view === "3d" && supports3d ? <PendulumRig state={state} /> : <PendulumBench2D state={state} />}
    </section>
  );
}
