import { createRng } from "@/lib/engine/rng";
import type {
  EyepieceSpec,
  MicroscopeModelSpec,
  ObjectiveSpec,
  PrepAction,
  SpecimenSpec,
  SpecimenVariant,
  StructureSpec,
} from "@/lib/content/biology";

export type { EyepieceSpec, MicroscopeModelSpec, ObjectiveSpec, PrepAction, SpecimenSpec, SpecimenVariant, StructureSpec };

export type FocusKnob = "coarse" | "fine";
export type ActualSizeUnit = "micrometre" | "millimetre" | "centimetre";

export type IlluminationState = {
  power: boolean;
  intensity: number;
  diaphragm: number;
  condenser: number;
  mirrorAligned: boolean;
};

export type SlideState = {
  specimenId: string | null;
  variantId: string | null;
  completedStepIds: string[];
  wrongActions: string[];
  ready: boolean;
  onStage: boolean;
  secured: boolean;
  offsetXMicrometres: number;
  offsetYMicrometres: number;
  stainApplied: boolean;
};

export type DrawingPoint = [number, number];
export type DrawingStroke = { id: string; colour: string; width: number; points: DrawingPoint[] };
export type DrawingLabel = {
  id: string;
  text: string;
  target: DrawingPoint;
  label: DrawingPoint;
  structureId?: string;
};
export type DrawingData = { strokes: DrawingStroke[]; labels: DrawingLabel[] };

export type DrawingRecord = {
  structures: string[];
  drawing: DrawingData;
  totalMagnification: number | null;
  imageSizeMm: number | null;
  actualSizeMicrometres: number | null;
};

export type ObservationStatus =
  | "no-specimen"
  | "preparation-incomplete"
  | "not-on-stage"
  | "not-secured"
  | "empty-field"
  | "observable";

export type ObservationResult = {
  status: ObservationStatus;
  totalMagnification: number;
  fieldOfViewMicrometres: number;
  brightness: number;
  focusQuality: number;
  illuminationQuality: number;
  preparationQuality: number;
  centringQuality: number;
  clarity: number;
  visibleStructureIds: string[];
  warnings: string[];
};

export type DrawingFeedback = {
  requiredStructures: string[];
  missingLabels: string[];
  incorrectLabels: string[];
  poorLines: string[];
  hasDrawing: boolean;
  hasMagnification: boolean;
  hasActualSize: boolean;
  issues: string[];
  score: number;
  ok: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function findEyepiece(model: MicroscopeModelSpec, id: string): EyepieceSpec {
  return model.eyepieces.find((e) => e.id === id) ?? model.eyepieces[0];
}

export function findObjective(model: MicroscopeModelSpec, id: string): ObjectiveSpec {
  return model.objectives.find((o) => o.id === id) ?? model.objectives[0];
}

export function totalMagnification(eyepiece: Pick<EyepieceSpec, "magnification">, objective: Pick<ObjectiveSpec, "magnification">): number {
  return eyepiece.magnification * objective.magnification;
}

export function fieldOfViewMicrometres(fieldNumberMm: number, objective: Pick<ObjectiveSpec, "magnification">): number {
  return (fieldNumberMm / objective.magnification) * 1000;
}

export function actualSizeMicrometres(imageSizeMm: number, magnification: number): number {
  if (magnification <= 0) return Number.NaN;
  return (imageSizeMm / magnification) * 1000;
}

export function convertFromMicrometres(valueMicrometres: number, unit: ActualSizeUnit): number {
  if (unit === "millimetre") return valueMicrometres / 1000;
  if (unit === "centimetre") return valueMicrometres / 10000;
  return valueMicrometres;
}

export function actualSizeInUnit(imageSizeMm: number, magnification: number, unit: ActualSizeUnit): number {
  return convertFromMicrometres(actualSizeMicrometres(imageSizeMm, magnification), unit);
}

export function actualSizeUnitLabel(unit: ActualSizeUnit): string {
  if (unit === "millimetre") return "mm";
  if (unit === "centimetre") return "cm";
  return "µm";
}

export function formatActualSize(valueMicrometres: number): string {
  if (valueMicrometres >= 1000) return `${(valueMicrometres / 1000).toFixed(2)} mm`;
  return `${valueMicrometres.toFixed(1)} µm`;
}

export function focusQuality(offsetMicrometres: number, objective: Pick<ObjectiveSpec, "depthOfFieldMicrometres">): number {
  const tolerance = Math.max(0.1, objective.depthOfFieldMicrometres * 2.2);
  return clamp(Math.exp(-Math.pow(offsetMicrometres / tolerance, 2)), 0, 1);
}

export function brightnessLevel(
  illumination: IlluminationState,
  model: Pick<MicroscopeModelSpec, "lightSource">,
  objective?: Pick<ObjectiveSpec, "magnification">,
): number {
  const mirrorReady = model.lightSource === "led" || illumination.mirrorAligned;
  if (!illumination.power || !mirrorReady) return 0;
  const aperture = 0.25 + 0.75 * (clamp(illumination.diaphragm, 0, 100) / 100);
  const condenser = 0.55 + 0.45 * (clamp(illumination.condenser, 0, 100) / 100);
  const power = clamp(illumination.intensity, 0, 100) / 100;
  const objectiveDemand = objective && objective.magnification >= 40 ? 1.12 : 1;
  return clamp(power * aperture * condenser * objectiveDemand, 0, 1.2);
}

export function illuminationQuality(
  illumination: IlluminationState,
  model: Pick<MicroscopeModelSpec, "lightSource">,
  objective: Pick<ObjectiveSpec, "magnification">,
): number {
  const mirrorReady = model.lightSource === "led" || illumination.mirrorAligned;
  if (!illumination.power || !mirrorReady) return 0.01;
  const brightness = brightnessLevel(illumination, model, objective);
  const optimum = objective.magnification >= 40 ? 0.62 : objective.magnification >= 10 ? 0.46 : 0.36;
  return clamp(1 - Math.abs(brightness - optimum) / 0.6, 0.03, 1);
}

export function preparationQuality(specimen: SpecimenSpec, slide: SlideState): number {
  const complete = specimen.steps.length ? slide.completedStepIds.length / specimen.steps.length : 0;
  const stainPenalty = specimen.stain?.required && !slide.stainApplied ? 0.25 : 0;
  const mistakePenalty = Math.min(0.4, slide.wrongActions.length * 0.07);
  return clamp(complete - stainPenalty - mistakePenalty, 0.05, 1);
}

export function centringQuality(slide: SlideState, fieldMicrometres: number): number {
  if (!slide.onStage || !slide.secured) return 0;
  const distance = Math.hypot(slide.offsetXMicrometres, slide.offsetYMicrometres);
  return clamp(1 - distance / Math.max(fieldMicrometres / 2, 1), 0, 1);
}

export function computeObservation(input: {
  model: MicroscopeModelSpec;
  eyepiece: EyepieceSpec;
  objective: ObjectiveSpec;
  specimen: SpecimenSpec;
  variant: SpecimenVariant;
  slide: SlideState;
  illumination: IlluminationState;
  focusOffsetMicrometres: number;
}): ObservationResult {
  const total = totalMagnification(input.eyepiece, input.objective);
  const field = fieldOfViewMicrometres(input.eyepiece.fieldNumberMm, input.objective);
  const brightness = brightnessLevel(input.illumination, input.model, input.objective);
  const focus = focusQuality(input.focusOffsetMicrometres, input.objective);
  const light = illuminationQuality(input.illumination, input.model, input.objective);
  const prep = preparationQuality(input.specimen, input.slide);
  const centring = centringQuality(input.slide, field);
  const clarity = clamp(
    focus * (0.35 + 0.65 * light) * (0.55 + 0.45 * prep) * (0.25 + 0.75 * centring),
    0,
    1,
  );

  const warnings: string[] = [];
  if (!input.illumination.power) warnings.push("The light source is off.");
  else if (input.model.lightSource === "mirror" && !input.illumination.mirrorAligned) warnings.push("The mirror is not aligned with the lamp.");
  if (brightness > 0 && brightness < 0.14) warnings.push("The field is too dark. Increase the illumination or open the diaphragm.");
  if (brightness > 0.92) warnings.push("The field is too bright, so contrast is poor. Reduce the illumination or close the diaphragm slightly.");
  if (focus < 0.45) warnings.push(input.focusOffsetMicrometres > 0 ? "The image is blurred. Lower the stage with the focus knob." : "The image is blurred. Raise the stage with the focus knob.");
  if (centring < 0.4) warnings.push("The specimen is near the edge of the field. Centre the slide.");
  if (prep < 0.65) warnings.push("The slide preparation is poor. Check the preparation steps and air bubbles.");
  if (input.objective.magnification >= 40 && focus < 0.3) warnings.push("At high power use the fine adjustment only.");

  let status: ObservationStatus = "observable";
  if (!input.slide.specimenId) status = "no-specimen";
  else if (!input.slide.ready) status = "preparation-incomplete";
  else if (!input.slide.onStage) status = "not-on-stage";
  else if (!input.slide.secured) status = "not-secured";
  else if (centring <= 0.02) status = "empty-field";

  const visibleStructureIds =
    status === "observable"
      ? input.variant.structures
          .filter((structure) => total >= structure.minTotalMagnification && clarity >= structure.minClarity)
          .map((structure) => structure.id)
      : [];

  return {
    status,
    totalMagnification: total,
    fieldOfViewMicrometres: field,
    brightness,
    focusQuality: focus,
    illuminationQuality: light,
    preparationQuality: prep,
    centringQuality: centring,
    clarity,
    visibleStructureIds,
    warnings,
  };
}

export function stableHash(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectVariant(seed: number, specimen: SpecimenSpec): SpecimenVariant {
  const rng = createRng((seed >>> 0) ^ stableHash(specimen.id));
  return rng.pick(specimen.variants);
}

export function variantForSlide(seed: number, specimen: SpecimenSpec): SpecimenVariant {
  return selectVariant(seed, specimen);
}

export function nextPreparationStep(specimen: SpecimenSpec, slide: SlideState) {
  return specimen.steps.find((step) => !slide.completedStepIds.includes(step.id)) ?? null;
}

export function expectedAction(specimen: SpecimenSpec, slide: SlideState): PrepAction | null {
  return nextPreparationStep(specimen, slide)?.action ?? null;
}

export function applyPreparationAction(
  specimen: SpecimenSpec,
  slide: SlideState,
  action: PrepAction,
): { slide: SlideState; feedback: string; ok: boolean; completedStepId: string | null } {
  const step = nextPreparationStep(specimen, slide);
  if (!step) {
    return { slide, feedback: "The slide is already prepared. Place it on the stage.", ok: false, completedStepId: null };
  }
  if (step.action !== action) {
    return {
      slide: { ...slide, wrongActions: [...slide.wrongActions, action] },
      feedback: step.error,
      ok: false,
      completedStepId: null,
    };
  }
  const completedStepIds = [...slide.completedStepIds, step.id];
  const ready = completedStepIds.length >= specimen.steps.length;
  return {
    slide: {
      ...slide,
      completedStepIds,
      ready,
      stainApplied: slide.stainApplied || action === "stain",
    },
    feedback: ready ? "The slide is ready. Place it on the microscope stage and secure it." : step.success,
    ok: true,
    completedStepId: step.id,
  };
}

export function createEmptySlide(): SlideState {
  return {
    specimenId: null,
    variantId: null,
    completedStepIds: [],
    wrongActions: [],
    ready: false,
    onStage: false,
    secured: false,
    offsetXMicrometres: 0,
    offsetYMicrometres: 0,
    stainApplied: false,
  };
}

export function createSlide(specimen: SpecimenSpec, seed: number): SlideState {
  const variant = selectVariant(seed, specimen);
  return {
    ...createEmptySlide(),
    specimenId: specimen.id,
    variantId: variant.id,
  };
}

export function focusOffsetAfterKnob(
  offsetMicrometres: number,
  knob: FocusKnob,
  direction: -1 | 1,
  model: Pick<MicroscopeModelSpec, "coarseStepMicrometres" | "fineStepMicrometres" | "focusRangeMicrometres">,
): number {
  const step = knob === "coarse" ? model.coarseStepMicrometres : model.fineStepMicrometres;
  return clamp(offsetMicrometres + direction * step, -model.focusRangeMicrometres, model.focusRangeMicrometres);
}

export function nudgeSlide(
  slide: SlideState,
  dx: number,
  dy: number,
  fieldMicrometres: number,
): SlideState {
  const limit = Math.max(fieldMicrometres, 100);
  return {
    ...slide,
    offsetXMicrometres: clamp(slide.offsetXMicrometres + dx, -limit, limit),
    offsetYMicrometres: clamp(slide.offsetYMicrometres + dy, -limit, limit),
  };
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function labelMatchesStructure(text: string, structure: StructureSpec): boolean {
  const label = normalise(text);
  const name = normalise(structure.name);
  if (!label) return false;
  return label.includes(name) || name.includes(label) || (structure.id.includes("paramecium") && label.includes("paramecium"));
}

function distance(a: DrawingPoint, b: DrawingPoint): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function assessmentRequiredStructures(variant: SpecimenVariant): StructureSpec[] {
  return variant.structures.filter((s) => s.expectedInDrawing);
}

export function assessDrawing(record: DrawingRecord, variant: SpecimenVariant, requireActualSize = false): DrawingFeedback {
  const required = assessmentRequiredStructures(variant);
  const labels = record.drawing.labels;
  const missingLabels: string[] = [];
  const incorrectLabels: string[] = [];
  const poorLines: string[] = [];

  for (const structure of required) {
    const matching = labels.filter((label) => distance(label.target, structure.point) <= 0.17);
    const correct = matching.some((label) => labelMatchesStructure(label.text, structure));
    if (!correct) {
      missingLabels.push(structure.name);
      const wrongText = matching.find((label) => !labelMatchesStructure(label.text, structure));
      if (wrongText) incorrectLabels.push(`"${wrongText.text}" is attached to the ${structure.name}.`);
    }
  }

  for (const label of labels) {
    const targetStructure = required.find((structure) => distance(label.target, structure.point) <= 0.17);
    if (!targetStructure && required.some((structure) => labelMatchesStructure(label.text, structure))) {
      const named = required.find((structure) => labelMatchesStructure(label.text, structure));
      if (named) incorrectLabels.push(`The line for "${label.text}" does not point to the ${named.name}.`);
    }
    if (distance(label.target, label.label) < 0.035) poorLines.push(`The label line for "${label.text}" is too short.`);
  }

  const hasDrawing = record.drawing.strokes.some((stroke) => stroke.points.length > 1);
  const hasMagnification = record.totalMagnification !== null && record.totalMagnification > 0;
  const hasActualSize = record.actualSizeMicrometres !== null && record.actualSizeMicrometres > 0;
  const issues: string[] = [];
  if (!hasDrawing) issues.push("Add a drawing of the specimen.");
  if (missingLabels.length) issues.push(`Add a correct label for: ${missingLabels.join(", ")}.`);
  if (incorrectLabels.length) issues.push(...incorrectLabels);
  if (poorLines.length) issues.push(...poorLines);
  if (!hasMagnification) issues.push("Record the total magnification.");
  if (requireActualSize && !hasActualSize) issues.push("Calculate and record the actual size.");
  if (record.structures.length === 0) issues.push("Record at least one observed structure before saving.");

  const checks = [
    hasDrawing,
    missingLabels.length === 0,
    incorrectLabels.length === 0,
    poorLines.length === 0,
    hasMagnification,
    !requireActualSize || hasActualSize,
    record.structures.length > 0,
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return {
    requiredStructures: required.map((s) => s.name),
    missingLabels,
    incorrectLabels,
    poorLines,
    hasDrawing,
    hasMagnification,
    hasActualSize,
    issues,
    score,
    ok: issues.length === 0,
  };
}

export function nearestStructureAt(
  point: DrawingPoint,
  variant: SpecimenVariant,
  maxDistance = 0.17,
): StructureSpec | null {
  let best: StructureSpec | null = null;
  let bestDistance = maxDistance;
  for (const structure of variant.structures) {
    const d = distance(point, structure.point);
    if (d <= bestDistance) {
      best = structure;
      bestDistance = d;
    }
  }
  return best;
}

export function magnificationTable(eyepiece: EyepieceSpec, objectives: ObjectiveSpec[]) {
  return objectives.map((objective) => ({
    objective: objective.name,
    total: totalMagnification(eyepiece, objective),
    fieldOfViewMicrometres: fieldOfViewMicrometres(eyepiece.fieldNumberMm, objective),
  }));
}
