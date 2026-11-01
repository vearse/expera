// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { loadBiology } from "@/lib/content/biology";
import {
  createBiologyMicroscopyStore,
  createBiologyState,
  currentObservation,
  currentRecord,
  currentSlide,
  currentVariant,
  reduceBiology,
  type BiologyAction,
  type BiologyLabState,
} from "./biologyMicroscopyStore";

const data = loadBiology();
const onion = data.specimens.specimens.find((s) => s.id === "onion-epidermis")!;
const pond = data.specimens.specimens.find((s) => s.id === "pond-water")!;

function apply(state: BiologyLabState, ...actions: BiologyAction[]) {
  return actions.reduce((current, action) => reduceBiology(current, action).state, state);
}

function preparedOnion(seed = 3): BiologyLabState {
  let state = createBiologyState(data, seed);
  state = apply(state, { type: "selectMicroscope", modelId: "led-compound" }, { type: "selectSpecimen", id: onion.id });
  for (const step of onion.steps) state = apply(state, { type: "prepareStep", action: step.action });
  state = apply(state, { type: "placeSlide" }, { type: "secureSlide", secured: true });
  for (let i = 0; i < 30; i += 1) state = apply(state, { type: "focus", knob: "fine", direction: -1 });
  return state;
}

function addRequiredLabels(state: BiologyLabState) {
  const variant = currentVariant(state)!;
  let next = state;
  for (const structure of variant.structures.filter((s) => s.expectedInDrawing)) {
    next = apply(next, {
      type: "addLabel",
      label: {
        id: `label-${structure.id}`,
        text: structure.name,
        target: structure.point,
        label: [Math.min(0.9, structure.point[0] + 0.18), Math.max(0.08, structure.point[1] - 0.18)],
      },
    });
  }
  return next;
}

describe("microscopy slide preparation", () => {
  it("rejects a coverslip before the sample is mounted", () => {
    const state = apply(createBiologyState(data, 3), { type: "selectSpecimen", id: onion.id }, { type: "prepareStep", action: "coverslip" });
    expect(currentSlide(state)!.completedStepIds).toHaveLength(0);
    expect(currentSlide(state)!.wrongActions).toContain("coverslip");
    expect(state.feedbackKind).toBe("error");
  });

  it("completes the onion procedure in the verified order", () => {
    let state = apply(createBiologyState(data, 3), { type: "selectSpecimen", id: onion.id });
    for (const step of onion.steps) state = apply(state, { type: "prepareStep", action: step.action });
    const slide = currentSlide(state)!;
    expect(slide.ready).toBe(true);
    expect(slide.stainApplied).toBe(true);
    expect(slide.completedStepIds).toEqual(onion.steps.map((step) => step.id));
  });

  it("does not allow an unprepared slide on the stage", () => {
    const state = apply(createBiologyState(data, 3), { type: "selectSpecimen", id: onion.id }, { type: "placeSlide" });
    expect(currentSlide(state)!.onStage).toBe(false);
    expect(state.feedbackKind).toBe("error");
  });
});

describe("microscopy observation", () => {
  it("requires securing and focusing before an observation can be recorded", () => {
    let state = preparedOnion();
    state = apply(state, { type: "recordObservation" });
    expect(currentObservation(state)!.status).toBe("observable");
    expect(currentRecord(state)!.structures.length).toBeGreaterThan(0);
  });

  it("changes the observed structures with magnification", () => {
    let state = preparedOnion();
    state = apply(state, { type: "setObjective", id: "4x" }, { type: "focus", knob: "coarse", direction: 1 });
    const low = currentObservation(state)!;
    state = apply(state, { type: "setObjective", id: "40x" });
    for (let i = 0; i < 10; i += 1) state = apply(state, { type: "focus", knob: "fine", direction: -1 });
    const high = currentObservation(state)!;
    expect(high.totalMagnification).toBeGreaterThan(low.totalMagnification);
    expect(high.fieldOfViewMicrometres).toBeLessThan(low.fieldOfViewMicrometres);
  });

  it("selects different pond-water variants deterministically", () => {
    let state = createBiologyState(data, 9);
    state = apply(state, { type: "selectSpecimen", id: pond.id });
    const first = currentVariant(state)!.id;
    state = apply(state, { type: "newSample", seed: 10 }, { type: "selectSpecimen", id: pond.id });
    const second = currentVariant(state)!.id;
    expect(createBiologyState(data, 9).slides[pond.id].variantId).toBe(first);
    expect(second).not.toBe(first);
  });
});

describe("notebook completion", () => {
  it("saves a completed observation with drawing, labels and magnification", () => {
    let state = preparedOnion();
    state = apply(state, { type: "recordObservation" });
    state = apply(state, {
      type: "addStroke",
      stroke: { id: "stroke-1", colour: "#0f172a", width: 2, points: [[0.4, 0.4], [0.55, 0.45], [0.65, 0.6]] },
    });
    state = addRequiredLabels(state);
    state = apply(state, { type: "saveObservation" });
    const record = currentRecord(state)!;
    expect(record.savedAt).not.toBeNull();
    expect(record.completed).toBe(true);
    expect(state.completedExperiments).toContain("microscope-operation");
    expect(record.totalMagnification).toBe(100);
  });

  it("calculates actual size from the simulated magnification", () => {
    let state = preparedOnion();
    state = apply(state, { type: "recordObservation" }, { type: "setMeasurement", imageSizeMm: 40 }, { type: "submitMeasurement" });
    const record = currentRecord(state)!;
    expect(record.totalMagnification).toBe(100);
    expect(record.actualSizeMicrometres).toBeCloseTo(400, 6);
  });
});

describe("progress persistence", () => {
  beforeEach(() => localStorage.clear());

  it("restores the microscopy session after reload", () => {
    const store = createBiologyMicroscopyStore(data, 5);
    store.getState().dispatch({ type: "selectMicroscope", modelId: "led-compound" });
    store.getState().dispatch({ type: "selectSpecimen", id: onion.id });
    for (const step of onion.steps) store.getState().dispatch({ type: "prepareStep", action: step.action });
    store.getState().dispatch({ type: "placeSlide" });
    store.getState().dispatch({ type: "secureSlide", secured: true });
    for (let i = 0; i < 30; i += 1) store.getState().dispatch({ type: "focus", knob: "fine", direction: -1 });
    store.getState().dispatch({ type: "recordObservation" });

    const reloaded = createBiologyMicroscopyStore(data, 5);
    expect(reloaded.getState().microscopeSelected).toBe(true);
    expect(reloaded.getState().activeSpecimenId).toBe(onion.id);
    expect(reloaded.getState().slides[onion.id].onStage).toBe(true);
    expect(reloaded.getState().records[onion.id].structures.length).toBeGreaterThan(0);
  });
});
