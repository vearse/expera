"use client";

import type { SpecimenSpec } from "@/lib/content/biology";
import { nextPreparationStep, preparationQuality, type PrepAction } from "@/lib/engine/biology/microscopy";
import type { BiologyAction, BiologyLabState } from "@/lib/sim/biologyMicroscopyStore";

const ACTION_LABEL: Record<PrepAction, string> = {
  sample: "Take sample",
  mount: "Mount sample",
  dry: "Air-dry",
  stain: "Apply stain",
  coverslip: "Add coverslip",
};

const ACTION_ICON: Record<PrepAction, string> = {
  sample: "01",
  mount: "02",
  dry: "03",
  stain: "04",
  coverslip: "05",
};

export function SpecimenPreparation({
  state,
  dispatch,
  specimens,
}: {
  state: BiologyLabState;
  dispatch: (action: BiologyAction) => void;
  specimens: SpecimenSpec[];
}) {
  const specimen = specimens.find((entry) => entry.id === state.activeSpecimenId) ?? null;
  const slide = specimen ? state.slides[specimen.id] ?? null : null;
  const next = specimen && slide ? nextPreparationStep(specimen, slide) : null;
  const quality = specimen && slide ? preparationQuality(specimen, slide) : 0;
  const exam = state.mode === "exam";

  return (
    <section className="grid gap-4 rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm" aria-labelledby="prep-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Step 1 · Specimen preparation</p>
          <h2 id="prep-heading" className="text-xl font-bold text-slate-900">Prepare a wet mount</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${slide?.ready ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-amber-300 bg-amber-50 text-amber-900"}`}>
          {slide?.ready ? "Slide ready" : `${Math.round(quality * 100)}% prepared`}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {specimens.map((entry) => {
          const active = entry.id === state.activeSpecimenId;
          const entrySlide = state.slides[entry.id];
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => dispatch({ type: "selectSpecimen", id: entry.id })}
              aria-pressed={active}
              className={`min-h-20 rounded-xl border p-3 text-left transition ${active ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-slate-50 hover:border-emerald-500"}`}
            >
              <span className="block text-sm font-semibold text-slate-900">{entry.name}</span>
              <span className="mt-0.5 block text-xs leading-snug text-slate-600">{entry.subtitle}</span>
              <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${entrySlide?.ready ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-600"}`}>
                {entrySlide?.ready ? "prepared" : `${entrySlide?.completedStepIds.length ?? 0}/${entry.steps.length} steps`}
              </span>
            </button>
          );
        })}
      </div>

      {specimen && slide ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm leading-relaxed text-slate-700">{specimen.description}</p>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <p className="font-semibold uppercase tracking-wide text-slate-500">Materials</p>
                <p className="mt-1 text-slate-700">{specimen.materials.join(" · ")}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-slate-500">Stain</p>
                <p className="mt-1 text-slate-700">
                  {specimen.stain ? `${specimen.stain.name} — ${specimen.stain.purpose}` : "No stain required for this wet mount."}
                </p>
              </div>
            </div>
          </div>

          <ol className="grid gap-2">
            {specimen.steps.map((step, index) => {
              const done = slide.completedStepIds.includes(step.id);
              const isNext = next?.id === step.id;
              return (
                <li
                  key={step.id}
                  className={`rounded-xl border p-3 transition ${done ? "border-emerald-200 bg-emerald-50/70" : isNext && !exam ? "border-emerald-500 bg-white ring-1 ring-emerald-200" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {done ? "✓" : ACTION_ICON[step.action] || index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-semibold ${done ? "text-emerald-900" : "text-slate-900"}`}>{step.label}</p>
                        {isNext && !exam ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">next</span> : null}
                      </div>
                      {!exam ? <p className="mt-1 text-xs leading-relaxed text-slate-600">{step.instruction}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "prepareStep", action: step.action })}
                          disabled={done}
                          className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition ${done ? "cursor-default border-emerald-200 bg-emerald-100 text-emerald-800" : "border-slate-300 bg-white text-slate-700 hover:border-emerald-600 hover:text-emerald-800"}`}
                          aria-label={`${ACTION_LABEL[step.action]}: ${step.label}`}
                        >
                          {done ? "Completed" : ACTION_LABEL[step.action]}
                        </button>
                        {!exam && step.action === "coverslip" ? <span className="text-[11px] text-slate-500">Lower from one edge.</span> : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "resetSlide" })}
              className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-500"
            >
              Reset this slide
            </button>
            {slide.ready && !slide.onStage ? (
              <button
                type="button"
                onClick={() => dispatch({ type: "placeSlide" })}
                className="min-h-10 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Place prepared slide on stage
              </button>
            ) : null}
            {slide.onStage ? (
              <span className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900">
                {slide.secured ? "Slide secured on the stage" : "Slide on stage — secure the clips"}
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Select a specimen to load its preparation steps.</p>
      )}
    </section>
  );
}
