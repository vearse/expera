// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { loadPendulum } from "@/lib/content/pendulum";
import {
  createPendulumState,
  createPendulumStore,
  currentEffectiveLengthM,
  discoveryTasks,
  evaluatePendulum,
  graphRows,
  reducePendulum,
  stopwatchDisplay,
  type PendulumAction,
  type PendulumLabState,
} from "./pendulumStore";

const data = loadPendulum();

function apply(state: PendulumLabState, ...actions: PendulumAction[]) {
  return actions.reduce((current, action) => reducePendulum(current, action), state);
}

function finishSwing(state: PendulumLabState, limit = 900): PendulumLabState {
  let next = state;
  for (let index = 0; index < limit; index += 1) {
    if (next.timing.phase === "complete") return next;
    next = reducePendulum(next, { type: "advance", deltaS: 0.1 });
    if (!next.simulation.running) return next;
  }
  throw new Error("Timing run did not finish");
}

function runAndRecord(
  state: PendulumLabState,
  settings: {
    stringLengthM: number;
    angleDeg: number;
    bobId?: string;
    gravityId?: string;
    dampingOn?: boolean;
    n?: number;
  },
): PendulumLabState {
  let next = apply(
    state,
    { type: "setStringLength", value: settings.stringLengthM },
    { type: "setReleaseAngle", value: settings.angleDeg },
    { type: "setBob", id: settings.bobId ?? data.defaultBobId },
    { type: "setGravity", id: settings.gravityId ?? data.defaultGravityId },
    { type: "setDamping", enabled: settings.dampingOn ?? false },
    { type: "measureLength", method: "centre", at: "2026-01-01T00:00:00.000Z" },
    { type: "measureReleaseAngle", at: "2026-01-01T00:00:00.000Z" },
    { type: "setOscillations", n: settings.n ?? 10 },
    { type: "beginTiming" },
  );
  next = finishSwing(next);
  return reducePendulum(next, { type: "recordRow", at: "2026-01-01T00:01:00.000Z" });
}

describe("Pendulum store", () => {
  it("starts with no student evidence", () => {
    const state = createPendulumState(data, 1);
    expect(state.rows).toEqual([]);
    expect(state.analysis).toBeNull();
    expect(state.measuredLength).toBeNull();
    expect(state.measuredAngle).toBeNull();
    expect(state.timing.phase).toBe("idle");
    expect(state.feedbackKind).toBe("info");
  });

  it("measures effective length to the centre and exposes the bottom-of-bob error", () => {
    let state = apply(createPendulumState(data, 1), { type: "measureLength", method: "centre" });
    expect(state.measuredLength?.measuredM).toBeCloseTo(1, 3);
    expect(state.measuredLength?.systematicErrorM).toBeCloseTo(0, 12);
    expect(state.feedbackKind).toBe("success");

    state = apply(state, { type: "setStringLength", value: 0.7 }, { type: "measureLength", method: "bottom" });
    expect(state.measuredLength?.measuredM).toBeCloseTo(0.74, 3);
    expect(state.measuredLength?.systematicErrorM).toBeCloseTo(0.02, 12);
    expect(state.feedbackKind).toBe("error");
    expect(state.params.stringLengthM).toBeCloseTo(0.7, 8);
    expect(currentEffectiveLengthM(state)).toBeCloseTo(0.72, 8);
  });

  it("requires a measured length and angle before timing", () => {
    let state = apply(createPendulumState(data, 1), { type: "beginTiming" });
    expect(state.feedbackKind).toBe("error");
    expect(state.timing.phase).toBe("idle");

    state = apply(state, { type: "measureLength", method: "centre" }, { type: "beginTiming" });
    expect(state.feedbackKind).toBe("error");
    expect(state.timing.phase).toBe("idle");

    state = apply(state, { type: "measureReleaseAngle" }, { type: "beginTiming" });
    expect(state.timing.phase).toBe("waiting");
    expect(state.simulation.running).toBe(true);
  });

  it("runs the stopwatch on simulated crossings and records a real period", () => {
    let state = apply(
      createPendulumState(data, 1),
      { type: "measureLength", method: "centre" },
      { type: "measureReleaseAngle" },
      { type: "setOscillations", n: 10 },
      { type: "beginTiming" },
    );
    state = finishSwing(state);
    expect(state.timing.phase).toBe("complete");
    expect(state.simulation.running).toBe(false);
    expect(state.timing.periodS).toBeGreaterThan(1.99);
    expect(state.timing.periodS).toBeLessThan(2.04);
    expect(stopwatchDisplay(state)).toMatch(/^\d+\.\d{2}$/);

    state = apply(state, { type: "recordRow", at: "2026-01-01T00:00:00.000Z" });
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0].lengthM).toBeCloseTo(1, 3);
    expect(state.rows[0].n).toBe(10);
    expect(state.rows[0].periodS).toBeGreaterThan(1.99);
    expect(state.rows[0].periodS).toBeLessThan(2.04);
    expect(state.rows[0].periodSquaredS2).toBeCloseTo(state.rows[0].periodS ** 2, 8);
    expect(state.timing.phase).toBe("idle");
  });

  it("shows the one-swing timing error is larger than a 20-swing timing", () => {
    let single = runAndRecord(createPendulumState(data, 3), { stringLengthM: 0.98, angleDeg: 5, n: 1 });
    const singlePeriod = single.rows[0].periodS;
    single = apply(single, { type: "clearRows" });
    single = runAndRecord(single, { stringLengthM: 0.98, angleDeg: 5, n: 20 });
    const repeatedPeriod = single.rows[0].periodS;
    expect(Math.abs(repeatedPeriod - 2.007)).toBeLessThan(Math.abs(singlePeriod - 2.007));
    expect(single.mistakes).not.toContain("Single-swing timing has a large reaction-time error.");
  });

  it("collects five lengths and recovers g from the T squared against L graph", () => {
    let state = createPendulumState(data, 4);
    for (const stringLengthM of [0.38, 0.63, 0.88, 1.13, 1.38]) {
      state = runAndRecord(state, { stringLengthM, angleDeg: 5 });
    }
    expect(state.rows).toHaveLength(5);
    expect(new Set(state.rows.map((row) => row.lengthM)).size).toBe(5);
    expect(graphRows(state)).toHaveLength(5);

    const before = evaluatePendulum(state);
    expect(before.graphReady).toBe(true);
    expect(before.analysis).toBeNull();
    expect(before.mistakes.join(" ")).toMatch(/Plot T squared/);

    state = apply(state, { type: "analyse", at: "2026-01-01T00:02:00.000Z" });
    const evaluation = evaluatePendulum(state);
    expect(state.analysis).not.toBeNull();
    expect(evaluation.analysis?.fit.r2).toBeGreaterThan(0.999);
    expect(Math.abs((evaluation.analysis?.gMeasuredMS2 ?? 0) - 9.81)).toBeLessThan(0.35);
    expect(evaluation.analysis?.percentError).toBeLessThan(4);
    expect(evaluation.accuracy).toBe("excellent");
    expect(evaluation.completedChecks.length).toBeGreaterThan(5);
    expect(evaluation.ok).toBe(true);
  });

  it("estimates g for all gravity presets from their own graphs", () => {
    for (const gravity of data.gravityPresets) {
      let state = createPendulumState(data, 5);
      const lengths = gravity.id === "moon" ? [0.28, 0.58, 0.88, 1.18, 1.48] : [0.38, 0.63, 0.88, 1.13, 1.38];
      for (const stringLengthM of lengths) {
        state = runAndRecord(state, { stringLengthM, angleDeg: 4, gravityId: gravity.id, n: 10 });
      }
      state = apply(state, { type: "analyse" });
      expect(Math.abs((state.analysis?.gMeasuredMS2 ?? 0) - gravity.accelerationMS2)).toBeLessThan(gravity.accelerationMS2 * 0.03);
    }
  });

  it("completes the mass discovery with equal-radius bobs of different mass", () => {
    let state = runAndRecord(createPendulumState(data, 6), { stringLengthM: 0.98, angleDeg: 5, bobId: "steel-50", n: 10 });
    state = runAndRecord(state, { stringLengthM: 0.98, angleDeg: 5, bobId: "brass-100", n: 10 });
    const mass = discoveryTasks(state).find((task) => task.id === "mass");
    expect(mass?.done).toBe(true);
    expect(mass?.evidence).toMatch(/kg/);
  });

  it("completes the amplitude, gravity and damping discoveries", () => {
    let state = runAndRecord(createPendulumState(data, 7), { stringLengthM: 0.98, angleDeg: 5, n: 10 });
    state = runAndRecord(state, { stringLengthM: 0.98, angleDeg: 20, n: 10 });
    expect(discoveryTasks(state).find((task) => task.id === "amplitude")?.done).toBe(true);

    state = runAndRecord(state, { stringLengthM: 0.98, angleDeg: 5, gravityId: "moon", n: 10 });
    expect(discoveryTasks(state).find((task) => task.id === "gravity")?.done).toBe(true);

    state = runAndRecord(state, { stringLengthM: 0.98, angleDeg: 18, dampingOn: true, n: 10 });
    expect(discoveryTasks(state).find((task) => task.id === "damping")?.done).toBe(true);
  });

  it("keeps independent mode free of procedural hints and retains a final breakdown", () => {
    let state = apply(createPendulumState(data, 8), { type: "setMode", mode: "independent" });
    expect(state.mode).toBe("independent");
    state = runAndRecord(state, { stringLengthM: 0.98, angleDeg: 25, n: 1 });
    const evaluation = evaluatePendulum(state);
    expect(evaluation.mistakes.join(" ")).toMatch(/single-swing/i);
    expect(evaluation.mistakes.join(" ")).toMatch(/small-angle|angle above/i);
    expect(state.feedback).toMatch(/Row 1 recorded/);
  });

  it("invalidates the measurement and analysis when the apparatus changes", () => {
    let state = runAndRecord(createPendulumState(data, 9), { stringLengthM: 0.98, angleDeg: 5 });
    state = apply(state, { type: "setStringLength", value: 1.1 });
    expect(state.measuredLength).toBeNull();
    expect(state.measuredAngle).not.toBeNull();
    state = apply(state, { type: "measureLength", method: "centre" }, { type: "setReleaseAngle", value: 12 });
    expect(state.measuredAngle).toBeNull();
    state = apply(state, { type: "measureReleaseAngle" }, { type: "setBob", id: "steel-100" });
    expect(state.measuredLength).toBeNull();
  });

  it("resets all evidence but keeps the selected mode", () => {
    let state = runAndRecord(createPendulumState(data, 10), { stringLengthM: 0.98, angleDeg: 5 });
    state = apply(state, { type: "setMode", mode: "independent" }, { type: "resetExperiment" });
    expect(state.rows).toEqual([]);
    expect(state.analysis).toBeNull();
    expect(state.measuredLength).toBeNull();
    expect(state.mode).toBe("independent");
    expect(state.params.stringLengthM).toBeCloseTo(data.length.defaultM, 8);
  });
});

describe("Pendulum persistence", () => {
  beforeEach(() => localStorage.clear());

  it("restores recorded rows, measurements and mode after reload", () => {
    const store = createPendulumStore(data, 12);
    store.getState().dispatch({ type: "setMode", mode: "independent" });
    store.getState().dispatch({ type: "measureLength", method: "centre", at: "2026-01-01T00:00:00.000Z" });
    store.getState().dispatch({ type: "measureReleaseAngle", at: "2026-01-01T00:00:00.000Z" });
    store.getState().dispatch({ type: "beginTiming" });
    for (let index = 0; index < 900 && store.getState().timing.phase !== "complete"; index += 1) {
      store.getState().dispatch({ type: "advance", deltaS: 0.1 });
    }
    store.getState().dispatch({ type: "recordRow", at: "2026-01-01T00:01:00.000Z" });

    const reloaded = createPendulumStore(data, 12);
    expect(reloaded.getState().mode).toBe("independent");
    expect(reloaded.getState().rows).toHaveLength(1);
    expect(reloaded.getState().measuredLength?.measuredM).toBeCloseTo(1, 3);
    expect(reloaded.getState().params.bobId).toBe(data.defaultBobId);
    expect(reloaded.getState().data.bobs).toHaveLength(data.bobs.length);
    expect(reloaded.getState().simulation.running).toBe(false);
  });
});
