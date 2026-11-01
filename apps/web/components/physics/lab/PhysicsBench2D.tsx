"use client";

import type { PhysicsStationId } from "@/lib/content/physics";
import type { DensityReading, LiquidDensityReading } from "@/lib/engine/physics/measurement";
import type { PhysicsRoomProps } from "./PhysicsLabRoom";

function readout(id: PhysicsStationId, props: PhysicsRoomProps): string {
  if (id === "vernier") return `${props.vernier.displayCm.toFixed(2)} cm`;
  if (id === "micrometer") return `${props.micrometer.correctedMm.toFixed(2)} mm`;
  if (id === "metre-rule") return `${props.rule.lengthCm.toFixed(1)} cm`;
  if (id === "stopwatch") return `${props.stopwatch.display} s`;
  if (id === "parallax") return props.parallax.aligned ? "aligned" : `${props.parallax.observedMm.toFixed(1)} mm`;
  const solid = props.solid as DensityReading;
  const liquid = props.liquid as LiquidDensityReading;
  if (solid.densityGCm3 > 0 && liquid.densityGCm3 > 0) return `${solid.densityGCm3.toFixed(2)} / ${liquid.densityGCm3.toFixed(2)} g/cm³`;
  return solid.densityGCm3 > 0 ? "solid measured" : liquid.densityGCm3 > 0 ? "liquid measured" : "not measured";
}

const svgNumber = (value: number) => Math.round(value * 1000) / 1000;

const POSITIONS: Record<PhysicsStationId, { x: number; y: number; w: number; h: number; tone: string }> = {
  vernier: { x: 70, y: 138, w: 190, h: 64, tone: "#0ea5e9" },
  micrometer: { x: 290, y: 138, w: 190, h: 64, tone: "#38bdf8" },
  "metre-rule": { x: 510, y: 138, w: 190, h: 64, tone: "#fbbf24" },
  stopwatch: { x: 730, y: 138, w: 110, h: 64, tone: "#f59e0b" },
  parallax: { x: 280, y: 292, w: 220, h: 74, tone: "#22d3ee" },
  density: { x: 540, y: 282, w: 250, h: 86, tone: "#a3e635" },
};

export function PhysicsBench2D(props: PhysicsRoomProps) {
  const select = (id: PhysicsStationId) => props.onSelectStation(id);
  const stationButton = (id: PhysicsStationId, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => select(id)}
      className={`min-h-9 rounded-lg border px-2 text-[11px] font-semibold transition ${
        props.activeStationId === id ? "border-sky-800 bg-sky-800 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-sky-400"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid gap-2 rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-inner">
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#101827]">
        <svg viewBox="0 0 900 470" className="w-full" role="img" aria-label="2D isometric physics laboratory bench with Vernier calipers, micrometer, metre rule, stopwatch, parallax scale and density stations.">
          <defs>
            <linearGradient id="physFloor2d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#162033" />
              <stop offset="100%" stopColor="#0b1220" />
            </linearGradient>
            <linearGradient id="physBench2d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <pattern id="physGrid2d" width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#38bdf8" strokeOpacity="0.06" strokeWidth="1" />
            </pattern>
            <filter id="physGlow2d">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="900" height="470" fill="url(#physFloor2d)" />
          <rect width="900" height="470" fill="url(#physGrid2d)" />
          <path d="M 55 85 L 845 85 L 800 405 L 100 405 Z" fill="#111c2d" stroke="#29415d" strokeWidth="2" />
          <path d="M 85 115 L 815 115 L 778 385 L 122 385 Z" fill="url(#physBench2d)" stroke="#38bdf8" strokeOpacity="0.16" strokeWidth="1" />

          <g transform="translate(0 8)">
            <rect x="0" y="0" width="900" height="44" fill="#020617" opacity="0.75" />
            <text x="450" y="27" textAnchor="middle" fontSize="12" fontWeight="700" fill="#bae6fd" letterSpacing="2">2D PRECISION MEASUREMENT BENCH · SAME SIMULATION ENGINE</text>
          </g>

          <g transform="translate(58 60)">
            <rect x="0" y="0" width="360" height="70" rx="8" fill="#0f172a" stroke="#1e3a5f" />
            <text x="18" y="23" fontSize="10" fontWeight="700" fill="#7dd3fc" letterSpacing="1.4">EXPERA PHYSICS LABORATORY</text>
            <text x="18" y="45" fontSize="16" fontWeight="700" fill="#f8fafc">Measurement and errors</text>
            <text x="18" y="60" fontSize="9" fill="#94a3b8">Click a station. Every reading is derived from the apparatus.</text>
            <rect x="282" y="16" width="62" height="22" rx="11" fill={props.mode === "guided" ? "#064e3b" : "#78350f"} />
            <text x="313" y="31" textAnchor="middle" fontSize="9" fontWeight="700" fill={props.mode === "guided" ? "#a7f3d0" : "#fde68a"}>{props.mode === "guided" ? "GUIDED" : "INDEP."}</text>
          </g>

          {props.stations.map((station) => {
            const pos = POSITIONS[station.id];
            const active = station.id === props.activeStationId;
            const done = props.completedStations.includes(station.id);
            return (
              <g
                key={station.id}
                role="button"
                tabIndex={0}
                aria-label={`${station.title} station${done ? ", complete" : ""}`}
                className="cursor-pointer outline-none"
                onClick={() => select(station.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    select(station.id);
                  }
                }}
              >
                <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx="9" fill={active ? "#0c4a6e" : "#0f1b2d"} stroke={active ? pos.tone : "#26364d"} strokeWidth={active ? 2.4 : 1.2} filter={active ? "url(#physGlow2d)" : undefined} />
                <circle cx={pos.x + 17} cy={pos.y + 18} r="5" fill={done ? "#22c55e" : pos.tone} />
                <text x={pos.x + 28} y={pos.y + 22} fontSize="11" fontWeight="700" fill="#f1f5f9">{station.short}</text>
                <text x={pos.x + 12} y={pos.y + 43} fontSize="10" fill="#94a3b8">{readout(station.id, props)}</text>
                <text x={pos.x + 12} y={pos.y + 57} fontSize="8" fill={active ? "#7dd3fc" : "#64748b"}>{active ? "ACTIVE STATION" : done ? "COMPLETE · CLICK TO REVIEW" : "CLICK TO USE"}</text>
              </g>
            );
          })}

          <g aria-hidden>
            <g transform="translate(132 238)">
              <rect width="170" height="12" rx="3" fill="#94a3b8" />
              <rect x="0" y="-9" width="10" height="30" rx="2" fill="#e2e8f0" />
              <rect x={svgNumber(12 + ((props.vernier.observedMm % 30) / 30) * 130)} y="-7" width="9" height="26" rx="2" fill="#38bdf8" />
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((tick) => (
                <line key={tick} x1={18 + tick * 15} y1="0" x2={18 + tick * 15} y2={tick % 5 === 0 ? "8" : "5"} stroke="#cbd5e1" strokeWidth="1" />
              ))}
              <text x="86" y="28" textAnchor="middle" fontSize="8" fill="#64748b">VERNIER JAWS</text>
            </g>
            <g transform="translate(342 230)">
              <path d="M0 20V0H22V20M42 20V0H64V20M22 10H42" fill="none" stroke="#cbd5e1" strokeWidth="5" />
              <rect x="22" y="4" width="20" height="13" fill="#334155" />
              <circle cx="3" cy="10" r="7" fill="#38bdf8" />
              <circle cx="61" cy="10" r="7" fill="#38bdf8" />
              <text x="32" y="36" textAnchor="middle" fontSize="8" fill="#64748b">MICROMETER</text>
            </g>
            <g transform="translate(536 236)">
              <rect width="190" height="16" rx="2" fill="#fcd34d" opacity="0.9" />
              {Array.from({ length: 20 }).map((_, index) => (
                <line key={index} x1={8 + index * 9} y1="0" x2={8 + index * 9} y2={index % 5 === 0 ? "8" : "4"} stroke="#78350f" strokeWidth="1" />
              ))}
              <rect x={svgNumber((props.rule.startCm / 30) * 180)} y="-5" width="3" height="26" fill="#f97316" />
              <rect x={svgNumber((props.rule.endCm / 30) * 180)} y="-5" width="3" height="26" fill="#f97316" />
              <text x="95" y="31" textAnchor="middle" fontSize="8" fill="#64748b">METRE RULE</text>
            </g>
            <g transform="translate(748 222)">
              <circle cx="30" cy="26" r="24" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
              {Array.from({ length: 12 }).map((_, index) => {
                const angle = (index / 12) * Math.PI * 2;
                return <line key={index} x1={svgNumber(30 + Math.cos(angle) * 16)} y1={svgNumber(26 + Math.sin(angle) * 16)} x2={svgNumber(30 + Math.cos(angle) * 20)} y2={svgNumber(26 + Math.sin(angle) * 20)} stroke="#e2e8f0" strokeWidth="1" />;
              })}
              <line x1="30" y1="26" x2={svgNumber(30 + Math.cos((props.stopwatch.seconds % 60) / 60 * Math.PI * 2) * 14)} y2={svgNumber(26 + Math.sin((props.stopwatch.seconds % 60) / 60 * Math.PI * 2) * 14)} stroke="#fbbf24" strokeWidth="2" />
              <text x="30" y="60" textAnchor="middle" fontSize="8" fill="#64748b">STOPWATCH</text>
            </g>
            <g transform="translate(320 382)">
              <rect x="0" y="8" width="138" height="8" rx="3" fill="#334155" />
              <rect x="0" y="-18" width="3" height="28" fill="#22d3ee" />
              <rect x="92" y="-18" width="3" height="28" fill="#22d3ee" />
              <circle cx={svgNumber(props.parallax.eyeOffsetMm * 4 + 48)} cy="-20" r="6" fill="#a5f3fc" />
              <line x1="48" y1="-14" x2={svgNumber(props.parallax.eyeOffsetMm * 4 + 48)} y2="-14" stroke="#22d3ee" strokeDasharray="3 3" />
              <text x="69" y="32" textAnchor="middle" fontSize="8" fill="#64748b">PARALLAX SCALE</text>
            </g>
            <g transform="translate(572 384)">
              <rect width="92" height="32" rx="4" fill="#334155" />
              <rect x="8" y="8" width="54" height="14" rx="2" fill="#020617" />
              <text x="35" y="19" textAnchor="middle" fontSize="8" fill="#a3e635">{props.solid.massG > 0 ? `${props.solid.massG.toFixed(1)} g` : "BALANCE"}</text>
              <rect x="105" y="-6" width="28" height="48" rx="4" fill="#164e63" opacity="0.8" />
              <rect x="109" y={props.liquid.volumeMl > 0 ? 18 : 34} width="20" height={props.liquid.volumeMl > 0 ? 20 : 4} rx="2" fill="#67e8f9" opacity="0.8" />
              <text x="141" y="52" textAnchor="middle" fontSize="8" fill="#64748b">CYLINDER</text>
            </g>
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {props.stations.map((station) => stationButton(station.id, station.short))}
      </div>
    </div>
  );
}
