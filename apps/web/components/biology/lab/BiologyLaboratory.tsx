"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import type { BiologyData } from "@/lib/content/biology";
import {
  createBiologyMicroscopyStore,
  currentExperiment,
  currentModel,
  currentObservation,
  currentSlide,
  currentSpecimen,
  currentVariant,
  suggestionFor,
  type BiologyAction,
  type BiologyStore,
} from "@/lib/sim/biologyMicroscopyStore";
import { ReviewBadge } from "@/components/ui";
import { BiologyLabRoom } from "./BiologyLabRoom";
import { BiologyNotebook } from "./BiologyNotebook";
import { DrawingCanvas } from "./DrawingCanvas";
import { MicroscopeWorkbench } from "./MicroscopeWorkbench";
import { ObservationPanel } from "./ObservationPanel";
import { SpecimenPreparation } from "./SpecimenPreparation";

function LoadingBench() {
  return (
    <div className="grid gap-4">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-[420px] animate-pulse rounded-2xl bg-emerald-100 sm:h-[560px]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function FeedbackBanner({ message, kind }: { message: string; kind: "info" | "success" | "error" }) {
  const tone =
    kind === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : kind === "error"
        ? "border-red-300 bg-red-50 text-red-950"
        : "border-sky-300 bg-sky-50 text-sky-950";
  return (
    <div className={`rounded-xl border p-3 text-sm shadow-sm ${tone}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}

function BiologyLaboratoryInner({ data }: { data: BiologyData }) {
  const store = useMemo(() => createBiologyMicroscopyStore(data, 1), [data]);
  const state = useStore(store) as BiologyStore;
  const dispatch = useCallback((action: BiologyAction) => store.getState().dispatch(action), [store]);

  const model = currentModel(state);
  const specimen = currentSpecimen(state);
  const variant = currentVariant(state);
  const slide = currentSlide(state);
  const observation = currentObservation(state);
  const experiment = currentExperiment(state);
  const exam = state.mode === "exam";
  const hint = suggestionFor(state);

  const inspectPart = useCallback((id: string) => dispatch({ type: "inspectPart", partId: id }), [dispatch]);
  const selectSpecimen = useCallback((id: string) => dispatch({ type: "selectSpecimen", id }), [dispatch]);
  const selectMicroscope = useCallback((id: string) => dispatch({ type: "selectMicroscope", modelId: id }), [dispatch]);

  const onStageClick = useCallback(() => {
    if (slide?.onStage) {
      inspectPart("stage");
      return;
    }
    dispatch({ type: "placeSlide" });
  }, [dispatch, inspectPart, slide?.onStage]);

  const onClipClick = useCallback(() => {
    if (!slide?.onStage) {
      dispatch({ type: "secureSlide", secured: true });
      return;
    }
    dispatch({ type: "secureSlide", secured: !slide.secured });
  }, [dispatch, slide?.onStage, slide?.secured]);

  return (
    <div className="grid gap-5">
      <header className="grid gap-3 rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Biology · Wave 1 practical</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Cells and microscopy</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
              Work at a compound light microscope bench. Prepare onion, cheek and pond-water slides, focus the optics, draw what you actually see, and calculate actual size.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ReviewBadge status="NEEDS_TEACHER_REVIEW" />
            <button
              type="button"
              onClick={() => dispatch({ type: "newSample", seed: Math.floor(Math.random() * 1_000_000) + 1 })}
              className="min-h-10 rounded-lg border border-emerald-700 bg-white px-3 text-xs font-semibold text-emerald-900 hover:bg-emerald-50"
            >
              New pond-water sample
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {(["regular", "exam"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => dispatch({ type: "setMode", mode, seed: state.seed + 1 })}
              aria-pressed={state.mode === mode}
              className={`min-h-16 rounded-xl border p-3 text-left transition ${state.mode === mode ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-slate-50 hover:border-emerald-500"}`}
            >
              <span className="block text-sm font-bold text-slate-900">{mode === "regular" ? "Regular Practice" : "Exam Preparation"}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                {mode === "regular" ? "Step guidance and Ms. Ada's hints are available." : "Procedural hints are hidden. Work independently and review your notebook at the end."}
              </span>
            </button>
          ))}
        </div>
      </header>

      {experiment ? (
        <section className="grid gap-3 rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm" aria-labelledby="experiment-heading">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Choose a practical</p>
              <h2 id="experiment-heading" className="text-lg font-bold text-slate-900">{experiment.title}</h2>
            </div>
            <ReviewBadge status={experiment.review} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {state.experiments.map((entry) => {
              const active = entry.id === state.activeExperimentId;
              const done = state.completedExperiments.includes(entry.id);
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => dispatch({ type: "selectExperiment", id: entry.id })}
                  aria-pressed={active}
                  className={`min-h-20 rounded-xl border p-2.5 text-left transition ${active ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-slate-50 hover:border-emerald-500"}`}
                >
                  <span className="block text-xs font-semibold leading-snug text-slate-900">{entry.title}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-500">{entry.specimenId.replace(/-/g, " ")}</span>
                  {done ? <span className="mt-1 inline-block rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">complete</span> : null}
                </button>
              );
            })}
          </div>
          <div className="grid gap-3 rounded-xl bg-slate-50 p-3 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Aim</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-800">{experiment.aim}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{experiment.summary}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Success criteria</h3>
              <ul className="mt-1 grid gap-1 text-xs text-slate-700">
                {experiment.criteria.map((criterion) => (
                  <li key={criterion} className="flex gap-1.5">
                    <span aria-hidden>•</span>
                    <span>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {!exam ? (
            <details className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-950">
              <summary className="cursor-pointer font-semibold">Hints for this practical</summary>
              <ul className="mt-2 grid gap-1">
                {experiment.hints.map((entry) => (
                  <li key={entry} className="flex gap-1.5">
                    <span aria-hidden>•</span>
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}

      <BiologyLabRoom
        model={model}
        objectiveId={state.objectiveId}
        focusOffsetMicrometres={state.focusOffsetMicrometres}
        illumination={state.illumination}
        specimen={specimen}
        variant={variant}
        slide={slide}
        specimens={state.specimens}
        activeSpecimenId={state.activeSpecimenId}
        selectedPart={state.inspectedPart}
        microscopeSelected={state.microscopeSelected}
        teacherHint={hint}
        observation={observation}
        onInspectPart={inspectPart}
        onSelectMicroscope={selectMicroscope}
        onSelectSpecimen={selectSpecimen}
        onStageClick={onStageClick}
        onClipClick={onClipClick}
      />

      <FeedbackBanner message={state.feedback} kind={state.feedbackKind} />

      {hint && !exam ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950 shadow-sm" aria-live="polite">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-bold text-white">MA</span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Ms. Ada suggests</p>
            <p className="mt-0.5 text-sm">{hint}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <SpecimenPreparation state={state} dispatch={dispatch} specimens={state.specimens} />
        <MicroscopeWorkbench state={state} dispatch={dispatch} models={state.microscopy.models} />
      </div>

      <ObservationPanel state={state} dispatch={dispatch} specimen={specimen} variant={variant} slide={slide} observation={observation} />

      <div className="grid gap-5 xl:grid-cols-2">
        <DrawingCanvas state={state} dispatch={dispatch} variant={variant} />
        <BiologyNotebook state={state} dispatch={dispatch} specimens={state.specimens} />
      </div>

      <footer className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600">
        <p>
          <strong className="text-slate-900">Simulation note:</strong> optics, preparation sequence and drawing checks are modelled. Specimen appearances are representative rather than photographic. Items marked{" "}
          <span className="rounded bg-amber-100 px-1 py-0.5 font-semibold text-amber-900">Needs teacher review</span> must be checked against the school scheme of work before classroom use.
        </p>
      </footer>
    </div>
  );
}

export function BiologyLaboratory({ data }: { data: BiologyData }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <LoadingBench />;
  return <BiologyLaboratoryInner data={data} />;
}
