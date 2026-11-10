"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectWebGL } from "@/lib/device";
import { useLabReadySignal } from "@/components/lab/LabExperience";
import type { MicroscopeModelSpec, SpecimenSpec, SpecimenVariant } from "@/lib/content/biology";
import type { ObservationResult, SlideState } from "@/lib/engine/biology/microscopy";
import { BiologyBench2D } from "./BiologyBench2D";

const Room3D = dynamic(() => import("@/components/sim3d/biology/BiologyLabRoom3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border bg-emerald-50 text-sm text-emerald-900 sm:h-[560px]">
      Loading the 3D Biology laboratory…
    </div>
  ),
});

export function BiologyLabRoom({
  model,
  objectiveId,
  focusOffsetMicrometres,
  illumination,
  specimen,
  variant,
  slide,
  specimens,
  activeSpecimenId,
  selectedPart,
  microscopeSelected,
  teacherHint,
  observation,
  onInspectPart,
  onSelectMicroscope,
  onSelectSpecimen,
  onStageClick,
  onClipClick,
}: {
  model: MicroscopeModelSpec;
  objectiveId: string;
  focusOffsetMicrometres: number;
  illumination: { power: boolean; intensity: number; diaphragm: number; condenser: number; mirrorAligned: boolean };
  specimen: SpecimenSpec | null;
  variant: SpecimenVariant | null;
  slide: SlideState | null;
  specimens: SpecimenSpec[];
  activeSpecimenId: string | null;
  selectedPart: string | null;
  microscopeSelected: boolean;
  teacherHint: string | null;
  observation: ObservationResult | null;
  onInspectPart: (id: string) => void;
  onSelectMicroscope: (id: string) => void;
  onSelectSpecimen: (id: string) => void;
  onStageClick: () => void;
  onClipClick: () => void;
}) {
  const [supported] = useState(() => detectWebGL());
  const [view, setView] = useState<"3d" | "2d">(() => (supported ? "3d" : "2d"));
  const markReady = useLabReadySignal();

  useEffect(() => {
    if (!supported) markReady?.();
  }, [markReady, supported]);

  return (
    <section className="grid gap-2" aria-label="Biology laboratory room">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-600">
          Choose a microscope or specimen in the room. Every room action also has an accessible control below.
        </p>
        <div className="flex gap-1.5" role="group" aria-label="Laboratory view">
          <button
            type="button"
            onClick={() => setView("3d")}
            disabled={!supported}
            aria-pressed={view === "3d"}
            className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${view === "3d" ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700 disabled:opacity-40"}`}
          >
            {supported ? "3D laboratory" : "3D unavailable"}
          </button>
          <button
            type="button"
            onClick={() => setView("2d")}
            aria-pressed={view === "2d"}
            className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${view === "2d" ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700"}`}
          >
            2D bench
          </button>
        </div>
      </div>

      {view === "3d" ? (
        <Room3D
          model={model}
          objectiveId={objectiveId}
          focusOffsetMicrometres={focusOffsetMicrometres}
          illumination={illumination}
          specimen={specimen}
          slide={slide}
          specimens={specimens}
          activeSpecimenId={activeSpecimenId}
          selectedPart={selectedPart}
          microscopeSelected={microscopeSelected}
          teacherHint={teacherHint}
          onInspectPart={onInspectPart}
          onSelectMicroscope={onSelectMicroscope}
          onSelectSpecimen={onSelectSpecimen}
          onStageClick={onStageClick}
          onClipClick={onClipClick}
        />
      ) : (
        <BiologyBench2D
          model={model}
          specimen={specimen}
          variant={variant}
          specimens={specimens}
          activeSpecimenId={activeSpecimenId}
          slide={slide}
          selectedPart={selectedPart}
          observation={observation}
          onInspectPart={onInspectPart}
          onSelectSpecimen={onSelectSpecimen}
          onStageClick={onStageClick}
          onClipClick={onClipClick}
          onSelectMicroscope={onSelectMicroscope}
        />
      )}

      {!supported ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950">
          WebGL is not available on this device, so the 2D bench is shown. The simulation, optics and assessment are identical.
        </p>
      ) : null}
    </section>
  );
}
