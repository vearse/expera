"use client";

import { createStore } from "zustand";
import { useMemo } from "react";
import { PhaserHost } from "@/components/phaser/PhaserHost";
import { buildTitrationScene, type TitrationBenchState } from "@/lib/scenes/titrationScene";
import type { Experiment } from "@/lib/content/schemas";
import type { LabData } from "@/lib/runtime/types";
import { ExperimentRunner } from "@/components/runner/ExperimentRunner";
import { GuideTip } from "@/components/gamification/GuideTip";

export function LabBenchShell({ experiment, data }: { experiment: Experiment; data: LabData }) {
  const store = useMemo(
    () => createStore<TitrationBenchState>(() => ({ buretteMl: 0, flaskMl: 50, tapOpen: false })),
    [],
  );
  const showPhaser = experiment.id === "titration";

  return (
    <div className="grid gap-4">
      <GuideTip context="lab" />
      {showPhaser && (
        <PhaserHost
          store={store}
          createScene={(Phaser, s) => buildTitrationScene(Phaser, s)}
        />
      )}
      <ExperimentRunner experiment={experiment} data={data} />
    </div>
  );
}
