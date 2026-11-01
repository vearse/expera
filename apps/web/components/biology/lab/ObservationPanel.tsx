"use client";

import type { SpecimenSpec, SpecimenVariant } from "@/lib/content/biology";
import type { ObservationResult, SlideState } from "@/lib/engine/biology/microscopy";
import {
  currentEyepiece,
  currentObjective,
  measurementResult,
  requiredStructuresForActive,
  type BiologyAction,
  type BiologyLabState,
} from "@/lib/sim/biologyMicroscopyStore";
import { fieldOfViewMicrometres, totalMagnification } from "@/lib/engine/biology/microscopy";
import { MicroscopeField } from "./MicroscopeField";

function Metric({ label, value, tone = "emerald" }: { label: string; value: number; tone?: "emerald" | "sky" | "amber" }) {
  const colour = tone === "sky" ? "bg-sky-600" : tone === "amber" ? "bg-amber-500" : "bg-emerald-600";
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${colour}`} style={{ width: `${Math.max(2, Math.round(value * 100))}%` }} />
      </div>
    </div>
  );
}

const STATUS_TEXT: Record<string, string> = {
  "no-specimen": "No specimen selected",
  "preparation-incomplete": "Slide preparation incomplete",
  "not-on-stage": "Slide not on stage",
  "not-secured": "Slide not secured",
  "empty-field": "Specimen outside field",
  observable: "Specimen in view",
};

export function ObservationPanel({
  state,
  dispatch,
  specimen,
  variant,
  slide,
  observation,
}: {
  state: BiologyLabState;
  dispatch: (action: BiologyAction) => void;
  specimen: SpecimenSpec | null;
  variant: SpecimenVariant | null;
  slide: SlideState | null;
  observation: ObservationResult | null;
}) {
  const result = measurementResult(state);
  const eyepiece = currentEyepiece(state);
  const objective = currentObjective(state);
  const required = requiredStructuresForActive(state);
  const total = totalMagnification(eyepiece, objective);
  const field = fieldOfViewMicrometres(eyepiece.fieldNumberMm, objective);
  const visible = observation?.status === "observable" ? observation.visibleStructureIds : [];
  const exam = state.mode === "exam";
  const record = specimen ? state.records[specimen.id] : null;

  return (
    <section className="grid gap-4 rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm" aria-labelledby="observation-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Step 3 · Observation</p>
          <h2 id="observation-heading" className="text-xl font-bold text-slate-900">Examine the field of view</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${observation?.status === "observable" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-slate-50 text-slate-700"}`}>
          {STATUS_TEXT[observation?.status ?? "no-specimen"]}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,440px)_minmax(0,1fr)]">
        <div className="grid content-start gap-2">
          <MicroscopeField specimen={specimen} variant={variant} slide={slide} observation={observation} />
          <p className="text-center text-[11px] text-slate-500">
            The preview responds to focus, illumination, slide position and magnification.
          </p>
        </div>

        <div className="grid content-start gap-3">
          <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">{specimen?.name ?? "No specimen"}</p>
              <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{total}×</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">{variant?.description ?? "Select and prepare a specimen."}</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <span className="rounded-lg bg-white p-2 text-slate-600">Field of view <strong className="block text-slate-900">{field.toFixed(0)} µm</strong></span>
              <span className="rounded-lg bg-white p-2 text-slate-600">Clarity <strong className="block text-slate-900">{Math.round((observation?.clarity ?? 0) * 100)}%</strong></span>
            </div>
          </div>

          <div className="grid gap-2 rounded-xl border border-slate-200 p-3">
            <Metric label="Focus" value={observation?.focusQuality ?? 0} />
            <Metric label="Illumination" value={observation?.illuminationQuality ?? 0} tone="amber" />
            <Metric label="Centring" value={observation?.centringQuality ?? 0} tone="sky" />
            <Metric label="Preparation" value={observation?.preparationQuality ?? 0} />
          </div>

          {observation?.warnings.length ? (
            <ul className="grid gap-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              {observation.warnings.map((warning) => (
                <li key={warning} className="flex gap-1.5">
                  <span aria-hidden>•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950">
              {observation?.status === "observable"
                ? `${visible.length} structure${visible.length === 1 ? "" : "s"} can be seen. Record the observation before drawing.`
                : "Complete the preparation and microscope setup to see the specimen."}
            </p>
          )}

          <button
            type="button"
            onClick={() => dispatch({ type: "recordObservation" })}
            className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Record this observation
          </button>
          {record ? (
            <p className="text-[11px] text-slate-500">
              Last recorded {record.observedAt ? new Date(record.observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"} · {record.structures.length} structures.
            </p>
          ) : null}

          <div className="rounded-xl border border-slate-200 p-3">
            <h3 className="text-sm font-bold text-slate-900">Observed structures</h3>
            {visible.length ? (
              <ul className="mt-2 grid gap-1.5">
                {visible.map((id) => {
                  const structure = variant?.structures.find((entry) => entry.id === id);
                  if (!structure) return null;
                  const requiredForDrawing = required.some((entry) => entry.id === structure.id);
                  return (
                    <li key={id} className="rounded-lg bg-slate-50 px-2.5 py-2 text-xs">
                      <span className="font-semibold text-slate-900">{structure.name}</span>
                      {requiredForDrawing ? <span className="ml-1.5 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800">label</span> : null}
                      <span className="mt-0.5 block leading-relaxed text-slate-600">{structure.description}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-slate-600">No structures are visible yet. Improve focus, illumination and preparation, or increase magnification.</p>
            )}
            {!exam && required.length ? (
              <p className="mt-2 text-[11px] text-slate-500">Drawing labels needed: {required.map((structure) => structure.name).join(", ")}.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-sky-950">Magnification and actual size</h3>
            <p className="text-xs text-sky-800">
              Eyepiece {eyepiece.magnification}× · objective {objective.magnification}× · total {total}×
            </p>
          </div>
          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-sky-900">FOV {field.toFixed(0)} µm</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <label className="grid gap-1 text-xs text-sky-950">
            <span className="font-semibold">Measured image size</span>
            <div className="flex">
              <input
                type="number"
                min={0}
                step={0.1}
                inputMode="decimal"
                value={state.measurement.imageSizeMm ?? ""}
                onChange={(event) => dispatch({ type: "setMeasurement", imageSizeMm: event.target.value === "" ? null : Number(event.target.value) })}
                placeholder="e.g. 30"
                className="min-h-10 w-full rounded-l-lg border border-sky-300 bg-white px-3 text-sm"
              />
              <span className="grid place-items-center rounded-r-lg border border-l-0 border-sky-300 bg-white px-3 text-xs font-semibold">mm</span>
            </div>
          </label>
          <label className="grid gap-1 text-xs text-sky-950">
            <span className="font-semibold">Report actual size in</span>
            <select
              value={state.measurement.unit}
              onChange={(event) => dispatch({ type: "setMeasurement", imageSizeMm: state.measurement.imageSizeMm, unit: event.target.value as "micrometre" | "millimetre" | "centimetre" })}
              className="min-h-10 rounded-lg border border-sky-300 bg-white px-3 text-sm"
            >
              <option value="micrometre">micrometres (µm)</option>
              <option value="millimetre">millimetres (mm)</option>
              <option value="centimetre">centimetres (cm)</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => dispatch({ type: "submitMeasurement" })}
            className="min-h-10 rounded-lg bg-sky-800 px-4 text-sm font-semibold text-white hover:bg-sky-900"
          >
            Calculate actual size
          </button>
        </div>

        {!exam ? (
          <p className="text-[11px] leading-relaxed text-sky-800">
            Actual size = image size ÷ total magnification. Convert mm to µm by multiplying by 1000.
          </p>
        ) : null}

        {result ? (
          <div className="rounded-xl border border-sky-300 bg-white p-3" aria-live="polite">
            <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Calculation</p>
            <p className="mt-1 text-sm text-slate-800">
              {state.measurement.imageSizeMm?.toFixed(1)} mm ÷ {result.totalMagnification} = <strong>{result.value.toFixed(2)} {result.unit}</strong>
            </p>
            <p className="text-xs text-slate-500">Equivalent to about {result.micrometres.toFixed(1)} µm. Check that your measurement and units are sensible.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
