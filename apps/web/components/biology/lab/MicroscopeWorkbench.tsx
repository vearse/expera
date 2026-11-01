"use client";

import type { MicroscopeModelSpec } from "@/lib/content/biology";
import { brightnessLevel, fieldOfViewMicrometres, focusQuality, totalMagnification } from "@/lib/engine/biology/microscopy";
import {
  currentEyepiece,
  currentModel,
  currentObjective,
  currentSlide,
  type BiologyAction,
  type BiologyLabState,
} from "@/lib/sim/biologyMicroscopyStore";
import { ReviewBadge } from "@/components/ui";

function QualityBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span>{label}</span>
        <span className="font-semibold text-slate-800">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${Math.max(2, Math.round(value * 100))}%` }} />
      </div>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  disabled,
  tone = "default",
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "primary" | "dark";
  ariaLabel?: string;
}) {
  const styles =
    tone === "primary"
      ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800"
      : tone === "dark"
        ? "border-slate-800 bg-slate-800 text-white hover:bg-slate-900"
        : "border-slate-300 bg-white text-slate-700 hover:border-emerald-600";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}

export function MicroscopeWorkbench({
  state,
  dispatch,
  models,
}: {
  state: BiologyLabState;
  dispatch: (action: BiologyAction) => void;
  models: MicroscopeModelSpec[];
}) {
  const model = currentModel(state);
  const eyepiece = currentEyepiece(state);
  const objective = currentObjective(state);
  const slide = currentSlide(state);
  const total = totalMagnification(eyepiece, objective);
  const field = fieldOfViewMicrometres(eyepiece.fieldNumberMm, objective);
  const focus = focusQuality(state.focusOffsetMicrometres, objective);
  const brightness = brightnessLevel(state.illumination, model, objective);
  const selectedPart = model.parts.find((part) => part.id === state.inspectedPart) ?? null;
  const highPower = objective.magnification >= 40;
  const exam = state.mode === "exam";

  return (
    <section className="grid gap-4 rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm" aria-labelledby="scope-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Step 2 · Microscope</p>
          <h2 id="scope-heading" className="text-xl font-bold text-slate-900">Operate the microscope</h2>
        </div>
        <ReviewBadge status={model.review} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {models.map((entry) => {
          const active = entry.id === state.modelId;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => dispatch({ type: "selectMicroscope", modelId: entry.id })}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition ${active ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-slate-50 hover:border-emerald-500"}`}
            >
              <span className="text-sm font-semibold text-slate-900">{entry.name}</span>
              <span className="mt-1 block text-xs leading-snug text-slate-600">{entry.lightSource === "led" ? "Built-in LED illuminator" : "Mirror and bench lamp"}</span>
              <span className="mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {active ? "selected" : "select"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-3 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Optics and magnification</h3>
            <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">{total}× total</span>
          </div>

          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Eyepiece</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {model.eyepieces.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => dispatch({ type: "setEyepiece", id: entry.id })}
                  aria-pressed={entry.id === state.eyepieceId}
                  className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${entry.id === state.eyepieceId ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"}`}
                >
                  {entry.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Objective</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {model.objectives.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => dispatch({ type: "setObjective", id: entry.id })}
                  aria-pressed={entry.id === state.objectiveId}
                  className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${entry.id === state.objectiveId ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"}`}
                >
                  {entry.name}
                </button>
              ))}
            </div>
          </fieldset>

          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2">
              <dt className="text-slate-500">Field of view</dt>
              <dd className="font-semibold text-slate-900">{field.toFixed(0)} µm</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <dt className="text-slate-500">Depth of field</dt>
              <dd className="font-semibold text-slate-900">{objective.depthOfFieldMicrometres} µm</dd>
            </div>
          </dl>
          {highPower ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950">
              High power has a shallow depth of field. Use the fine adjustment only.
            </p>
          ) : null}
          {!exam ? (
            <p className="text-[11px] leading-relaxed text-slate-500">
              Total magnification = eyepiece × objective. At higher magnification, the field of view becomes smaller.
            </p>
          ) : null}
        </div>

        <div className="grid content-start gap-3 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Illumination</h3>
            <button
              type="button"
              role="switch"
              aria-checked={state.illumination.power}
              onClick={() => dispatch({ type: "setPower", on: !state.illumination.power })}
              className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${state.illumination.power ? "border-amber-300 bg-amber-100 text-amber-950" : "border-slate-300 bg-white text-slate-600"}`}
            >
              Light {state.illumination.power ? "on" : "off"}
            </button>
          </div>

          <QualityBar label="Illumination" value={Math.min(1, brightness)} />

          {[
            { key: "intensity" as const, label: "Light intensity", value: state.illumination.intensity },
            { key: "diaphragm" as const, label: "Diaphragm aperture", value: state.illumination.diaphragm },
            { key: "condenser" as const, label: "Condenser height", value: state.illumination.condenser },
          ].map((control) => (
            <label key={control.key} className="grid gap-1 text-xs">
              <span className="flex items-center justify-between font-medium text-slate-700">
                {control.label}
                <span className="text-slate-500">{Math.round(control.value)}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={control.value}
                aria-label={control.label}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (control.key === "intensity") dispatch({ type: "setIllumination", value });
                  else if (control.key === "diaphragm") dispatch({ type: "setDiaphragm", value });
                  else dispatch({ type: "setCondenser", value });
                }}
                className="h-2 w-full accent-emerald-700"
              />
            </label>
          ))}

          {model.lightSource === "mirror" ? (
            <button
              type="button"
              onClick={() => dispatch({ type: "alignMirror" })}
              className={`min-h-10 rounded-lg border px-3 text-xs font-semibold ${state.illumination.mirrorAligned ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-amber-400 bg-amber-50 text-amber-950"}`}
            >
              {state.illumination.mirrorAligned ? "Mirror aligned" : "Align mirror with bench lamp"}
            </button>
          ) : (
            <p className="text-[11px] leading-relaxed text-slate-500">The LED is already in line with the condenser. Adjust intensity for comfort and contrast.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-3 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Focus and stage</h3>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${slide?.onStage && slide.secured ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
              {slide?.onStage ? (slide.secured ? "secured" : "unsecured") : "no slide"}
            </span>
          </div>

          <QualityBar label="Focus" value={focus} />

          <div className="grid grid-cols-2 gap-2">
            <StepButton onClick={() => dispatch({ type: "focus", knob: "coarse", direction: 1 })} ariaLabel="Lower the stage using the coarse adjustment">
              Coarse ↓
            </StepButton>
            <StepButton onClick={() => dispatch({ type: "focus", knob: "coarse", direction: -1 })} ariaLabel="Raise the stage using the coarse adjustment">
              Coarse ↑
            </StepButton>
            <StepButton onClick={() => dispatch({ type: "focus", knob: "fine", direction: 1 })} ariaLabel="Lower the stage using the fine adjustment">
              Fine ↓
            </StepButton>
            <StepButton onClick={() => dispatch({ type: "focus", knob: "fine", direction: -1 })} ariaLabel="Raise the stage using the fine adjustment">
              Fine ↑
            </StepButton>
          </div>
          <p className="text-[11px] text-slate-500">Stage offset: {state.focusOffsetMicrometres.toFixed(0)} µm from focus</p>

          <div className="grid gap-2 sm:grid-cols-2">
            {slide?.onStage ? (
              <StepButton onClick={() => dispatch({ type: "removeSlide" })}>Remove slide</StepButton>
            ) : (
              <StepButton onClick={() => dispatch({ type: "placeSlide" })} tone="primary">Place slide on stage</StepButton>
            )}
            <StepButton onClick={() => dispatch({ type: "secureSlide", secured: !slide?.secured })} disabled={!slide?.onStage}>
              {slide?.secured ? "Release clips" : "Secure clips"}
            </StepButton>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stage position</span>
              <span className="text-[10px] text-slate-500">
                x {Math.round(slide?.offsetXMicrometres ?? 0)} µm · y {Math.round(slide?.offsetYMicrometres ?? 0)} µm
              </span>
            </div>
            <div className="mx-auto mt-2 grid w-36 grid-cols-3 gap-1">
              <span />
              <StepButton onClick={() => dispatch({ type: "nudgeSlide", direction: "up" })} disabled={!slide?.onStage} ariaLabel="Move slide up">↑</StepButton>
              <span />
              <StepButton onClick={() => dispatch({ type: "nudgeSlide", direction: "left" })} disabled={!slide?.onStage} ariaLabel="Move slide left">←</StepButton>
              <StepButton onClick={() => dispatch({ type: "centreSlide" })} disabled={!slide?.onStage} ariaLabel="Centre the specimen">◎</StepButton>
              <StepButton onClick={() => dispatch({ type: "nudgeSlide", direction: "right" })} disabled={!slide?.onStage} ariaLabel="Move slide right">→</StepButton>
              <span />
              <StepButton onClick={() => dispatch({ type: "nudgeSlide", direction: "down" })} disabled={!slide?.onStage} ariaLabel="Move slide down">↓</StepButton>
              <span />
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3 rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-bold text-slate-900">Inspect the parts</h3>
          <div className="flex flex-wrap gap-1.5">
            {model.parts.map((part) => {
              const active = part.id === state.inspectedPart;
              const seen = state.inspectedParts.includes(part.id);
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => dispatch({ type: "inspectPart", partId: part.id })}
                  aria-pressed={active}
                  className={`min-h-8 rounded-lg border px-2.5 text-[11px] font-semibold ${active ? "border-emerald-700 bg-emerald-700 text-white" : seen ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"}`}
                >
                  {part.name}
                </button>
              );
            })}
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{selectedPart?.name ?? "Part guide"}</p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-950">
              {selectedPart?.fn ?? "Select a part, on the microscope or in this list, to learn what it does."}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              {state.inspectedParts.length}/{model.parts.length} parts inspected
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
