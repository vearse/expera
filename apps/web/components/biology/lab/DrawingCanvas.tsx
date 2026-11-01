"use client";

import { useRef, useState } from "react";
import type { DrawingPoint, DrawingStroke } from "@/lib/engine/biology/microscopy";
import type { SpecimenVariant } from "@/lib/content/biology";
import {
  currentDrawing,
  currentRecord,
  type BiologyAction,
  type BiologyLabState,
} from "@/lib/sim/biologyMicroscopyStore";

const COLOURS = [
  { value: "#0f172a", name: "Pencil" },
  { value: "#166534", name: "Green" },
  { value: "#1d4ed8", name: "Blue" },
  { value: "#b91c1c", name: "Red" },
];

const WIDTHS = [
  { value: 0.0035, label: "Thin" },
  { value: 0.006, label: "Medium" },
  { value: 0.011, label: "Thick" },
];

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function DrawingCanvas({
  state,
  dispatch,
  variant,
}: {
  state: BiologyLabState;
  dispatch: (action: BiologyAction) => void;
  variant: SpecimenVariant | null;
}) {
  const drawing = currentDrawing(state);
  const record = currentRecord(state);
  const [colour, setColour] = useState(COLOURS[0].value);
  const [width, setWidth] = useState(WIDTHS[1].value);
  const [labelText, setLabelText] = useState("");
  const [pendingLabel, setPendingLabel] = useState(false);
  const [current, setCurrent] = useState<DrawingStroke | null>(null);
  const currentRef = useRef<DrawingStroke | null>(null);
  const dragging = useRef(false);
  const pendingRef = useRef(false);
  const labelTextRef = useRef("");

  const pointFromEvent = (event: React.PointerEvent<SVGSVGElement>): DrawingPoint => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    ];
  };

  const start = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!state.activeSpecimenId) return;
    const point = pointFromEvent(event);
    if (pendingRef.current) {
      const text = labelTextRef.current.trim();
      if (!text) return;
      const label: DrawingPoint = [Math.min(0.92, Math.max(0.08, point[0] + (point[0] > 0.68 ? -0.2 : 0.2))), Math.min(0.92, Math.max(0.08, point[1] - 0.14))];
      dispatch({ type: "addLabel", label: { id: uid(), text, target: point, label } });
      labelTextRef.current = "";
      pendingRef.current = false;
      setLabelText("");
      setPendingLabel(false);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    const stroke: DrawingStroke = { id: uid(), colour, width, points: [point] };
    currentRef.current = stroke;
    setCurrent(stroke);
  };

  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || pendingRef.current) return;
    const point = pointFromEvent(event);
    const stroke = currentRef.current;
    if (!stroke) return;
    const last = stroke.points[stroke.points.length - 1];
    if (last && Math.hypot(point[0] - last[0], point[1] - last[1]) < 0.004) return;
    const next = { ...stroke, points: [...stroke.points, point] };
    currentRef.current = next;
    setCurrent(next);
  };

  const finish = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const stroke = currentRef.current;
    if (stroke && stroke.points.length > 1) dispatch({ type: "addStroke", stroke });
    currentRef.current = null;
    setCurrent(null);
  };

  const required = variant ? variant.structures.filter((structure) => structure.expectedInDrawing) : [];
  const labelCount = drawing.labels.length;
  const strokeCount = drawing.strokes.length;

  return (
    <section className="grid gap-3 rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm" aria-labelledby="drawing-heading">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Biological drawing</p>
          <h2 id="drawing-heading" className="text-xl font-bold text-slate-900">Draw and label what you see</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${record?.totalMagnification ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-amber-300 bg-amber-50 text-amber-900"}`}>
          {record?.totalMagnification ? `${record.totalMagnification}× recorded` : "record observation first"}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        Graphite-style lines only. Do not shade. Draw the specimen as it appears in the field, then use a ruler-like straight label line for each named structure.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <fieldset>
          <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Line colour</legend>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {COLOURS.map((entry) => (
              <button
                key={entry.value}
                type="button"
                onClick={() => setColour(entry.value)}
                aria-pressed={colour === entry.value}
                aria-label={`${entry.name} drawing line`}
                className={`flex min-h-8 items-center gap-1.5 rounded-lg border px-2 text-[11px] font-semibold ${colour === entry.value ? "border-slate-900 bg-slate-100" : "border-slate-300 bg-white"}`}
              >
                <span className="size-3 rounded-full border border-slate-400" style={{ background: entry.value }} aria-hidden />
                {entry.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Line width</legend>
          <div className="mt-1 flex gap-1.5">
            {WIDTHS.map((entry) => (
              <button
                key={entry.label}
                type="button"
                onClick={() => setWidth(entry.value)}
                aria-pressed={width === entry.value}
                className={`min-h-8 rounded-lg border px-2 text-[11px] font-semibold ${width === entry.value ? "border-slate-900 bg-slate-100" : "border-slate-300 bg-white"}`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className={`aspect-square w-full touch-none select-none rounded-xl border-2 bg-[#fffdf5] ${pendingLabel ? "cursor-crosshair border-emerald-600" : "cursor-crosshair border-slate-300"}`}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
          onPointerLeave={finish}
          role="application"
          aria-label="Biological drawing area. Drag to draw. Place a label then click a structure to attach the label line."
        >
          <defs>
            <pattern id="drawing-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#drawing-grid)" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="0.2" strokeDasharray="1 1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="0.2" strokeDasharray="1 1" />
          {drawing.strokes.map((stroke) => (
            <polyline
              key={stroke.id}
              points={stroke.points.map(([x, y]) => `${x * 100},${y * 100}`).join(" ")}
              fill="none"
              stroke={stroke.colour}
              strokeWidth={stroke.width * 100}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {current ? (
            <polyline
              points={current.points.map(([x, y]) => `${x * 100},${y * 100}`).join(" ")}
              fill="none"
              stroke={current.colour}
              strokeWidth={current.width * 100}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {drawing.labels.map((label) => (
            <g key={label.id}>
              <line
                x1={label.target[0] * 100}
                y1={label.target[1] * 100}
                x2={label.label[0] * 100}
                y2={label.label[1] * 100}
                stroke="#0f172a"
                strokeWidth="0.35"
              />
              <circle cx={label.target[0] * 100} cy={label.target[1] * 100} r="0.55" fill="#0f172a" />
              <text
                x={label.label[0] * 100}
                y={label.label[1] * 100 - 1.2}
                textAnchor={label.label[0] >= 0.5 ? "end" : "start"}
                fontSize="3.6"
                fontWeight="600"
                fill="#0f172a"
                paintOrder="stroke"
                stroke="#fffdf5"
                strokeWidth="0.8"
              >
                {label.text}
              </text>
            </g>
          ))}
        </svg>
        {pendingLabel ? (
          <div className="pointer-events-none absolute inset-x-3 top-3 rounded-lg bg-emerald-900/90 px-3 py-2 text-center text-xs font-semibold text-white shadow-lg">
            Click the structure for “{labelText}”
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <label className="grid gap-1 text-xs">
          <span className="font-semibold text-slate-700">Label text</span>
          <input
            value={labelText}
            onChange={(event) => {
              labelTextRef.current = event.target.value;
              setLabelText(event.target.value);
            }}
            placeholder="e.g. Cell wall"
            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              labelTextRef.current = labelText;
              pendingRef.current = true;
              setPendingLabel(true);
            }}
            disabled={!labelText.trim()}
            className="min-h-10 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white disabled:opacity-40"
          >
            Place label
          </button>
          {pendingLabel ? (
            <button type="button" onClick={() => { pendingRef.current = false; setPendingLabel(false); }} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700">
              Cancel placement
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => dispatch({ type: "clearDrawing" })}
            disabled={strokeCount === 0 && labelCount === 0}
            className="min-h-10 rounded-lg border border-red-300 bg-white px-3 text-xs font-semibold text-red-800 disabled:opacity-40"
          >
            Clear drawing
          </button>
          <span className="self-center text-[11px] text-slate-500">{strokeCount} lines · {labelCount} labels</span>
        </div>
      </div>

      {drawing.labels.length ? (
        <div className="flex flex-wrap gap-1.5">
          {drawing.labels.map((label) => (
            <span key={label.id} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700">
              {label.text}
              <button
                type="button"
                onClick={() => dispatch({ type: "removeLabel", id: label.id })}
                aria-label={`Remove label ${label.text}`}
                className="grid size-5 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
        <p className="font-semibold">Drawing checklist</p>
        <p className="mt-1">
          {required.length ? required.map((structure) => structure.name).join(", ") : "Record an observation to load the required structures."}
        </p>
        {record ? (
          <p className="mt-1 text-amber-900">
            Magnification {record.totalMagnification ? `${record.totalMagnification}×` : "not recorded"} · actual size {record.actualSizeMicrometres ? `${record.actualSizeMicrometres.toFixed(1)} µm` : "not calculated"}.
          </p>
        ) : null}
      </div>
    </section>
  );
}
