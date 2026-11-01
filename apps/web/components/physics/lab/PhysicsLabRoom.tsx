"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectWebGL } from "@/lib/device";
import type { PhysicsStation, PhysicsStationId } from "@/lib/content/physics";
import type { Apparatus } from "@/lib/content/schemas";
import type {
  DensityReading,
  LiquidDensityReading,
  MetreRuleReading,
  MicrometerReading,
  ParallaxReading,
  StopwatchReading,
  VernierReading,
} from "@/lib/engine/physics/measurement";
import type { PhysicsMode } from "@/lib/sim/physicsMeasurementStore";
import { PhysicsBench2D } from "./PhysicsBench2D";

const Room3D = dynamic(() => import("@/components/sim3d/physics/PhysicsLabRoom3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[430px] items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-sm text-sky-200 sm:h-[560px]">
      <div className="text-center">
        <span className="mb-2 block text-2xl">◌</span>
        Loading the 3D measurement laboratory…
      </div>
    </div>
  ),
});

export type PhysicsRoomProps = {
  activeStationId: PhysicsStationId;
  stations: PhysicsStation[];
  completedStations: PhysicsStationId[];
  mode: PhysicsMode;
  vernier: VernierReading;
  micrometer: MicrometerReading;
  rule: MetreRuleReading;
  stopwatch: StopwatchReading;
  parallax: ParallaxReading;
  solid: DensityReading;
  liquid: LiquidDensityReading;
  guide?: Apparatus | null;
  onDismissGuide?: () => void;
  onSelectStation: (id: PhysicsStationId) => void;
};

export function PhysicsLabRoom(props: PhysicsRoomProps) {
  const [supported, setSupported] = useState(false);
  const [view, setView] = useState<"3d" | "2d">("2d");

  useEffect(() => {
    const webgl = detectWebGL();
    setSupported(webgl);
    if (webgl) setView("3d");
  }, []);

  return (
    <section className="grid gap-2" aria-label="Physics measurement laboratory room">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-slate-500">
          Select an instrument station in the room. Everything shown in 3D is also available in the controls below.
        </p>
        <div className="flex gap-1.5" role="group" aria-label="Laboratory view">
          <button
            type="button"
            onClick={() => setView("3d")}
            disabled={!supported}
            aria-pressed={view === "3d"}
            className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition ${view === "3d" ? "border-sky-800 bg-sky-800 text-white" : "border-slate-300 bg-white text-slate-700 disabled:opacity-40"}`}
          >
            {supported ? "3D laboratory" : "3D unavailable"}
          </button>
          <button
            type="button"
            onClick={() => setView("2d")}
            aria-pressed={view === "2d"}
            className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition ${view === "2d" ? "border-sky-800 bg-sky-800 text-white" : "border-slate-300 bg-white text-slate-700"}`}
          >
            2D bench
          </button>
        </div>
      </div>

      {view === "3d" ? (
        <Room3D {...props} />
      ) : (
        <PhysicsBench2D {...props} />
      )}

      {!supported ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950">
          WebGL is not available on this device, so the 2D bench is shown. The simulation, readings and notebook are identical.
        </p>
      ) : null}
    </section>
  );
}
