import { createStore, type StoreApi } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PhysicsData, PhysicsStationId } from "@/lib/content/physics";
import {
  clamp,
  densityFromMassVolume,
  liquidDensity,
  metreRuleReading,
  micrometerReading,
  parallaxReading,
  readingWithin,
  roundTo,
  solidVolumeCm3,
  stopwatchReading,
  vernierReading,
  type DensityReading,
  type LiquidDensityReading,
  type MetreRuleReading,
  type MicrometerReading,
  type ParallaxReading,
  type StopwatchReading,
  type StationEvaluation,
  type VernierReading,
} from "@/lib/engine/physics/measurement";

export type PhysicsMode = "guided" | "independent";
export type FeedbackKind = "info" | "success" | "error";

export type MeasurementRow = {
  label: string;
  value: number;
  unit: string;
  source: "student";
};

export type PhysicsEntry = {
  stationId: PhysicsStationId;
  title: string;
  sampleName: string;
  readings: MeasurementRow[];
  derived: MeasurementRow[];
  observation: string;
  conclusion: string;
  recordedAt: string | null;
  savedAt: string | null;
  completed: boolean;
};

export type PhysicsLabState = {
  data: PhysicsData;
  mode: PhysicsMode;
  seed: number;
  activeStationId: PhysicsStationId;
  vernier: { jawGapMm: number };
  micrometer: { spindleGapMm: number };
  rule: { startCm: number; endCm: number };
  stopwatch: { elapsedMs: number; running: boolean };
  parallax: { eyeOffsetMm: number };
  density: {
    solidDiameterMm: number;
    solidHeightMm: number;
    solidMassG: number;
    emptyMassG: number;
    filledMassG: number;
    liquidVolumeMl: number;
  };
  entries: Partial<Record<PhysicsStationId, PhysicsEntry>>;
  completedStations: PhysicsStationId[];
  mistakes: string[];
  feedback: string;
  feedbackKind: FeedbackKind;
};

export type PhysicsAction =
  | { type: "selectStation"; id: PhysicsStationId }
  | { type: "setMode"; mode: PhysicsMode; seed?: number }
  | { type: "setVernierJaw"; value: number }
  | { type: "nudgeVernier"; steps: number }
  | { type: "closeVernierSample" }
  | { type: "setMicrometerSpindle"; value: number }
  | { type: "nudgeMicrometer"; steps: number }
  | { type: "closeMicrometerSample" }
  | { type: "setRuleStart"; value: number }
  | { type: "setRuleEnd"; value: number }
  | { type: "placeRuleSample" }
  | { type: "startStopwatch" }
  | { type: "stopStopwatch" }
  | { type: "resetStopwatch" }
  | { type: "tickStopwatch"; deltaMs: number }
  | { type: "setEyeOffset"; value: number }
  | { type: "alignEye" }
  | { type: "measureSolidDiameter" }
  | { type: "measureSolidHeight" }
  | { type: "measureSolidMass" }
  | { type: "measureEmptyCylinder" }
  | { type: "measureFilledCylinder" }
  | { type: "resetDensity" }
  | { type: "resetStation" }
  | { type: "recordReading"; at?: string }
  | { type: "setObservationText"; text: string }
  | { type: "setConclusion"; text: string }
  | { type: "saveEntry"; at?: string }
  | { type: "setFeedback"; message: string; kind?: FeedbackKind };

type PersistedPhysics = Pick<
  PhysicsLabState,
  | "mode"
  | "seed"
  | "activeStationId"
  | "vernier"
  | "micrometer"
  | "rule"
  | "stopwatch"
  | "parallax"
  | "density"
  | "entries"
  | "completedStations"
  | "mistakes"
  | "feedback"
  | "feedbackKind"
>;

export type PhysicsStore = PhysicsLabState & { dispatch: (action: PhysicsAction) => void };

export function createPhysicsState(data: PhysicsData, seed = 1): PhysicsLabState {
  return {
    data,
    mode: "guided",
    seed,
    activeStationId: data.defaultStationId,
    vernier: { jawGapMm: roundTo(18 + (seed % 4) * 0.1, 0.1) },
    micrometer: { spindleGapMm: 4.5 },
    rule: { startCm: 0, endCm: 10 },
    stopwatch: { elapsedMs: 0, running: false },
    parallax: { eyeOffsetMm: 8 },
    density: {
      solidDiameterMm: 0,
      solidHeightMm: 0,
      solidMassG: 0,
      emptyMassG: 0,
      filledMassG: 0,
      liquidVolumeMl: 0,
    },
    entries: {},
    completedStations: [],
    mistakes: [],
    feedback: "Choose an instrument and take a reading. Every value comes from the simulated apparatus.",
    feedbackKind: "info",
  };
}

export function currentStation(state: PhysicsLabState) {
  return state.data.stations.find((station) => station.id === state.activeStationId) ?? state.data.stations[0];
}

export function currentEntry(state: PhysicsLabState): PhysicsEntry | null {
  return state.entries[state.activeStationId] ?? null;
}

export function currentVernier(state: PhysicsLabState): VernierReading {
  return vernierReading(state.vernier.jawGapMm, state.data.instruments.vernier);
}

export function currentMicrometer(state: PhysicsLabState): MicrometerReading {
  return micrometerReading(state.micrometer.spindleGapMm, state.data.instruments.micrometer);
}

export function currentRule(state: PhysicsLabState): MetreRuleReading {
  return metreRuleReading(state.rule.startCm, state.rule.endCm, state.data.instruments.metreRule);
}

export function currentStopwatch(state: PhysicsLabState): StopwatchReading {
  return stopwatchReading(state.stopwatch.elapsedMs, state.data.instruments.stopwatch);
}

export function currentParallax(state: PhysicsLabState): ParallaxReading {
  return parallaxReading(
    state.data.instruments.parallax.trueReadingMm,
    state.parallax.eyeOffsetMm,
    state.data.instruments.parallax,
  );
}

export function currentSolidDensity(state: PhysicsLabState): DensityReading {
  const { solidDiameterMm, solidHeightMm, solidMassG } = state.density;
  return densityFromMassVolume(solidMassG, solidVolumeCm3(solidDiameterMm, solidHeightMm));
}

export function currentLiquidDensity(state: PhysicsLabState): LiquidDensityReading {
  return liquidDensity(
    state.data.samples.liquid,
    state.density.emptyMassG,
    state.density.filledMassG,
    state.density.liquidVolumeMl,
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function withFeedback(state: PhysicsLabState, message: string, kind: FeedbackKind): PhysicsLabState {
  return { ...state, feedback: message, feedbackKind: kind };
}

function setEntry(state: PhysicsLabState, entry: PhysicsEntry): PhysicsLabState {
  return { ...state, entries: { ...state.entries, [entry.stationId]: entry } };
}

function row(label: string, value: number, unit: string): MeasurementRow {
  return { label, value, unit, source: "student" };
}

function roundingDecimals(step: number): number {
  if (step >= 1) return 0;
  if (step >= 0.1) return 1;
  if (step >= 0.01) return 2;
  return 3;
}

function measurementRows(state: PhysicsLabState, stationId: PhysicsStationId): { readings: MeasurementRow[]; derived: MeasurementRow[]; sampleName: string } {
  const { data } = state;
  if (stationId === "vernier") {
    const reading = currentVernier(state);
    const decimals = roundingDecimals(data.instruments.vernier.leastCountMm);
    return {
      sampleName: data.samples.vernier.name,
      readings: [
        row("Main-scale reading", reading.mainScaleMm, "mm"),
        row("Coinciding Vernier division", reading.vernierDivision, "division"),
      ],
      derived: [
        row("Observed length", Number(reading.displayCm.toFixed(decimals + 1)), "cm"),
        row("Corrected length", Number((reading.correctedMm / 10).toFixed(decimals + 1)), "cm"),
      ],
    };
  }
  if (stationId === "micrometer") {
    const reading = currentMicrometer(state);
    return {
      sampleName: data.samples.micrometer.name,
      readings: [
        row("Sleeve reading", reading.sleeveMm, "mm"),
        row("Thimble division", reading.thimbleDivision, "division"),
        row("Zero error", reading.zeroErrorMm, "mm"),
      ],
      derived: [
        row("Observed thickness", reading.observedMm, "mm"),
        row("Corrected thickness", reading.correctedMm, "mm"),
      ],
    };
  }
  if (stationId === "metre-rule") {
    const reading = currentRule(state);
    return {
      sampleName: data.samples.metreRule.name,
      readings: [row("Start mark", reading.startCm, "cm"), row("End mark", reading.endCm, "cm")],
      derived: [row("Measured length", reading.lengthCm, "cm")],
    };
  }
  if (stationId === "stopwatch") {
    const reading = currentStopwatch(state);
    return {
      sampleName: data.samples.stopwatch.name,
      readings: [row("Stopwatch display", reading.seconds, "s")],
      derived: [row("Time interval", Number(reading.display), "s")],
    };
  }
  if (stationId === "parallax") {
    const reading = currentParallax(state);
    return {
      sampleName: data.instruments.parallax.name,
      readings: [
        row("Eye offset", reading.eyeOffsetMm, "mm"),
        row("Observed scale reading", reading.observedMm, "mm"),
      ],
      derived: [row("Parallax shift", reading.shiftMm, "mm")],
    };
  }

  const solid = currentSolidDensity(state);
  const liquid = currentLiquidDensity(state);
  const solidReady = state.density.solidDiameterMm > 0 && state.density.solidHeightMm > 0 && state.density.solidMassG > 0;
  const liquidReady = state.density.emptyMassG > 0 && state.density.filledMassG > 0 && state.density.liquidVolumeMl > 0;
  return {
    sampleName: `${data.samples.solid.name} and ${data.samples.liquid.name}`,
    readings: [
      ...(solidReady
        ? [
            row("Solid mass", state.density.solidMassG, "g"),
            row("Solid diameter", state.density.solidDiameterMm, "mm"),
            row("Solid height", state.density.solidHeightMm, "mm"),
          ]
        : []),
      ...(liquidReady
        ? [
            row("Empty cylinder mass", state.density.emptyMassG, "g"),
            row("Filled cylinder mass", state.density.filledMassG, "g"),
            row("Liquid volume", state.density.liquidVolumeMl, "cm3"),
          ]
        : []),
    ],
    derived: [
      ...(solidReady
        ? [
            row("Solid volume", Number(solid.volumeCm3.toFixed(2)), "cm3"),
            row("Solid density", Number(solid.densityGCm3.toFixed(2)), "g/cm3"),
          ]
        : []),
      ...(liquidReady
        ? [
            row("Liquid mass", Number(liquid.liquidMassG.toFixed(1)), "g"),
            row("Liquid density", Number(liquid.densityGCm3.toFixed(2)), "g/cm3"),
          ]
        : []),
    ],
  };
}

export function evaluateStation(state: PhysicsLabState, stationId: PhysicsStationId = state.activeStationId): StationEvaluation {
  const entry = state.entries[stationId];
  const mistakes: string[] = [];
  const completedChecks: string[] = [];
  if (!entry || entry.readings.length === 0) {
    return {
      stationId,
      ok: false,
      mistakes: ["No reading has been recorded for this station."],
      completedChecks: [],
    };
  }

  const { data } = state;
  if (stationId === "vernier") {
    const reading = currentVernier(state);
    const target = data.samples.vernier.actualLengthMm + data.instruments.vernier.zeroErrorMm;
    if (readingWithin(reading.observedMm, target, data.instruments.vernier.leastCountMm / 2)) {
      completedChecks.push("Vernier jaws closed on the rod");
    } else {
      mistakes.push("Vernier: close the jaws gently on the rod before reading the scale.");
    }
  } else if (stationId === "micrometer") {
    const reading = currentMicrometer(state);
    if (readingWithin(reading.correctedMm, data.samples.micrometer.actualThicknessMm, data.instruments.micrometer.leastCountMm / 2)) {
      completedChecks.push("Zero error subtracted correctly");
    } else {
      mistakes.push("Micrometer: correct the observed reading by subtracting the +0.02 mm zero error.");
    }
  } else if (stationId === "metre-rule") {
    const reading = currentRule(state);
    if (readingWithin(reading.lengthCm, data.samples.metreRule.actualLengthCm, 0.05) && reading.startCm >= data.instruments.metreRule.wornZeroOffsetCm * 0.75) {
      completedChecks.push("Measured between two marks, away from the worn end");
    } else if (reading.startCm < data.instruments.metreRule.wornZeroOffsetCm * 0.75) {
      mistakes.push("Metre rule: do not measure from the damaged zero end. Use a start mark and subtract.");
    } else {
      mistakes.push("Metre rule: measure the wire between two readable marks.");
    }
  } else if (stationId === "stopwatch") {
    const reading = currentStopwatch(state);
    if (readingWithin(reading.seconds + reading.hundredths / 100, data.samples.stopwatch.targetSeconds, 0.1)) {
      completedChecks.push("Stopwatch stopped at the timed event");
    } else {
      mistakes.push("Stopwatch: the interval is not within 0.10 s of the target event.");
    }
  } else if (stationId === "parallax") {
    const reading = currentParallax(state);
    if (reading.aligned) {
      completedChecks.push("Eye aligned with the pointer");
    } else {
      mistakes.push("Parallax: align your eye with the pointer so the scale reading does not shift.");
    }
  } else {
    const solid = currentSolidDensity(state);
    const liquid = currentLiquidDensity(state);
    const solidReady = state.density.solidDiameterMm > 0 && state.density.solidHeightMm > 0 && state.density.solidMassG > 0;
    const liquidReady = state.density.emptyMassG > 0 && state.density.filledMassG > 0 && state.density.liquidVolumeMl > 0;
    if (!solidReady || !liquidReady) {
      mistakes.push("Density: measure the solid and the liquid before recording the result.");
    } else {
      if (Math.abs(solid.densityGCm3 - data.samples.solid.acceptedDensityGCm3) <= 0.05) {
        completedChecks.push("Solid density calculated");
      } else {
        mistakes.push("Density: check the solid dimensions, mass and volume calculation.");
      }
      if (Math.abs(liquid.densityGCm3 - data.samples.liquid.acceptedDensityGCm3) <= 0.05) {
        completedChecks.push("Liquid density calculated");
      } else {
        mistakes.push("Density: check the empty mass, filled mass and liquid volume.");
      }
    }
  }

  return { stationId, ok: mistakes.length === 0, mistakes, completedChecks };
}

export function examBreakdown(state: PhysicsLabState) {
  const entries = Object.values(state.entries).filter((entry): entry is PhysicsEntry => Boolean(entry));
  const stationChecks = state.data.stations.map((station) => evaluateStation(state, station.id));
  return {
    saved: entries.filter((entry) => entry.savedAt).length,
    completed: entries.filter((entry) => entry.completed).length,
    total: state.data.stations.length,
    stationChecks,
    mistakes: unique([...state.mistakes, ...stationChecks.flatMap((check) => check.mistakes)]),
  };
}

export function reducePhysics(state: PhysicsLabState, action: PhysicsAction): PhysicsLabState {
  const { data } = state;
  switch (action.type) {
    case "selectStation":
      return withFeedback({ ...state, activeStationId: action.id }, `Station: ${data.stations.find((station) => station.id === action.id)?.title ?? action.id}.`, "info");
    case "setMode":
      return withFeedback(
        { ...state, mode: action.mode, seed: action.seed ?? state.seed },
        action.mode === "guided" ? "Guided practice: hints and immediate feedback are available." : "Independent assessment: procedural hints are hidden. Your mistake breakdown appears when you save.",
        "info",
      );
    case "setVernierJaw":
      return {
        ...state,
        vernier: { jawGapMm: roundTo(clamp(action.value, 0, data.instruments.vernier.rangeMm), data.instruments.vernier.leastCountMm) },
      };
    case "nudgeVernier":
      return {
        ...state,
        vernier: {
          jawGapMm: roundTo(
            clamp(state.vernier.jawGapMm + action.steps * data.instruments.vernier.leastCountMm, 0, data.instruments.vernier.rangeMm),
            data.instruments.vernier.leastCountMm,
          ),
        },
      };
    case "closeVernierSample":
      return withFeedback(
        {
          ...state,
          vernier: { jawGapMm: data.samples.vernier.actualLengthMm },
        },
        "Jaws closed gently on the rod. Read the main scale and the coinciding Vernier division.",
        "info",
      );
    case "setMicrometerSpindle":
      return {
        ...state,
        micrometer: { spindleGapMm: roundTo(clamp(action.value, 0, data.instruments.micrometer.rangeMm), data.instruments.micrometer.leastCountMm) },
      };
    case "nudgeMicrometer":
      return {
        ...state,
        micrometer: {
          spindleGapMm: roundTo(
            clamp(state.micrometer.spindleGapMm + action.steps * data.instruments.micrometer.leastCountMm, 0, data.instruments.micrometer.rangeMm),
            data.instruments.micrometer.leastCountMm,
          ),
        },
      };
    case "closeMicrometerSample":
      return withFeedback(
        { ...state, micrometer: { spindleGapMm: data.samples.micrometer.actualThicknessMm } },
        "Spindle advanced with the ratchet until it just touched the gauge.",
        "info",
      );
    case "setRuleStart":
      return { ...state, rule: { ...state.rule, startCm: roundTo(clamp(action.value, 0, data.instruments.metreRule.lengthCm), 0.1) } };
    case "setRuleEnd":
      return { ...state, rule: { ...state.rule, endCm: roundTo(clamp(action.value, 0, data.instruments.metreRule.lengthCm), 0.1) } };
    case "placeRuleSample":
      return withFeedback(
        {
          ...state,
          rule: {
            startCm: data.samples.metreRule.placementStartCm,
            endCm: roundTo(data.samples.metreRule.placementStartCm + data.samples.metreRule.actualLengthCm, 0.1),
          },
        },
        "Wire placed between two readable marks. Subtract the start mark from the end mark.",
        "info",
      );
    case "startStopwatch":
      return { ...state, stopwatch: { ...state.stopwatch, running: true } };
    case "stopStopwatch":
      return { ...state, stopwatch: { ...state.stopwatch, running: false } };
    case "resetStopwatch":
      return { ...state, stopwatch: { elapsedMs: 0, running: false } };
    case "tickStopwatch":
      if (!state.stopwatch.running || action.deltaMs <= 0) return state;
      return { ...state, stopwatch: { ...state.stopwatch, elapsedMs: state.stopwatch.elapsedMs + action.deltaMs } };
    case "setEyeOffset":
      return { ...state, parallax: { eyeOffsetMm: roundTo(clamp(action.value, -12, 12), 0.1) } };
    case "alignEye":
      return withFeedback({ ...state, parallax: { eyeOffsetMm: 0 } }, "Eye aligned with the pointer and scale.", "success");
    case "measureSolidDiameter":
      return {
        ...state,
        density: { ...state.density, solidDiameterMm: data.samples.solid.diameterMm },
      };
    case "measureSolidHeight":
      return { ...state, density: { ...state.density, solidHeightMm: data.samples.solid.heightMm } };
    case "measureSolidMass":
      return { ...state, density: { ...state.density, solidMassG: data.samples.solid.massG } };
    case "measureEmptyCylinder":
      return { ...state, density: { ...state.density, emptyMassG: data.samples.liquid.emptyMassG } };
    case "measureFilledCylinder":
      return {
        ...state,
        density: {
          ...state.density,
          filledMassG: data.samples.liquid.filledMassG,
          liquidVolumeMl: data.samples.liquid.volumeMl,
        },
      };
    case "resetDensity":
      return {
        ...state,
        density: { solidDiameterMm: 0, solidHeightMm: 0, solidMassG: 0, emptyMassG: 0, filledMassG: 0, liquidVolumeMl: 0 },
      };
    case "resetStation": {
      const initial = createPhysicsState(data, state.seed);
      const resetKey = state.activeStationId === "metre-rule" ? "rule" : state.activeStationId;
      const reset = {
        vernier: initial.vernier,
        micrometer: initial.micrometer,
        rule: initial.rule,
        stopwatch: initial.stopwatch,
        parallax: initial.parallax,
        density: initial.density,
      }[resetKey];
      return withFeedback({ ...state, [resetKey]: reset } as PhysicsLabState, "Station apparatus reset. Notebook entries are kept.", "info");
    }
    case "recordReading": {
      const station = currentStation(state);
      const { readings, derived, sampleName } = measurementRows(state, station.id);
      if (readings.length === 0) {
        return withFeedback(state, "No instrument reading is available yet. Measure the sample first.", "error");
      }
      const existing = state.entries[station.id];
      const entry: PhysicsEntry = {
        stationId: station.id,
        title: station.title,
        sampleName,
        readings,
        derived,
        observation: existing?.observation ?? "",
        conclusion: existing?.conclusion ?? "",
        recordedAt: action.at ?? "",
        savedAt: existing?.savedAt ?? null,
        completed: false,
      };
      return withFeedback(setEntry(state, entry), "Reading taken from the simulated apparatus and added to your notebook draft.", "success");
    }
    case "setObservationText":
      if (!currentEntry(state)) return state;
      return setEntry(state, { ...currentEntry(state)!, observation: action.text });
    case "setConclusion":
      if (!currentEntry(state)) return state;
      return setEntry(state, { ...currentEntry(state)!, conclusion: action.text });
    case "saveEntry": {
      const entry = currentEntry(state);
      if (!entry || entry.readings.length === 0) {
        return withFeedback(state, "Record at least one instrument reading before saving the station.", "error");
      }
      if (entry.observation.trim().length < 8) {
        return withFeedback(state, "Write a short observation from what you actually measured before saving.", "error");
      }
      const evaluation = evaluateStation(state, entry.stationId);
      const mistakes = unique([...state.mistakes, ...evaluation.mistakes]);
      if (!evaluation.ok && state.mode === "guided") {
        return withFeedback(
          { ...state, mistakes },
          `Not quite yet. ${evaluation.mistakes.join(" ")} Retry this station.`,
          "error",
        );
      }
      const completed = evaluation.ok;
      const nextEntry: PhysicsEntry = {
        ...entry,
        savedAt: action.at ?? "",
        completed,
      };
      const completedStations = completed
        ? unique([...state.completedStations, entry.stationId]) as PhysicsStationId[]
        : state.completedStations.filter((id) => id !== entry.stationId);
      const next = setEntry({ ...state, mistakes, completedStations }, nextEntry);
      if (!evaluation.ok) {
        return withFeedback(
          next,
          "Station saved. Your independent mistake breakdown is ready in the notebook.",
          "info",
        );
      }
      return withFeedback(next, `${entry.title} saved. Station complete.`, "success");
    }
    case "setFeedback":
      return withFeedback(state, action.message, action.kind ?? "info");
    default:
      return state;
  }
}

export function createPhysicsMeasurementStore(data: PhysicsData, seed = 1): StoreApi<PhysicsStore> {
  const initial = createPhysicsState(data, seed);
  return createStore<PhysicsStore>()(
    persist(
      (set, get) => ({
        ...initial,
        dispatch: (action: PhysicsAction) => {
          const next = reducePhysics(get(), action);
          set({ ...next, dispatch: get().dispatch });
        },
      }),
      {
        name: "expera-physics-measurement-v1",
        storage: createJSONStorage(() => localStorage),
        partialize: (state): PersistedPhysics => ({
          mode: state.mode,
          seed: state.seed,
          activeStationId: state.activeStationId,
          vernier: state.vernier,
          micrometer: state.micrometer,
          rule: state.rule,
          stopwatch: state.stopwatch,
          parallax: state.parallax,
          density: state.density,
          entries: state.entries,
          completedStations: state.completedStations,
          mistakes: state.mistakes,
          feedback: state.feedback,
          feedbackKind: state.feedbackKind,
        }),
        merge: (persisted, current) => {
          const saved = persisted as Partial<PersistedPhysics> | undefined;
          if (!saved) return current;
          return {
            ...current,
            ...saved,
            entries: { ...current.entries, ...(saved.entries ?? {}) },
            data: current.data,
            dispatch: current.dispatch,
          };
        },
      },
    ),
  );
}
