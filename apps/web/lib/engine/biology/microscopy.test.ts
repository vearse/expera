import { describe, expect, it } from "vitest";
import { loadBiology } from "@/lib/content/biology";
import {
  actualSizeMicrometres,
  assessDrawing,
  computeObservation,
  convertFromMicrometres,
  createEmptySlide,
  fieldOfViewMicrometres,
  findEyepiece,
  findObjective,
  focusQuality,
  illuminationQuality,
  selectVariant,
  totalMagnification,
} from "./microscopy";

const data = loadBiology();
const model = data.microscopy.models[0];
const eyepiece = findEyepiece(model, "wf10x");
const low = findObjective(model, "10x");
const high = findObjective(model, "40x");
const onion = data.specimens.specimens.find((s) => s.id === "onion-epidermis")!;
const pond = data.specimens.specimens.find((s) => s.id === "pond-water")!;

describe("microscope optics", () => {
  it("calculates total magnification from eyepiece and objective", () => {
    expect(totalMagnification(eyepiece, low)).toBe(100);
    expect(totalMagnification(eyepiece, high)).toBe(400);
  });

  it("changes field of view when the objective changes", () => {
    const lowField = fieldOfViewMicrometres(eyepiece.fieldNumberMm, low);
    const highField = fieldOfViewMicrometres(eyepiece.fieldNumberMm, high);
    expect(lowField).toBeCloseTo(1800, 6);
    expect(highField).toBeCloseTo(450, 6);
    expect(highField).toBeLessThan(lowField);
  });

  it("calculates actual size from measured image size and magnification", () => {
    expect(actualSizeMicrometres(40, 400)).toBeCloseTo(100, 6);
    expect(actualSizeMicrometres(24, 100)).toBeCloseTo(240, 6);
    expect(convertFromMicrometres(100, "millimetre")).toBeCloseTo(0.1, 8);
  });

  it("uses the objective, not total magnification, for specimen field diameter", () => {
    expect(fieldOfViewMicrometres(18, { magnification: 4 })).toBeCloseTo(4500, 6);
    expect(fieldOfViewMicrometres(18, { magnification: 10 })).toBeCloseTo(1800, 6);
  });
});

describe("focus and illumination", () => {
  it("blurs when the focus offset exceeds the depth of field", () => {
    expect(focusQuality(0, high)).toBeCloseTo(1, 5);
    expect(focusQuality(8, high)).toBeLessThan(0.5);
  });

  it("reduces illumination quality when the lamp is off or the mirror is unaligned", () => {
    const illumination = { power: true, intensity: 70, diaphragm: 60, condenser: 60, mirrorAligned: false };
    expect(illuminationQuality(illumination, { lightSource: "led" }, low)).toBeGreaterThan(0.4);
    expect(illuminationQuality({ ...illumination, power: false }, { lightSource: "led" }, low)).toBeLessThan(0.1);
    expect(illuminationQuality(illumination, { lightSource: "mirror" }, low)).toBeLessThan(0.1);
  });

  it("makes structures visible only when magnification and clarity are sufficient", () => {
    const variant = onion.variants[0];
    const slide = {
      ...createEmptySlide(),
      specimenId: onion.id,
      variantId: variant.id,
      completedStepIds: onion.steps.map((s) => s.id),
      ready: true,
      onStage: true,
      secured: true,
      stainApplied: true,
    };
    const lowObservation = computeObservation({
      model,
      eyepiece,
      objective: findObjective(model, "4x"),
      specimen: onion,
      variant,
      slide,
      illumination: { power: true, intensity: 70, diaphragm: 70, condenser: 65, mirrorAligned: false },
      focusOffsetMicrometres: 0,
    });
    expect(lowObservation.totalMagnification).toBe(40);
    expect(lowObservation.visibleStructureIds).toContain("cell-wall");
    expect(lowObservation.visibleStructureIds).not.toContain("nucleus");

    const highObservation = computeObservation({
      model,
      eyepiece,
      objective: high,
      specimen: onion,
      variant,
      slide,
      illumination: { power: true, intensity: 100, diaphragm: 65, condenser: 70, mirrorAligned: false },
      focusOffsetMicrometres: 0,
    });
    expect(highObservation.visibleStructureIds).toContain("nucleus");
  });

  it("reports an empty field when the slide is far off centre", () => {
    const variant = onion.variants[0];
    const observation = computeObservation({
      model,
      eyepiece,
      objective: high,
      specimen: onion,
      variant,
      slide: {
        ...createEmptySlide(),
        specimenId: onion.id,
        variantId: variant.id,
        completedStepIds: onion.steps.map((s) => s.id),
        ready: true,
        onStage: true,
        secured: true,
        stainApplied: true,
        offsetXMicrometres: 400,
      },
      illumination: { power: true, intensity: 80, diaphragm: 65, condenser: 65, mirrorAligned: false },
      focusOffsetMicrometres: 0,
    });
    expect(observation.status).toBe("empty-field");
    expect(observation.visibleStructureIds).toHaveLength(0);
  });
});

describe("specimens and drawings", () => {
  it("selects deterministic pond-water variations", () => {
    const first = selectVariant(7, pond);
    const second = selectVariant(7, pond);
    expect(second.id).toBe(first.id);
    const variants = new Set([1, 2, 3, 4, 5, 6].map((seed) => selectVariant(seed, pond).id));
    expect(variants.size).toBeGreaterThan(1);
  });

  it("assesses labels against verified structure positions, not pixels", () => {
    const variant = onion.variants[0];
    const required = variant.structures.filter((s) => s.expectedInDrawing);
    const labels = required.map((structure, index) => ({
      id: `label-${index}`,
      text: structure.name,
      target: structure.point,
      label: [Math.min(0.95, structure.point[0] + 0.2), Math.max(0.05, structure.point[1] - 0.2)] as [number, number],
    }));
    const feedback = assessDrawing(
      {
        structures: required.map((s) => s.id),
        drawing: { strokes: [{ id: "s", colour: "#000", width: 2, points: [[0.4, 0.4], [0.6, 0.6]] }], labels },
        totalMagnification: 400,
        imageSizeMm: 40,
        actualSizeMicrometres: 100,
      },
      variant,
      true,
    );
    expect(feedback.ok).toBe(true);
    expect(feedback.score).toBe(100);

    const missing = assessDrawing(
      { structures: [], drawing: { strokes: [], labels: [] }, totalMagnification: null, imageSizeMm: null, actualSizeMicrometres: null },
      variant,
      true,
    );
    expect(missing.ok).toBe(false);
    expect(missing.missingLabels.length).toBe(required.length);
  });
});
