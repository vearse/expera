"use client";

import type { PendulumLabState } from "@/lib/sim/pendulumStore";
import { graphRows } from "@/lib/sim/pendulumStore";

const WIDTH = 440;
const HEIGHT = 230;
const PAD = { left: 44, right: 16, top: 20, bottom: 34 };

function axisX(value: number, min: number, max: number): number {
  const span = max - min || 1;
  return PAD.left + ((value - min) / span) * (WIDTH - PAD.left - PAD.right);
}

function axisY(value: number, min: number, max: number): number {
  const span = max - min || 1;
  return HEIGHT - PAD.bottom - ((value - min) / span) * (HEIGHT - PAD.top - PAD.bottom);
}

function Grid({ xTicks, yTicks, xMin, xMax, yMin, yMax, xLabel, yLabel }: { xTicks: number[]; yTicks: number[]; xMin: number; xMax: number; yMin: number; yMax: number; xLabel: string; yLabel: string }) {
  return (
    <>
      {xTicks.map((tick) => (
        <g key={`x-${tick}`}>
          <line x1={axisX(tick, xMin, xMax)} y1={PAD.top} x2={axisX(tick, xMin, xMax)} y2={HEIGHT - PAD.bottom} stroke="#e2e8f0" strokeWidth="1" />
          <text x={axisX(tick, xMin, xMax)} y={HEIGHT - PAD.bottom + 15} textAnchor="middle" fontSize="9" fill="#64748b">{tick}</text>
        </g>
      ))}
      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
          <line x1={PAD.left} y1={axisY(tick, yMin, yMax)} x2={WIDTH - PAD.right} y2={axisY(tick, yMin, yMax)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={PAD.left - 7} y={axisY(tick, yMin, yMax) + 3} textAnchor="end" fontSize="9" fill="#64748b">{tick}</text>
        </g>
      ))}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={HEIGHT - PAD.bottom} stroke="#0f172a" strokeWidth="1.5" />
      <line x1={PAD.left} y1={HEIGHT - PAD.bottom} x2={WIDTH - PAD.right} y2={HEIGHT - PAD.bottom} stroke="#0f172a" strokeWidth="1.5" />
      <text x={WIDTH - PAD.right} y={HEIGHT - 5} textAnchor="end" fontSize="10" fontWeight="700" fill="#334155">{xLabel}</text>
      <text x={11} y={PAD.top + 3} fontSize="10" fontWeight="700" fill="#334155">{yLabel}</text>
    </>
  );
}

function AngleTimeGraph({ state }: { state: PendulumLabState }) {
  const trace = state.simulation.trace;
  const maxTime = Math.max(1, trace[trace.length - 1]?.timeS ?? 1);
  const maxAngle = Math.max(5, ...trace.map((point) => Math.abs(point.thetaDeg)));
  const yMax = Math.ceil(maxAngle / 5) * 5;
  const yMin = -yMax;
  const last = trace[trace.length - 1];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Live angle–time graph</p>
        <span className="font-mono text-[10px] text-slate-500">{last ? `${last.thetaDeg.toFixed(1)}° at ${last.timeS.toFixed(2)} s` : "release the bob"}</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Live angle against time graph for the swinging pendulum.">
        <rect x={PAD.left} y={PAD.top} width={WIDTH - PAD.left - PAD.right} height={HEIGHT - PAD.top - PAD.bottom} fill="#f8fafc" />
        <Grid xTicks={[0, maxTime / 4, maxTime / 2, (3 * maxTime) / 4, maxTime].map((tick) => Number(tick.toFixed(1)))} yTicks={[-yMax, -yMax / 2, 0, yMax / 2, yMax]} xMin={0} xMax={maxTime} yMin={yMin} yMax={yMax} xLabel="time / s" yLabel="θ / °" />
        {trace.length > 1 ? (
          <polyline
            points={trace.map((point) => `${axisX(point.timeS, 0, maxTime)},${axisY(point.thetaDeg, yMin, yMax)}`).join(" ")}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : (
          <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fontSize="11" fill="#94a3b8">No swing recorded yet</text>
        )}
        <line x1={PAD.left} y1={axisY(0, yMin, yMax)} x2={WIDTH - PAD.right} y2={axisY(0, yMin, yMax)} stroke="#94a3b8" strokeDasharray="3 3" />
      </svg>
    </div>
  );
}

function T2LGraph({ state }: { state: PendulumLabState }) {
  const rows = graphRows(state);
  const analysis = state.analysis;
  const xMax = Math.max(1.6, ...rows.map((row) => row.lengthM + 0.08));
  const yMax = Math.max(6, ...rows.map((row) => row.periodSquaredS2 + 0.5));
  const xMin = 0;
  const yMin = 0;
  const xTicks = [0, xMax / 4, xMax / 2, (3 * xMax) / 4, xMax].map((tick) => Number(tick.toFixed(2)));
  const yTicks = [0, yMax / 4, yMax / 2, (3 * yMax) / 4, yMax].map((tick) => Number(tick.toFixed(1)));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">T² against effective length</p>
        <span className="font-mono text-[10px] text-slate-500">{rows.length} recorded · {state.data.gravityPresets.find((gravity) => gravity.id === state.params.gravityId)?.name}</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Graph of period squared against effective length with student data points and best-fit line.">
        <rect x={PAD.left} y={PAD.top} width={WIDTH - PAD.left - PAD.right} height={HEIGHT - PAD.top - PAD.bottom} fill="#f8fafc" />
        <Grid xTicks={xTicks} yTicks={yTicks} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} xLabel="L / m" yLabel="T² / s²" />
        {analysis ? (
          <line
            x1={axisX(0, xMin, xMax)}
            y1={axisY(analysis.fit.intercept, yMin, yMax)}
            x2={axisX(xMax, xMin, xMax)}
            y2={axisY(analysis.fit.intercept + analysis.fit.slope * xMax, yMin, yMax)}
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        ) : null}
        {rows.map((row) => (
          <g key={row.id}>
            <circle cx={axisX(row.lengthM, xMin, xMax)} cy={axisY(row.periodSquaredS2, yMin, yMax)} r="4.2" fill={analysis ? "#0284c7" : "#f59e0b"} stroke="#fff" strokeWidth="1.4" />
            <title>{`L ${row.lengthM.toFixed(3)} m, T² ${row.periodSquaredS2.toFixed(3)} s²`}</title>
          </g>
        ))}
        {rows.length === 0 ? <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fontSize="11" fill="#94a3b8">Record five lengths to plot T² against L</text> : null}
        {analysis ? (
          <text x={WIDTH - PAD.right - 5} y={PAD.top + 14} textAnchor="end" fontSize="9" fontWeight="700" fill="#047857">g = {analysis.gMeasuredMS2.toFixed(2)} m/s²</text>
        ) : null}
      </svg>
    </div>
  );
}

export function PendulumGraphs({ state }: { state: PendulumLabState }) {
  return (
    <section className="grid min-w-0 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 shadow-sm lg:grid-cols-2" aria-label="Pendulum graphs">
      <AngleTimeGraph state={state} />
      <T2LGraph state={state} />
    </section>
  );
}
