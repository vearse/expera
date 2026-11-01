import { createStore, type StoreApi } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PendulumBob, PendulumData, PendulumGravityPreset, PendulumTaskSpec } from "@/lib/content/pendulum";
import {
  formatStopwatch,
  gravityFromPeriodSquaredFit,
  lineOfBestFit,
  measureAngle,
  measureLength,
  periodSquared,
  reactionDelayS,
  stepPendulum,
  pendulumCrossing,
  type LengthMeasurementMethod,
  type PendulumCrossing,
  type PendulumFit,
  type PendulumMotion,
  type PendulumPhysics,
} from "@/lib/engine/physics/pendulum";

export type PendulumMode = "guided" | "independent";
export type FeedbackKind = "info" | "success" | "error";
export type TimingPhase = "idle" | "waiting" | "timing" | "stopping" | "complete";

export type PendulumParams = {
  stringLengthM: number;
  releaseAngleDeg: number;
  bobId: string;
  gravityId: string;
  dampingOn: boolean;
};

export type PendulumLengthReading = {
  measuredM: number;
  trueEffectiveM: number;
  systematicErrorM: number;
  method: LengthMeasurementMethod;
  measuredAt: string | null;
};

export type PendulumAngleReading = {
  valueDeg: number;
  resolutionDeg: number;
  measuredAt: string | null;
};

export type PendulumTracePoint = {
  timeS: number;
  thetaDeg: number;
};

export type PendulumSimulation = {
  thetaRad: number;
  omegaRadS: number;
  timeS: number;
  running: boolean;
  accumulatorS: number;
  trace: PendulumTracePoint[];
  lastTraceS: number;
  crossings: number;
  initialAmplitudeDeg: number;
  lastPeakAmplitudeDeg: number;
  lastPeakAtS: number;
};

export type PendulumTiming = {
  n: number;
  phase: TimingPhase;
  sequence: number;
  startDelayS: number;
  stopDelayS: number;
  startCrossingS: number | null;
  stopCrossingS: number | null;
  startAtS: number | null;
  stopAtS: number | null;
  measuredTimeS: number | null;
  periodS: number | null;
  cycles: number;
  initialAmplitudeDeg: number;
  finalAmplitudeDeg: number | null;
};

export type PendulumRow = {
  id: string;
  sequence: number;
  recordedAt: string;
  lengthM: number;
  method: LengthMeasurementMethod;
  trueEffectiveM: number;
  stringLengthM: number;
  bobId: string;
  bobMassKg: number;
  bobRadiusM: number;
  gravityId: string;
  gravityMS2: number;
  releaseAngleDeg: number;
  measuredAngleDeg: number;
  dampingOn: boolean;
  n: number;
  totalTimeS: number;
  periodS: number;
  periodSquaredS2: number;
  initialAmplitudeDeg: number;
  finalAmplitudeDeg: number;
};

export type PendulumAnalysis = {
  fit: PendulumFit;
  gMeasuredMS2: number;
  acceptedGMS2: number;
  percentError: number;
  rowCount: number;
  gravityId: string;
  analysedAt: string;
};

export type PendulumTaskProgress = PendulumTaskSpec & {
  done: boolean;
  evidence: string;
};

export type PendulumEvaluation = {
  graphRows: PendulumRow[];
  rowCount: number;
  distinctLengths: number;
  graphReady: boolean;
  analysis: PendulumAnalysis | null;
  tasks: PendulumTaskProgress[];
  completedChecks: string[];
  mistakes: string[];
  accuracy: "excellent" | "good" | "review" | "not-ready";
  keyIdea: string;
  revision: string;
  ok: boolean;
};

export type PendulumLabState = {
  data: PendulumData;
  mode: PendulumMode;
  seed: number;
  params: PendulumParams;
  measuredLength: PendulumLengthReading | null;
  measuredAngle: PendulumAngleReading | null;
  simulation: PendulumSimulation;
  timing: PendulumTiming;
  rows: PendulumRow[];
  analysis: PendulumAnalysis | null;
  mistakes: string[];
  feedback: string;
  feedbackKind: FeedbackKind;
};

export type PendulumAction =
  | { type: "setMode"; mode: PendulumMode; seed?: number }
  | { type: "setStringLength"; value: number }
  | { type: "setReleaseAngle"; value: number }
  | { type: "setBob"; id: string }
  | { type: "setGravity"; id: string }
  | { type: "setDamping"; enabled: boolean }
  | { type: "setOscillations"; n: number }
  | { type: "measureLength"; method: LengthMeasurementMethod; at?: string }
  | { type: "measureReleaseAngle"; at?: string }
  | { type: "release" }
  | { type: "beginTiming" }
  | { type: "advance"; deltaS: number }
  | { type: "recordRow"; at?: string }
  | { type: "analyse"; at?: string }
  | { type: "resetExperiment" }
  | { type: "clearRows" }
  | { type: "setFeedback"; message: string; kind?: FeedbackKind };

type PersistedPendulum = Pick<
  PendulumLabState,
  "mode" | "seed" | "params" | "measuredLength" | "measuredAngle" | "rows" | "analysis" | "mistakes" | "feedback" | "feedbackKind"
>;

export type PendulumStore = PendulumLabState & { dispatch: (action: PendulumAction) => void };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, step: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) return 0;
  const decimals = Math.max(0, Math.ceil(-Math.log10(step)));
  return Number((Math.round(value / step) * step).toFixed(decimals));
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function defaultParams(data: PendulumData): PendulumParams {
  return {
    stringLengthM: data.length.defaultM,
    releaseAngleDeg: data.angle.defaultDeg,
    bobId: data.defaultBobId,
    gravityId: data.defaultGravityId,
    dampingOn: data.damping.defaultEnabled,
  };
}

function createSimulation(data: PendulumData, params: PendulumParams): PendulumSimulation {
  return {
    thetaRad: (params.releaseAngleDeg * Math.PI) / 180,
    omegaRadS: 0,
    timeS: 0,
    running: false,
    accumulatorS: 0,
    trace: [{ timeS: 0, thetaDeg: params.releaseAngleDeg }],
    lastTraceS: 0,
    crossings: 0,
    initialAmplitudeDeg: params.releaseAngleDeg,
    lastPeakAmplitudeDeg: params.releaseAngleDeg,
    lastPeakAtS: 0,
  };
}

function createTiming(data: PendulumData, params: PendulumParams): PendulumTiming {
  return {
    n: data.timing.defaultOscillations,
    phase: "idle",
    sequence: 0,
    startDelayS: 0,
    stopDelayS: 0,
    startCrossingS: null,
    stopCrossingS: null,
    startAtS: null,
    stopAtS: null,
    measuredTimeS: null,
    periodS: null,
    cycles: 0,
    initialAmplitudeDeg: params.releaseAngleDeg,
    finalAmplitudeDeg: null,
  };
}

export function createPendulumState(data: PendulumData, seed = 1): PendulumLabState {
  const params = defaultParams(data);
  return {
    data,
    mode: "guided",
    seed,
    params,
    measuredLength: null,
    measuredAngle: null,
    simulation: createSimulation(data, params),
    timing: createTiming(data, params),
    rows: [],
    analysis: null,
    mistakes: [],
    feedback: "Measure the effective length of the pendulum, then release it and time 10 oscillations.",
    feedbackKind: "info",
  };
}

export function currentBob(state: PendulumLabState): PendulumBob {
  return state.data.bobs.find((bob) => bob.id === state.params.bobId) ?? state.data.bobs[0];
}

export function currentGravity(state: PendulumLabState): PendulumGravityPreset {
  return state.data.gravityPresets.find((gravity) => gravity.id === state.params.gravityId) ?? state.data.gravityPresets[0];
}

export function currentEffectiveLengthM(state: PendulumLabState): number {
  return state.params.stringLengthM + currentBob(state).radiusM;
}

export function currentPhysics(state: PendulumLabState): PendulumPhysics {
  const bob = currentBob(state);
  const gravity = currentGravity(state);
  return {
    effectiveLengthM: currentEffectiveLengthM(state),
    gravityMS2: gravity.accelerationMS2,
    bobMassKg: bob.massKg,
    bobRadiusM: bob.radiusM,
    dampingCoefficientS: state.params.dampingOn ? state.data.damping.onCoefficient : state.data.damping.offCoefficient,
    timeStepS: state.data.timing.timeStepS,
  };
}

export function stopwatchTimeS(state: PendulumLabState): number {
  const timing = state.timing;
  if (timing.phase === "complete") return timing.measuredTimeS ?? 0;
  if (timing.phase === "waiting" || timing.startAtS === null) return 0;
  const elapsed = state.simulation.timeS - timing.startAtS;
  if (timing.phase === "stopping" && timing.stopAtS !== null) {
    return Math.max(0, Math.min(state.simulation.timeS, timing.stopAtS) - timing.startAtS);
  }
  return Math.max(0, elapsed);
}

export function stopwatchDisplay(state: PendulumLabState): string {
  return formatStopwatch(stopwatchTimeS(state), state.data.stopwatch.resolutionS);
}

export function graphRows(state: PendulumLabState): PendulumRow[] {
  return state.rows
    .filter((row) => row.gravityId === state.params.gravityId)
    .slice()
    .sort((a, b) => a.lengthM - b.lengthM || a.sequence - b.sequence);
}

export function distinctLengthCount(rows: PendulumRow[], resolutionM = 0.001): number {
  return new Set(rows.map((row) => row.lengthM.toFixed(Math.max(0, Math.ceil(-Math.log10(resolutionM)))))).size;
}

function sameLength(first: PendulumRow, second: PendulumRow): boolean {
  return Math.abs(first.lengthM - second.lengthM) <= 0.005;
}

function sameAngle(first: PendulumRow, second: PendulumRow): boolean {
  return Math.abs(first.releaseAngleDeg - second.releaseAngleDeg) <= 1;
}

export function discoveryTasks(state: PendulumLabState): PendulumTaskProgress[] {
  const rows = state.rows;
  return state.data.tasks.map((task) => {
    if (task.id === "mass") {
      let evidence = "Record two runs with the same radius but different masses.";
      let done = false;
      for (let first = 0; first < rows.length && !done; first += 1) {
        for (let second = first + 1; second < rows.length && !done; second += 1) {
          const a = rows[first];
          const b = rows[second];
          const sameConfig = sameLength(a, b) && sameAngle(a, b) && a.gravityId === b.gravityId && a.dampingOn === b.dampingOn;
          const sameRadius = Math.abs(a.bobRadiusM - b.bobRadiusM) < 1e-9;
          const differentMass = Math.abs(a.bobMassKg - b.bobMassKg) > 0.01;
          if (sameConfig && sameRadius && differentMass) {
            const difference = Math.abs(a.periodS - b.periodS) / ((a.periodS + b.periodS) / 2);
            if (difference < 0.03) {
              done = true;
              evidence = `${a.bobMassKg.toFixed(2)} kg and ${b.bobMassKg.toFixed(2)} kg gave ${a.periodS.toFixed(3)} s and ${b.periodS.toFixed(3)} s.`;
            }
          }
        }
      }
      return { ...task, done, evidence };
    }

    if (task.id === "amplitude") {
      let evidence = "Compare a small angle with a much larger angle at the same length.";
      let done = false;
      for (let first = 0; first < rows.length && !done; first += 1) {
        for (let second = first + 1; second < rows.length && !done; second += 1) {
          const a = rows[first];
          const b = rows[second];
          const small = a.releaseAngleDeg <= b.releaseAngleDeg ? a : b;
          const large = a.releaseAngleDeg <= b.releaseAngleDeg ? b : a;
          const sameConfig = sameLength(a, b) && a.gravityId === b.gravityId && a.dampingOn === b.dampingOn && a.bobId === b.bobId;
          if (sameConfig && small.n >= 10 && large.n >= 10 && large.releaseAngleDeg - small.releaseAngleDeg >= 8 && large.periodS > small.periodS * 1.003) {
            done = true;
            evidence = `${small.releaseAngleDeg.toFixed(0)}° gave ${small.periodS.toFixed(3)} s; ${large.releaseAngleDeg.toFixed(0)}° gave ${large.periodS.toFixed(3)} s.`;
          }
        }
      }
      return { ...task, done, evidence };
    }

    if (task.id === "gravity") {
      let evidence = "Repeat the same pendulum at two gravity settings.";
      let done = false;
      for (let first = 0; first < rows.length && !done; first += 1) {
        for (let second = first + 1; second < rows.length && !done; second += 1) {
          const a = rows[first];
          const b = rows[second];
          const sameConfig = sameLength(a, b) && sameAngle(a, b) && a.dampingOn === b.dampingOn && a.n >= 10 && b.n >= 10;
          if (sameConfig && a.gravityId !== b.gravityId) {
            const difference = Math.abs(a.periodS - b.periodS) / ((a.periodS + b.periodS) / 2);
            if (difference > 0.05) {
              done = true;
              evidence = `${a.gravityId} gave ${a.periodS.toFixed(3)} s; ${b.gravityId} gave ${b.periodS.toFixed(3)} s.`;
            }
          }
        }
      }
      return { ...task, done, evidence };
    }

    const damped = rows.find((row) => row.dampingOn && row.finalAmplitudeDeg < row.initialAmplitudeDeg * 0.9);
    return {
      ...task,
      done: Boolean(damped),
      evidence: damped
        ? `Amplitude fell from ${damped.initialAmplitudeDeg.toFixed(1)}° to about ${damped.finalAmplitudeDeg.toFixed(1)}° while the period stayed close to ${damped.periodS.toFixed(3)} s.`
        : "Switch damping on and record a run long enough to see the amplitude fall.",
    };
  });
}

export function evaluatePendulum(state: PendulumLabState): PendulumEvaluation {
  const rows = graphRows(state);
  const distinct = distinctLengthCount(rows, state.data.length.resolutionM);
  const graphReady = rows.length >= state.data.analysis.minRows && distinct >= state.data.analysis.minDistinctLengths;
  const analysis = state.analysis;
  const tasks = discoveryTasks(state);
  const completedChecks: string[] = [];
  const mistakes: string[] = [];

  if (state.measuredLength) {
    completedChecks.push(state.measuredLength.method === "centre" ? "Length measured to the bob centre" : "Length recorded, but to the bob bottom");
  } else {
    mistakes.push("Measure the effective length from the pivot to the centre of the bob.");
  }
  if (state.measuredAngle) completedChecks.push("Release angle measured with the protractor");
  else mistakes.push("Measure the release angle before starting the timing run.");

  if (rows.length === 0) {
    mistakes.push("Record at least five timing runs to start the graph.");
  } else {
    if (rows.some((row) => row.n === 1)) mistakes.push("A single-swing timing has a large reaction-time error. Time 10 or 20 oscillations.");
    if (rows.some((row) => row.n >= 10)) completedChecks.push("Repeated oscillations used to reduce timing error");
    if (rows.some((row) => row.method === "bottom")) mistakes.push("At least one length was measured to the bottom of the bob, not its centre.");
    if (rows.some((row) => row.releaseAngleDeg > state.data.angle.largeAngleThresholdDeg)) {
      mistakes.push(`Some runs used an angle above ${state.data.angle.largeAngleThresholdDeg}°, where the small-angle approximation is less reliable.`);
    }
    if (distinct < state.data.analysis.minDistinctLengths) {
      mistakes.push(`Use ${state.data.analysis.minDistinctLengths} distinct lengths. You have ${distinct}.`);
    } else completedChecks.push(`${distinct} distinct lengths collected`);
    if (state.rows.length > rows.length && graphReady === false) {
      mistakes.push("Some runs were taken at a different gravity setting. Keep one gravity value for the g determination.");
    }
    if (graphReady && !analysis) mistakes.push("Plot T squared against L and calculate g from the best-fit gradient.");
  }

  let accuracy: PendulumEvaluation["accuracy"] = "not-ready";
  if (analysis) {
    completedChecks.push("T squared against L graph fitted");
    completedChecks.push(`g calculated from the gradient: ${analysis.gMeasuredMS2.toFixed(2)} m/s²`);
    accuracy = analysis.percentError <= 3 ? "excellent" : analysis.percentError <= state.data.analysis.targetErrorPercent ? "good" : "review";
    if (analysis.percentError > state.data.analysis.targetErrorPercent) {
      mistakes.push(`The experimental g differs from ${analysis.acceptedGMS2.toFixed(2)} m/s² by ${analysis.percentError.toFixed(1)}%. Check the lengths and timing.`);
    }
  }

  const taskDone = tasks.filter((task) => task.done).length;
  const ok = Boolean(analysis) && accuracy !== "review" && !rows.some((row) => row.method === "bottom" || row.n === 1);
  const revision =
    accuracy === "review"
      ? "Revise the pendulum equation, graph axes and how to read a gradient."
      : !graphReady
        ? "Revise how to choose and control variables in a pendulum experiment."
        : taskDone < tasks.length
          ? "Revise the difference between amplitude, mass and length in a pendulum experiment."
          : "Keep practising gradient calculations and percentage error.";

  return {
    graphRows: rows,
    rowCount: rows.length,
    distinctLengths: distinct,
    graphReady,
    analysis,
    tasks,
    completedChecks,
    mistakes: unique(mistakes),
    accuracy,
    keyIdea: "For small oscillations, T squared is directly proportional to the effective length L. The gradient of a T squared against L graph is 4 pi squared divided by g.",
    revision,
    ok,
  };
}

function withFeedback(state: PendulumLabState, message: string, kind: FeedbackKind): PendulumLabState {
  return { ...state, feedback: message, feedbackKind: kind };
}

function resetMotion(state: PendulumLabState, params = state.params, timingN = state.timing.n): PendulumLabState {
  return {
    ...state,
    params,
    simulation: createSimulation(state.data, params),
    timing: { ...createTiming(state.data, params), n: timingN },
    analysis: null,
  };
}

function updateParams(state: PendulumLabState, patch: Partial<PendulumParams>, message: string): PendulumLabState {
  const params = { ...state.params, ...patch };
  const measuredLength = patch.stringLengthM !== undefined || patch.bobId !== undefined ? null : state.measuredLength;
  const measuredAngle = patch.releaseAngleDeg !== undefined ? null : state.measuredAngle;
  return withFeedback(
    resetMotion({ ...state, measuredLength, measuredAngle }, params, state.timing.n),
    message,
    "info",
  );
}

function finishTiming(
  state: PendulumLabState,
  timing: PendulumTiming,
  simulation: PendulumSimulation,
): { timing: PendulumTiming; feedback: string } {
  if (timing.startAtS === null || timing.stopAtS === null || timing.n <= 0) {
    return { timing, feedback: state.feedback };
  }
  const measuredTimeS = roundTo(Math.max(0, timing.stopAtS - timing.startAtS), state.data.stopwatch.resolutionS);
  const periodS = measuredTimeS / timing.n;
  const completed: PendulumTiming = {
    ...timing,
    phase: "complete",
    measuredTimeS,
    periodS,
    finalAmplitudeDeg: simulation.lastPeakAmplitudeDeg,
  };
  return {
    timing: completed,
    feedback: `Stopwatch stopped at ${formatStopwatch(measuredTimeS, state.data.stopwatch.resolutionS)} s. Period = ${periodS.toFixed(3)} s.`,
  };
}

export function reducePendulum(state: PendulumLabState, action: PendulumAction): PendulumLabState {
  const { data } = state;
  switch (action.type) {
    case "setMode":
      return withFeedback(
        { ...state, mode: action.mode, seed: action.seed ?? state.seed },
        action.mode === "guided"
          ? "Guided practice: hints and immediate feedback are available."
          : "Independent assessment: hints are hidden. Your final mistake breakdown appears after you analyse the graph.",
        "info",
      );

    case "setStringLength": {
      const value = roundTo(clamp(action.value, data.length.minM, data.length.maxM), data.length.stepM);
      return updateParams(state, { stringLengthM: value }, `String length set to ${value.toFixed(2)} m. Measure the effective length again.`);
    }

    case "setReleaseAngle": {
      const value = roundTo(clamp(action.value, data.angle.minDeg, data.angle.maxDeg), data.angle.stepDeg);
      return updateParams(state, { releaseAngleDeg: value }, `Release angle set to ${value.toFixed(0)}°. Measure it with the protractor before timing.`);
    }

    case "setBob": {
      if (!data.bobs.some((bob) => bob.id === action.id)) return state;
      const bob = data.bobs.find((item) => item.id === action.id)!;
      return updateParams(state, { bobId: bob.id }, `${bob.name} fitted. The effective length has changed, so measure it again.`);
    }

    case "setGravity": {
      if (!data.gravityPresets.some((gravity) => gravity.id === action.id)) return state;
      const gravity = data.gravityPresets.find((item) => item.id === action.id)!;
      const reset = resetMotion({ ...state, analysis: null }, state.params, state.timing.n);
      return withFeedback(
        { ...reset, params: { ...state.params, gravityId: gravity.id } },
        `Gravity set to ${gravity.name} (${gravity.accelerationMS2.toFixed(2)} m/s²). Use one gravity setting for the g graph.`,
        "info",
      );
    }

    case "setDamping": {
      const reset = resetMotion({ ...state, analysis: null }, state.params, state.timing.n);
      return withFeedback(
        { ...reset, params: { ...state.params, dampingOn: action.enabled } },
        action.enabled ? "Damping on. The amplitude will decay while the period stays nearly constant." : "Damping off. The pendulum swings with negligible energy loss.",
        "info",
      );
    }

    case "setOscillations": {
      if (!data.timing.oscillationOptions.includes(action.n)) return state;
      return {
        ...state,
        timing: { ...createTiming(data, state.params), n: action.n },
        simulation: { ...state.simulation, running: false, accumulatorS: 0 },
        feedback: `Timer set to ${action.n} oscillation${action.n === 1 ? "" : "s"}.`,
        feedbackKind: "info",
      };
    }

    case "measureLength": {
      const measurement = measureLength(state.params.stringLengthM, currentBob(state).radiusM, action.method, data.length.resolutionM);
      const measuredLength: PendulumLengthReading = {
        ...measurement,
        measuredAt: action.at ?? null,
      };
      return withFeedback(
        { ...state, measuredLength },
        action.method === "centre"
          ? `Effective length recorded as ${measurement.measuredM.toFixed(3)} m from pivot to bob centre.`
          : `Length recorded as ${measurement.measuredM.toFixed(3)} m, but this is to the bottom of the bob. The effective length is ${measurement.trueEffectiveM.toFixed(3)} m.`,
        action.method === "centre" ? "success" : "error",
      );
    }

    case "measureReleaseAngle": {
      const valueDeg = measureAngle(state.params.releaseAngleDeg, data.angle.resolutionDeg);
      const measuredAngle: PendulumAngleReading = {
        valueDeg,
        resolutionDeg: data.angle.resolutionDeg,
        measuredAt: action.at ?? null,
      };
      return withFeedback(
        { ...state, measuredAngle },
        `Protractor reading recorded as ${valueDeg.toFixed(1)}° to the nearest ${data.angle.resolutionDeg}°.`,
        "success",
      );
    }

    case "release": {
      if (!state.measuredLength) return withFeedback(state, "Measure the effective length before releasing the bob.", "error");
      const simulation = createSimulation(data, state.params);
      return withFeedback(
        { ...state, simulation: { ...simulation, running: true }, timing: { ...createTiming(data, state.params), n: state.timing.n }, analysis: state.analysis },
        "Bob released. Start the stopwatch at a centre crossing.",
        "info",
      );
    }

    case "beginTiming": {
      if (!state.measuredLength) return withFeedback(state, "Measure the effective length before timing the oscillations.", "error");
      if (!state.measuredAngle) return withFeedback(state, "Measure the release angle with the protractor before timing.", "error");
      if (state.timing.phase === "waiting" || state.timing.phase === "timing" || state.timing.phase === "stopping") {
        return withFeedback(state, "A timing run is already in progress.", "info");
      }
      const sequence = state.rows.length;
      const delays = {
        reactionMinS: data.stopwatch.reactionMinS,
        reactionMaxS: data.stopwatch.reactionMaxS,
      };
      const timing: PendulumTiming = {
        ...createTiming(data, state.params),
        n: state.timing.n,
        phase: "waiting",
        sequence,
        startDelayS: reactionDelayS(state.seed, "start", sequence, delays),
        stopDelayS: reactionDelayS(state.seed, "stop", sequence, delays),
        initialAmplitudeDeg: state.params.releaseAngleDeg,
      };
      const simulation = state.simulation.running ? state.simulation : { ...createSimulation(data, state.params), running: true };
      return withFeedback(
        { ...state, simulation, timing },
        `Timer armed for ${timing.n} oscillation${timing.n === 1 ? "" : "s"}. The stopwatch starts at the next centre crossing.`,
        "info",
      );
    }

    case "advance": {
      if (!state.simulation.running || action.deltaS <= 0) return state;
      const dt = Math.max(1e-6, data.timing.timeStepS);
      const scaled = Math.min(Math.max(0, action.deltaS) * data.timing.speed, data.timing.maxCatchUpS);
      let accumulator = state.simulation.accumulatorS + scaled;
      let motion: PendulumMotion = {
        thetaRad: state.simulation.thetaRad,
        omegaRadS: state.simulation.omegaRadS,
        timeS: state.simulation.timeS,
      };
      let simulation: PendulumSimulation = { ...state.simulation, accumulatorS: 0 };
      let timing: PendulumTiming = { ...state.timing };
      let running = true;
      let feedback = state.feedback;
      let feedbackKind = state.feedbackKind;
      let steps = 0;
      let lastTraceS = simulation.lastTraceS;
      let lastPeakAmplitudeDeg = simulation.lastPeakAmplitudeDeg;
      let lastPeakAtS = simulation.lastPeakAtS;
      let crossings = simulation.crossings;
      let trace = simulation.trace;
      const physics = currentPhysics(state);

      while (accumulator >= dt - 1e-12 && steps < 120 && running) {
        const previous = motion;
        motion = stepPendulum(previous, physics, dt);
        accumulator -= dt;
        steps += 1;

        if (previous.omegaRadS > 0 && motion.omegaRadS <= 0 && motion.thetaRad > 0) {
          lastPeakAmplitudeDeg = Math.abs((motion.thetaRad * 180) / Math.PI);
          lastPeakAtS = motion.timeS;
        }

        const crossing: PendulumCrossing | null = pendulumCrossing(previous, motion);
        if (crossing?.direction === "positive-to-negative") {
          crossings += 1;
          if (timing.phase === "waiting") {
            const startAtS = crossing.timeS + timing.startDelayS;
            timing = {
              ...timing,
              phase: "timing",
              startCrossingS: crossing.timeS,
              startAtS,
              cycles: 0,
            };
          } else if (timing.phase === "timing") {
            const cycles = timing.cycles + 1;
            if (cycles >= timing.n) {
              timing = {
                ...timing,
                phase: "stopping",
                cycles,
                stopCrossingS: crossing.timeS,
                stopAtS: crossing.timeS + timing.stopDelayS,
              };
            } else {
              timing = { ...timing, cycles };
            }
          }
        }

        if (timing.phase === "stopping" && timing.stopAtS !== null && motion.timeS >= timing.stopAtS - 1e-12) {
          const finished = finishTiming(state, timing, { ...simulation, lastPeakAmplitudeDeg, lastPeakAtS });
          timing = finished.timing;
          feedback = finished.feedback;
          feedbackKind = "success";
          running = false;
        }

        if (motion.timeS + 1e-9 >= lastTraceS + 0.05 || crossing || motion.timeS >= data.timing.maxSwingS - 1e-9) {
          trace = [...trace, { timeS: motion.timeS, thetaDeg: (motion.thetaRad * 180) / Math.PI }].slice(-520);
          lastTraceS = motion.timeS;
        }
      }

      simulation = {
        ...simulation,
        thetaRad: motion.thetaRad,
        omegaRadS: motion.omegaRadS,
        timeS: motion.timeS,
        running,
        accumulatorS: accumulator,
        trace,
        lastTraceS,
        crossings,
        lastPeakAmplitudeDeg,
        lastPeakAtS,
      };

      if (running && timing.phase === "idle" && motion.timeS >= Math.min(30, data.timing.maxSwingS)) {
        running = false;
        simulation.running = false;
      }

      if (running && motion.timeS >= data.timing.maxSwingS) {
        running = false;
        simulation.running = false;
        timing = { ...createTiming(data, state.params), n: state.timing.n };
        feedback = "The timing run exceeded the maximum swing time. Try a shorter run or record your evidence.";
        feedbackKind = "error";
      }

      if (timing.phase === "waiting" && !simulation.running) {
        timing = { ...createTiming(data, state.params), n: state.timing.n };
      }

      return { ...state, simulation, timing, feedback, feedbackKind };
    }

    case "recordRow": {
      const timing = state.timing;
      if (timing.phase !== "complete" || timing.periodS === null || timing.measuredTimeS === null) {
        return withFeedback(state, "Complete a timing run before recording a row in the notebook.", "error");
      }
      if (!state.measuredLength || !state.measuredAngle) {
        return withFeedback(state, "Measure both the effective length and release angle before recording the row.", "error");
      }
      const bob = currentBob(state);
      const gravity = currentGravity(state);
      const row: PendulumRow = {
        id: `pendulum-${state.rows.length + 1}`,
        sequence: state.rows.length + 1,
        recordedAt: action.at ?? "",
        lengthM: state.measuredLength.measuredM,
        method: state.measuredLength.method,
        trueEffectiveM: state.measuredLength.trueEffectiveM,
        stringLengthM: state.params.stringLengthM,
        bobId: bob.id,
        bobMassKg: bob.massKg,
        bobRadiusM: bob.radiusM,
        gravityId: gravity.id,
        gravityMS2: gravity.accelerationMS2,
        releaseAngleDeg: state.params.releaseAngleDeg,
        measuredAngleDeg: state.measuredAngle.valueDeg,
        dampingOn: state.params.dampingOn,
        n: timing.n,
        totalTimeS: timing.measuredTimeS,
        periodS: timing.periodS,
        periodSquaredS2: periodSquared(timing.periodS),
        initialAmplitudeDeg: timing.initialAmplitudeDeg,
        finalAmplitudeDeg: timing.finalAmplitudeDeg ?? timing.initialAmplitudeDeg,
      };
      const newMistakes = unique([
        ...state.mistakes,
        ...(timing.n === 1 ? ["Single-swing timing has a large reaction-time error."] : []),
        ...(state.measuredLength.method === "bottom" ? ["Length was measured to the bottom of the bob."] : []),
        ...(state.params.releaseAngleDeg > data.angle.largeAngleThresholdDeg ? ["Release angle was above the small-angle range."] : []),
      ]);
      return withFeedback(
        {
          ...state,
          rows: [...state.rows, row],
          mistakes: newMistakes,
          analysis: null,
          simulation: { ...state.simulation, running: false },
          timing: { ...createTiming(data, state.params), n: timing.n },
        },
        `Row ${row.sequence} recorded: L = ${row.lengthM.toFixed(3)} m, ${row.n} oscillations in ${row.totalTimeS.toFixed(2)} s, T = ${row.periodS.toFixed(3)} s.`,
        "success",
      );
    }

    case "analyse": {
      const rows = graphRows(state);
      const distinct = distinctLengthCount(rows, data.length.resolutionM);
      if (rows.length < data.analysis.minRows || distinct < data.analysis.minDistinctLengths) {
        return withFeedback(
          state,
          `Collect at least ${data.analysis.minRows} rows over ${data.analysis.minDistinctLengths} distinct lengths at the same gravity before fitting the graph.`,
          "error",
        );
      }
      const fit = lineOfBestFit(rows.map((row) => ({ x: row.lengthM, y: row.periodSquaredS2 })));
      if (!(fit.slope > 0)) {
        return withFeedback(state, "The graph gradient is not positive. Check the recorded lengths and periods.", "error");
      }
      const gravity = currentGravity(state);
      const gMeasuredMS2 = gravityFromPeriodSquaredFit(fit.slope);
      const percentError = Math.abs(gMeasuredMS2 - gravity.accelerationMS2) / gravity.accelerationMS2 * 100;
      const analysis: PendulumAnalysis = {
        fit,
        gMeasuredMS2,
        acceptedGMS2: gravity.accelerationMS2,
        percentError,
        rowCount: rows.length,
        gravityId: gravity.id,
        analysedAt: action.at ?? "",
      };
      return withFeedback(
        { ...state, analysis },
        `Graph fitted: gradient ${fit.slope.toFixed(3)} s²/m, g = ${gMeasuredMS2.toFixed(2)} m/s² (${percentError.toFixed(1)}% from ${gravity.accelerationMS2.toFixed(2)} m/s²).`,
        "success",
      );
    }

    case "clearRows":
      return withFeedback(
        { ...state, rows: [], analysis: null, mistakes: [], timing: { ...createTiming(data, state.params), n: state.timing.n } },
        "Timing table cleared. The apparatus settings and measured length are unchanged.",
        "info",
      );

    case "resetExperiment": {
      const fresh = createPendulumState(data, state.seed);
      return withFeedback(
        { ...fresh, mode: state.mode },
        "Pendulum experiment reset. All recorded rows and graph analysis were cleared.",
        "info",
      );
    }

    case "setFeedback":
      return withFeedback(state, action.message, action.kind ?? "info");

    default:
      return state;
  }
}

export function createPendulumStore(data: PendulumData, seed = 1): StoreApi<PendulumStore> {
  const initial = createPendulumState(data, seed);
  return createStore<PendulumStore>()(
    persist(
      (set, get) => ({
        ...initial,
        dispatch: (action: PendulumAction) => {
          const next = reducePendulum(get(), action);
          set({ ...next, dispatch: get().dispatch });
        },
      }),
      {
        name: "expera-physics-pendulum-v1",
        storage: createJSONStorage(() => localStorage),
        partialize: (state): PersistedPendulum => ({
          mode: state.mode,
          seed: state.seed,
          params: state.params,
          measuredLength: state.measuredLength,
          measuredAngle: state.measuredAngle,
          rows: state.rows,
          analysis: state.analysis,
          mistakes: state.mistakes,
          feedback: state.feedback,
          feedbackKind: state.feedbackKind,
        }),
        merge: (persisted, current) => {
          const saved = persisted as Partial<PersistedPendulum> | undefined;
          if (!saved) return current;
          const params = { ...current.params, ...(saved.params ?? {}) };
          return {
            ...current,
            ...saved,
            params,
            data: current.data,
            simulation: createSimulation(current.data, params),
            timing: createTiming(current.data, params),
            dispatch: current.dispatch,
          };
        },
      },
    ),
  );
}
