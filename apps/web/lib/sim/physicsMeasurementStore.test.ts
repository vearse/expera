// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { loadPhysics, type PhysicsStationId } from "@/lib/content/physics";
import {
  createPhysicsMeasurementStore,
  createPhysicsState,
  currentLiquidDensity,
  currentMicrometer,
  currentRule,
  currentSolidDensity,
  currentStopwatch,
  currentVernier,
  evaluateStation,
  reducePhysics,
  type PhysicsAction,
  type PhysicsLabState,
} from "./physicsMeasurementStore";

const data = loadPhysics();

function apply(state: PhysicsLabState, ...actions: PhysicsAction[]) {
  return actions.reduce((current, action) => reducePhysics(current, action), state);
}

function recordAndSave(state: PhysicsLabState, stationId: PhysicsStationId, observation = "A careful reading was taken from the instrument scale.") {
  let next = apply(state, { type: "selectStation", id: stationId }, { type: "recordReading", at: "2026-01-01T00:00:00.000Z" });
  next = apply(next, { type: "setObservationText", text: observation }, { type: "saveEntry", at: "2026-01-01T00:01:00.000Z" });
  return next;
}

describe("Physics measurement store", () => {
  it("only records readings after a student action", () => {
    const state = createPhysicsState(data, 1);
    expect(state.entries).toEqual({});
    expect(state.completedStations).toEqual([]);
  });

  it("reads and completes the Vernier station", () => {
    let state = apply(createPhysicsState(data, 1), { type: "selectStation", id: "vernier" }, { type: "closeVernierSample" });
    expect(currentVernier(state).displayCm).toBeCloseTo(2.34, 8);
    state = recordAndSave(state, "vernier");
    expect(state.entries.vernier?.readings.every((row) => row.source === "student")).toBe(true);
    expect(state.entries.vernier?.completed).toBe(true);
    expect(state.completedStations).toContain("vernier");
    expect(state.feedback).toMatch(/Station complete/);
  });

  it("requires a student observation before saving", () => {
    let state = apply(createPhysicsState(data, 1), { type: "closeVernierSample" }, { type: "recordReading" });
    state = apply(state, { type: "saveEntry" });
    expect(state.entries.vernier?.savedAt).toBeNull();
    expect(state.feedbackKind).toBe("error");
  });

  it("corrects the micrometer zero error", () => {
    let state = apply(createPhysicsState(data, 1), { type: "selectStation", id: "micrometer" }, { type: "closeMicrometerSample" });
    const reading = currentMicrometer(state);
    expect(reading.observedMm).toBeCloseTo(5.78, 8);
    expect(reading.correctedMm).toBeCloseTo(5.76, 8);
    state = recordAndSave(state, "micrometer");
    expect(state.entries.micrometer?.completed).toBe(true);
  });

  it("measures the metre rule between two marks", () => {
    let state = apply(createPhysicsState(data, 1), { type: "selectStation", id: "metre-rule" }, { type: "placeRuleSample" });
    expect(currentRule(state).lengthCm).toBeCloseTo(12.3, 8);
    expect(currentRule(state).startCm).toBeCloseTo(2, 8);
    state = recordAndSave(state, "metre-rule");
    expect(state.entries["metre-rule"]?.completed).toBe(true);
  });

  it("runs the stopwatch from explicit deterministic ticks", () => {
    let state = apply(createPhysicsState(data, 1), { type: "selectStation", id: "stopwatch" }, { type: "startStopwatch" });
    for (let i = 0; i < 42; i += 1) state = apply(state, { type: "tickStopwatch", deltaMs: 100 });
    state = apply(state, { type: "stopStopwatch" });
    expect(currentStopwatch(state).display).toBe("4.20");
    state = recordAndSave(state, "stopwatch");
    expect(state.entries.stopwatch?.completed).toBe(true);
  });

  it("aligns the eye for the parallax station", () => {
    let state = apply(createPhysicsState(data, 1), { type: "selectStation", id: "parallax" }, { type: "alignEye" });
    expect(state.parallax.eyeOffsetMm).toBe(0);
    state = recordAndSave(state, "parallax");
    expect(state.entries.parallax?.completed).toBe(true);
  });

  it("calculates the density of the solid and liquid", () => {
    let state = apply(
      createPhysicsState(data, 1),
      { type: "selectStation", id: "density" },
      { type: "measureSolidDiameter" },
      { type: "measureSolidHeight" },
      { type: "measureSolidMass" },
      { type: "measureEmptyCylinder" },
      { type: "measureFilledCylinder" },
    );
    expect(currentSolidDensity(state).densityGCm3).toBeCloseTo(2.7, 2);
    expect(currentLiquidDensity(state).densityGCm3).toBeCloseTo(1.26, 8);
    state = recordAndSave(state, "density");
    expect(state.entries.density?.completed).toBe(true);
  });

  it("keeps independent mistakes for the end-of-lab breakdown", () => {
    let state = apply(
      createPhysicsState(data, 2),
      { type: "setMode", mode: "independent" },
      { type: "selectStation", id: "vernier" },
      { type: "recordReading", at: "2026-01-01T00:00:00.000Z" },
      { type: "setObservationText", text: "I closed the jaws but did not check the rod." },
      { type: "saveEntry", at: "2026-01-01T00:01:00.000Z" },
    );
    const evaluation = evaluateStation(state, "vernier");
    expect(evaluation.ok).toBe(false);
    expect(state.entries.vernier?.savedAt).not.toBeNull();
    expect(state.entries.vernier?.completed).toBe(false);
    expect(state.mistakes.length).toBeGreaterThan(0);
    expect(state.feedback).toMatch(/independent mistake breakdown/i);
  });

  it("resets apparatus without discarding notebook entries", () => {
    let state = recordAndSave(createPhysicsState(data, 1), "vernier");
    const before = state.entries.vernier;
    state = apply(state, { type: "resetStation" });
    expect(state.entries.vernier).toEqual(before);
    expect(state.vernier.jawGapMm).not.toBeCloseTo(23.4, 8);
  });
});

describe("Physics persistence", () => {
  beforeEach(() => localStorage.clear());

  it("restores the measurement session after reload", () => {
    const store = createPhysicsMeasurementStore(data, 7);
    store.getState().dispatch({ type: "closeVernierSample" });
    store.getState().dispatch({ type: "recordReading", at: "2026-01-01T00:00:00.000Z" });
    store.getState().dispatch({ type: "setObservationText", text: "The Vernier scale coincided at the fourth division." });
    store.getState().dispatch({ type: "saveEntry", at: "2026-01-01T00:01:00.000Z" });

    const reloaded = createPhysicsMeasurementStore(data, 7);
    expect(reloaded.getState().vernier.jawGapMm).toBeCloseTo(23.4, 8);
    expect(reloaded.getState().entries.vernier?.completed).toBe(true);
    expect(reloaded.getState().completedStations).toContain("vernier");
    expect(reloaded.getState().data.instruments.micrometer.name).toBe(data.instruments.micrometer.name);
  });
});
