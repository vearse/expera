import { createStore, type StoreApi } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  BiologyData,
  BiologyExperiment,
  MicroscopyContent,
  SpecimenSpec,
  SpecimenVariant,
  StructureSpec,
} from "@/lib/content/biology";
import {
  actualSizeMicrometres,
  actualSizeUnitLabel,
  applyPreparationAction,
  assessDrawing,
  assessmentRequiredStructures,
  brightnessLevel,
  centringQuality,
  computeObservation,
  createEmptySlide,
  createSlide,
  expectedAction,
  fieldOfViewMicrometres,
  findEyepiece,
  findObjective,
  focusOffsetAfterKnob,
  formatActualSize,
  nextPreparationStep,
  nudgeSlide,
  preparationQuality,
  selectVariant,
  totalMagnification,
  type ActualSizeUnit,
  type DrawingData,
  type DrawingFeedback,
  type DrawingLabel,
  type DrawingPoint,
  type DrawingStroke,
  type FocusKnob,
  type IlluminationState,
  type ObservationResult,
  type ObservationStatus,
  type PrepAction,
  type SlideState,
} from "@/lib/engine/biology/microscopy";
import type { SimulationEvent } from "./simulationTypes";

export type BiologyMode = "regular" | "exam";

export type BiologyRecord = {
  specimenId: string;
  specimenName: string;
  variantId: string;
  variantName: string;
  objectiveId: string;
  eyepieceId: string;
  totalMagnification: number;
  fieldOfViewMicrometres: number;
  structures: string[];
  preparationSteps: string[];
  imageSizeMm: number | null;
  actualSizeMicrometres: number | null;
  actualSizeUnit: ActualSizeUnit;
  observation: string;
  conclusion: string;
  drawing: DrawingData;
  observedAt: string;
  savedAt: string | null;
  completed: boolean;
};

export type MeasurementState = {
  imageSizeMm: number | null;
  unit: ActualSizeUnit;
  submitted: boolean;
};

export type BiologyLabState = {
  mode: BiologyMode;
  seed: number;
  microscopy: MicroscopyContent;
  experiments: BiologyExperiment[];
  specimens: SpecimenSpec[];
  modelId: string;
  eyepieceId: string;
  objectiveId: string;
  illumination: IlluminationState;
  focusOffsetMicrometres: number;
  microscopeSelected: boolean;
  inspectedParts: string[];
  inspectedPart: string | null;
  activeExperimentId: string;
  activeSpecimenId: string | null;
  slides: Record<string, SlideState>;
  records: Record<string, BiologyRecord>;
  measurement: MeasurementState;
  completedExperiments: string[];
  mistakes: string[];
  feedback: string;
  feedbackKind: "info" | "success" | "error";
  logs: string[];
};

export type BiologyAction =
  | { type: "selectMicroscope"; modelId: string }
  | { type: "inspectPart"; partId: string }
  | { type: "selectExperiment"; id: string }
  | { type: "setEyepiece"; id: string }
  | { type: "setObjective"; id: string }
  | { type: "setPower"; on: boolean }
  | { type: "setIllumination"; value: number }
  | { type: "setDiaphragm"; value: number }
  | { type: "setCondenser"; value: number }
  | { type: "alignMirror" }
  | { type: "focus"; knob: FocusKnob; direction: -1 | 1 }
  | { type: "selectSpecimen"; id: string }
  | { type: "prepareStep"; action: PrepAction }
  | { type: "resetSlide" }
  | { type: "placeSlide" }
  | { type: "removeSlide" }
  | { type: "secureSlide"; secured: boolean }
  | { type: "nudgeSlide"; direction: "left" | "right" | "up" | "down" }
  | { type: "centreSlide" }
  | { type: "recordObservation" }
  | { type: "saveObservation" }
  | { type: "setObservationText"; text: string }
  | { type: "setConclusion"; text: string }
  | { type: "setMeasurement"; imageSizeMm: number | null; unit?: ActualSizeUnit }
  | { type: "submitMeasurement" }
  | { type: "addStroke"; stroke: DrawingStroke }
  | { type: "addLabel"; label: DrawingLabel }
  | { type: "moveLabel"; id: string; label?: DrawingPoint; target?: DrawingPoint }
  | { type: "removeLabel"; id: string }
  | { type: "clearDrawing" }
  | { type: "setMode"; mode: BiologyMode; seed?: number }
  | { type: "newSample"; seed?: number }
  | { type: "setFeedback"; message: string; kind?: "info" | "success" | "error" };

export type BiologyTransition = {
  state: BiologyLabState;
  events: SimulationEvent[];
};

export function currentModel(state: BiologyLabState) {
  return state.microscopy.models.find((m) => m.id === state.modelId) ?? state.microscopy.models[0];
}

export function currentEyepiece(state: BiologyLabState) {
  return findEyepiece(currentModel(state), state.eyepieceId);
}

export function currentObjective(state: BiologyLabState) {
  return findObjective(currentModel(state), state.objectiveId);
}

export function currentExperiment(state: BiologyLabState): BiologyExperiment | undefined {
  return state.experiments.find((experiment) => experiment.id === state.activeExperimentId);
}

export function currentSpecimen(state: BiologyLabState): SpecimenSpec | null {
  return state.specimens.find((specimen) => specimen.id === state.activeSpecimenId) ?? null;
}

export function currentSlide(state: BiologyLabState): SlideState | null {
  return state.activeSpecimenId ? state.slides[state.activeSpecimenId] ?? null : null;
}

export function currentVariant(state: BiologyLabState): SpecimenVariant | null {
  const specimen = currentSpecimen(state);
  const slide = currentSlide(state);
  if (!specimen || !slide?.variantId) return null;
  return specimen.variants.find((variant) => variant.id === slide.variantId) ?? specimen.variants[0] ?? null;
}

export function currentRecord(state: BiologyLabState): BiologyRecord | null {
  return state.activeSpecimenId ? state.records[state.activeSpecimenId] ?? null : null;
}

export function currentDrawing(state: BiologyLabState): DrawingData {
  return currentRecord(state)?.drawing ?? { strokes: [], labels: [] };
}

export function currentObservation(state: BiologyLabState): ObservationResult | null {
  const specimen = currentSpecimen(state);
  const variant = currentVariant(state);
  const slide = currentSlide(state);
  if (!specimen || !variant || !slide) return null;
  return computeObservation({
    model: currentModel(state),
    eyepiece: currentEyepiece(state),
    objective: currentObjective(state),
    specimen,
    variant,
    slide,
    illumination: state.illumination,
    focusOffsetMicrometres: state.focusOffsetMicrometres,
  });
}

export function currentDrawingFeedback(state: BiologyLabState, requireActualSize = false): DrawingFeedback | null {
  const variant = currentVariant(state);
  const record = currentRecord(state);
  if (!variant || !record) return null;
  return assessDrawing(record, variant, requireActualSize);
}

export function measurementResult(state: BiologyLabState) {
  const magnification = totalMagnification(currentEyepiece(state), currentObjective(state));
  if (state.measurement.imageSizeMm === null) return null;
  const micrometres = actualSizeMicrometres(state.measurement.imageSizeMm, magnification);
  return {
    totalMagnification: magnification,
    micrometres,
    value: state.measurement.unit === "millimetre" ? micrometres / 1000 : state.measurement.unit === "centimetre" ? micrometres / 10000 : micrometres,
    unit: actualSizeUnitLabel(state.measurement.unit),
  };
}

export function createEmptyRecord(specimen: SpecimenSpec, variant: SpecimenVariant, state: BiologyLabState): BiologyRecord {
  const magnification = totalMagnification(currentEyepiece(state), currentObjective(state));
  const field = fieldOfViewMicrometres(currentEyepiece(state).fieldNumberMm, currentObjective(state));
  return {
    specimenId: specimen.id,
    specimenName: specimen.name,
    variantId: variant.id,
    variantName: variant.name,
    objectiveId: state.objectiveId,
    eyepieceId: state.eyepieceId,
    totalMagnification: magnification,
    fieldOfViewMicrometres: field,
    structures: [],
    preparationSteps: [],
    imageSizeMm: null,
    actualSizeMicrometres: null,
    actualSizeUnit: "micrometre",
    observation: "",
    conclusion: "",
    drawing: { strokes: [], labels: [] },
    observedAt: "",
    savedAt: null,
    completed: false,
  };
}

function withFeedback(state: BiologyLabState, message: string, kind: "info" | "success" | "error" = "info"): BiologyLabState {
  return { ...state, feedback: message, feedbackKind: kind };
}

function log(state: BiologyLabState, message: string): string[] {
  return [message, ...state.logs].slice(0, 20);
}

function withRecord(state: BiologyLabState, record: BiologyRecord): BiologyLabState {
  return { ...state, records: { ...state.records, [record.specimenId]: record } };
}

function updateCurrentRecord(state: BiologyLabState, mutate: (record: BiologyRecord) => BiologyRecord): BiologyLabState {
  const specimen = currentSpecimen(state);
  const variant = currentVariant(state);
  if (!specimen || !variant) return state;
  const existing = state.records[specimen.id] ?? createEmptyRecord(specimen, variant, state);
  return withRecord(state, mutate(existing));
}

function resetSessionSlides(state: BiologyLabState, seed: number): BiologyLabState {
  const slides: Record<string, SlideState> = {};
  for (const specimen of state.specimens) slides[specimen.id] = createSlide(specimen, seed);
  return { ...state, seed, slides };
}

export function createBiologyState(data: BiologyData, seed = 1, mode: BiologyMode = "regular"): BiologyLabState {
  const model = data.microscopy.models.find((m) => m.id === data.microscopy.defaultModelId) ?? data.microscopy.models[0];
  const eyepiece = findEyepiece(model, model.defaultEyepieceId);
  const objective = findObjective(model, model.defaultObjectiveId);
  const firstSpecimen = data.specimens.specimens[0];
  const activeSpecimenId = firstSpecimen?.id ?? null;
  const slides: Record<string, SlideState> = {};
  for (const specimen of data.specimens.specimens) slides[specimen.id] = createSlide(specimen, seed);
  return {
    mode,
    seed,
    microscopy: data.microscopy,
    experiments: data.experiments.experiments,
    specimens: data.specimens.specimens,
    modelId: model.id,
    eyepieceId: eyepiece.id,
    objectiveId: objective.id,
    illumination: {
      power: true,
      intensity: data.microscopy.defaultIllumination,
      diaphragm: data.microscopy.defaultDiaphragm,
      condenser: data.microscopy.defaultCondenser,
      mirrorAligned: false,
    },
    focusOffsetMicrometres: 120,
    microscopeSelected: false,
    inspectedParts: [],
    inspectedPart: null,
    activeExperimentId: data.experiments.experiments[0]?.id ?? "",
    activeSpecimenId,
    slides,
    records: {},
    measurement: { imageSizeMm: null, unit: "micrometre", submitted: false },
    completedExperiments: [],
    mistakes: [],
    feedback: "Select a microscope and inspect its parts before preparing a slide.",
    feedbackKind: "info",
    logs: [],
  };
}

export function reduceBiology(state: BiologyLabState, action: BiologyAction): BiologyTransition {
  const events: SimulationEvent[] = [];
  const addMistake = (message: string): string[] => (state.mistakes.includes(message) ? state.mistakes : [...state.mistakes, message]);
  const change = (next: BiologyLabState): BiologyTransition => ({ state: next, events });
  const activeSpecimen = currentSpecimen(state);
  const activeSlide = currentSlide(state);
  const model = currentModel(state);
  const objective = currentObjective(state);
  const eyepiece = currentEyepiece(state);

  switch (action.type) {
    case "selectMicroscope": {
      const nextModel = state.microscopy.models.find((entry) => entry.id === action.modelId);
      if (!nextModel) return change(withFeedback(state, "That microscope is not available.", "error"));
      const nextEyepiece = findEyepiece(nextModel, nextModel.defaultEyepieceId);
      const nextObjective = findObjective(nextModel, nextModel.defaultObjectiveId);
      const next = {
        ...state,
        modelId: nextModel.id,
        eyepieceId: nextEyepiece.id,
        objectiveId: nextObjective.id,
        microscopeSelected: true,
        focusOffsetMicrometres: 120,
        inspectedPart: null,
        logs: log(state, `${nextModel.name} selected.`),
      };
      return change(withFeedback(next, "Microscope selected. Inspect its parts, then place a prepared slide on the stage.", "success"));
    }
    case "inspectPart": {
      const inspectedParts = state.inspectedParts.includes(action.partId)
        ? state.inspectedParts
        : [...state.inspectedParts, action.partId];
      return change({ ...state, inspectedParts, inspectedPart: action.partId });
    }
    case "selectExperiment": {
      const experiment = state.experiments.find((entry) => entry.id === action.id);
      if (!experiment) return change(state);
      const slide = state.slides[experiment.specimenId];
      const next = {
        ...state,
        activeExperimentId: experiment.id,
        activeSpecimenId: experiment.specimenId,
        measurement: { imageSizeMm: null, unit: "micrometre" as ActualSizeUnit, submitted: false },
        feedback: experiment.summary,
        feedbackKind: "info" as const,
      };
      if (!slide) next.slides = { ...state.slides, [experiment.specimenId]: createSlide(state.specimens.find((s) => s.id === experiment.specimenId)!, state.seed) };
      return change(next);
    }
    case "setEyepiece": {
      if (!model.eyepieces.some((entry) => entry.id === action.id)) return change(state);
      return change(withFeedback({ ...state, eyepieceId: action.id }, "Eyepiece changed. Total magnification has changed.", "success"));
    }
    case "setObjective": {
      const nextObjective = model.objectives.find((entry) => entry.id === action.id);
      if (!nextObjective) return change(state);
      const focusOffset = nextObjective.focusShiftMicrometres + 20;
      const next = {
        ...state,
        objectiveId: action.id,
        focusOffsetMicrometres: focusOffset,
        logs: log(state, `Objective changed to ${nextObjective.name}.`),
      };
      return change(withFeedback(next, `Objective changed to ${nextObjective.name}. Refocus using the ${nextObjective.magnification >= 40 ? "fine" : "coarse"} adjustment.`, "info"));
    }
    case "setPower":
      return change(withFeedback({ ...state, illumination: { ...state.illumination, power: action.on } }, action.on ? "Light source switched on." : "Light source switched off.", action.on ? "success" : "info"));
    case "setIllumination":
      return change({ ...state, illumination: { ...state.illumination, intensity: Math.min(100, Math.max(0, action.value)) } });
    case "setDiaphragm":
      return change({ ...state, illumination: { ...state.illumination, diaphragm: Math.min(100, Math.max(0, action.value)) } });
    case "setCondenser":
      return change({ ...state, illumination: { ...state.illumination, condenser: Math.min(100, Math.max(0, action.value)) } });
    case "alignMirror":
      return change(withFeedback({ ...state, illumination: { ...state.illumination, mirrorAligned: true } }, "Mirror aligned so the bench lamp now passes through the condenser.", "success"));
    case "focus": {
      if (objective.magnification >= 40 && action.knob === "coarse") {
        const next = {
          ...state,
          mistakes: addMistake("The coarse adjustment was used at high power; use the fine adjustment to protect the slide and objective."),
        };
        return change(withFeedback(next, "At high power, do not use the coarse adjustment. Turn the fine adjustment instead.", "error"));
      }
      const offset = focusOffsetAfterKnob(state.focusOffsetMicrometres, action.knob, action.direction, model);
      const quality = Math.exp(-Math.pow(offset / Math.max(0.1, objective.depthOfFieldMicrometres * 2.2), 2));
      const message = quality > 0.82 ? "The image is nearly in focus." : offset > 0 ? "Keep lowering the stage slowly." : "Keep raising the stage slowly.";
      return change(withFeedback({ ...state, focusOffsetMicrometres: offset }, message, quality > 0.82 ? "success" : "info"));
    }
    case "selectSpecimen": {
      const specimen = state.specimens.find((entry) => entry.id === action.id);
      if (!specimen) return change(state);
      const slide = state.slides[specimen.id] ?? createSlide(specimen, state.seed);
      const record = state.records[specimen.id];
      return change({
        ...state,
        activeSpecimenId: specimen.id,
        slides: { ...state.slides, [specimen.id]: slide },
        measurement: {
          imageSizeMm: record?.imageSizeMm ?? null,
          unit: record?.actualSizeUnit ?? "micrometre",
          submitted: record?.actualSizeMicrometres !== null && record?.actualSizeMicrometres !== undefined,
        },
        feedback: `${specimen.name} selected. ${slide.ready ? "The slide is ready." : "Prepare the slide before placing it on the stage."}`,
        feedbackKind: "info",
        logs: log(state, `${specimen.name} selected.`),
      });
    }
    case "prepareStep": {
      if (!activeSpecimen || !activeSlide) return change(withFeedback(state, "Select a specimen before preparing a slide.", "error"));
      const result = applyPreparationAction(activeSpecimen, activeSlide, action.action);
      const nextSlide = result.slide;
      let next: BiologyLabState = {
        ...state,
        slides: { ...state.slides, [activeSpecimen.id]: nextSlide },
        logs: log(state, result.feedback),
      };
      if (!result.ok) {
        next = { ...next, mistakes: addMistake(activeSpecimen.steps.find((step) => step.action === action.action)?.error ?? result.feedback) };
        if (result.completedStepId === null) {
          next = { ...next, feedback: result.feedback, feedbackKind: "error" };
        }
      }
      if (result.ok) {
        events.push({ id: `prep-${result.completedStepId}`, message: result.feedback });
        next = { ...next, feedback: result.feedback, feedbackKind: "success" };
      }
      return change(next);
    }
    case "resetSlide": {
      if (!activeSpecimen) return change(state);
      const slide = createSlide(activeSpecimen, state.seed);
      return change(withFeedback({ ...state, slides: { ...state.slides, [activeSpecimen.id]: slide } }, "A fresh slide is ready. Begin the preparation again.", "info"));
    }
    case "placeSlide": {
      if (!activeSpecimen || !activeSlide) return change(withFeedback(state, "Select a specimen first.", "error"));
      if (!activeSlide.ready) {
        return change(withFeedback({ ...state, mistakes: addMistake("A slide was placed on the stage before preparation was complete.") }, "The slide is not prepared yet. Complete every preparation step first.", "error"));
      }
      const next = { ...state, slides: { ...state.slides, [activeSpecimen.id]: { ...activeSlide, onStage: true, secured: false } } };
      return change(withFeedback(next, "Slide placed on the stage. Secure it with the stage clips before focusing.", "success"));
    }
    case "removeSlide": {
      if (!activeSpecimen || !activeSlide) return change(state);
      return change(withFeedback({ ...state, slides: { ...state.slides, [activeSpecimen.id]: { ...activeSlide, onStage: false, secured: false } } }, "Slide removed from the stage.", "info"));
    }
    case "secureSlide": {
      if (!activeSpecimen || !activeSlide) return change(state);
      if (!activeSlide.onStage && action.secured) return change(withFeedback(state, "Place the slide on the stage before securing it.", "error"));
      const next = { ...state, slides: { ...state.slides, [activeSpecimen.id]: { ...activeSlide, secured: action.secured } } };
      return change(withFeedback(next, action.secured ? "Stage clips secured. The slide is stable." : "Stage clips released.", "success"));
    }
    case "nudgeSlide": {
      if (!activeSpecimen || !activeSlide) return change(state);
      const step = fieldOfViewMicrometres(eyepiece.fieldNumberMm, objective) / 12;
      const delta = {
        left: [-step, 0] as const,
        right: [step, 0] as const,
        up: [0, -step] as const,
        down: [0, step] as const,
      }[action.direction];
      const nextSlide = nudgeSlide(activeSlide, delta[0], delta[1], fieldOfViewMicrometres(eyepiece.fieldNumberMm, objective));
      return change({ ...state, slides: { ...state.slides, [activeSpecimen.id]: nextSlide } });
    }
    case "centreSlide": {
      if (!activeSpecimen || !activeSlide) return change(state);
      return change(withFeedback({ ...state, slides: { ...state.slides, [activeSpecimen.id]: { ...activeSlide, offsetXMicrometres: 0, offsetYMicrometres: 0 } } }, "Specimen centred in the field of view.", "success"));
    }
    case "recordObservation": {
      if (!activeSpecimen || !activeSlide) return change(withFeedback(state, "Select a specimen first.", "error"));
      const observation = currentObservation(state);
      if (!observation) return change(withFeedback(state, "No specimen field is available.", "error"));
      if (observation.status !== "observable") {
        const labels: Record<ObservationStatus, string> = {
          "no-specimen": "Select a specimen first.",
          "preparation-incomplete": "Complete the slide preparation before observing.",
          "not-on-stage": "Place the prepared slide on the stage.",
          "not-secured": "Secure the slide with the stage clips.",
          "empty-field": "The specimen is outside the field of view. Centre the slide.",
          observable: "",
        };
        return change(withFeedback({ ...state, mistakes: addMistake(labels[observation.status]) }, labels[observation.status], "error"));
      }
      if (observation.clarity < 0.3 || observation.visibleStructureIds.length === 0) {
        const message = observation.warnings[0] ?? "The image is not clear enough to record. Adjust focus, illumination or magnification.";
        return change(withFeedback({ ...state, mistakes: addMistake("Observation recorded before the image was clear.") }, message, "error"));
      }
      const variant = currentVariant(state)!;
      const existing = state.records[activeSpecimen.id];
      const record: BiologyRecord = {
        ...(existing ?? createEmptyRecord(activeSpecimen, variant, state)),
        objectiveId: state.objectiveId,
        eyepieceId: state.eyepieceId,
        totalMagnification: observation.totalMagnification,
        fieldOfViewMicrometres: observation.fieldOfViewMicrometres,
        structures: observation.visibleStructureIds,
        preparationSteps: activeSpecimen.steps.filter((step) => activeSlide.completedStepIds.includes(step.id)).map((step) => step.label),
        observedAt: new Date().toISOString(),
      };
      const next = withRecord(state, record);
      events.push({ id: `observe-${activeSpecimen.id}`, message: `Observation recorded at ${observation.totalMagnification}×.`, xp: 5 });
      return change(withFeedback({ ...next, logs: log(next, `Observation recorded at ${observation.totalMagnification}×.`) }, "Observation recorded. Now complete the drawing, labels and measurement.", "success"));
    }
    case "saveObservation": {
      if (!activeSpecimen || !activeSlide) return change(withFeedback(state, "Select a specimen first.", "error"));
      const variant = currentVariant(state);
      if (!variant) return change(withFeedback(state, "No specimen variant is loaded.", "error"));
      const existing = state.records[activeSpecimen.id];
      if (!existing || existing.structures.length === 0) return change(withFeedback(state, "Record an observation before saving the notebook entry.", "error"));
      const experiment = currentExperiment(state);
      const requireActualSize = experiment?.id === "measurement-and-drawing";
      const record = { ...existing, savedAt: new Date().toISOString() };
      const feedback = assessDrawing(record, variant, requireActualSize);
      const completed = feedback.ok;
      const nextRecord = { ...record, completed };
      const completedExperiments = completed && experiment && !state.completedExperiments.includes(experiment.id)
        ? [...state.completedExperiments, experiment.id]
        : state.completedExperiments;
      const next = withRecord({ ...state, completedExperiments }, nextRecord);
      if (completed) events.push({ id: `complete-${activeSpecimen.id}`, message: `${activeSpecimen.name} notebook entry completed.`, xp: 15, badgeId: "microscopy-star" });
      return change(withFeedback(next, completed ? "Notebook entry saved and complete." : `Notebook saved with feedback: ${feedback.issues[0] ?? "review your labels."}`, completed ? "success" : "info"));
    }
    case "setObservationText":
      return change(updateCurrentRecord(state, (record) => ({ ...record, observation: action.text })));
    case "setConclusion":
      return change(updateCurrentRecord(state, (record) => ({ ...record, conclusion: action.text })));
    case "setMeasurement": {
      return change({
        ...state,
        measurement: {
          ...state.measurement,
          imageSizeMm: action.imageSizeMm,
          unit: action.unit ?? state.measurement.unit,
          submitted: false,
        },
      });
    }
    case "submitMeasurement": {
      if (state.measurement.imageSizeMm === null || state.measurement.imageSizeMm <= 0) return change(withFeedback(state, "Measure the image with the ruler before calculating actual size.", "error"));
      const magnification = totalMagnification(eyepiece, objective);
      const micrometres = actualSizeMicrometres(state.measurement.imageSizeMm, magnification);
      const unitLabel = actualSizeUnitLabel(state.measurement.unit);
      const value = state.measurement.unit === "millimetre" ? micrometres / 1000 : state.measurement.unit === "centimetre" ? micrometres / 10000 : micrometres;
      const next = updateCurrentRecord(
        { ...state, measurement: { ...state.measurement, submitted: true } },
        (record) => ({
          ...record,
          imageSizeMm: state.measurement.imageSizeMm,
          actualSizeMicrometres: micrometres,
          actualSizeUnit: state.measurement.unit,
          totalMagnification: magnification,
          eyepieceId: state.eyepieceId,
          objectiveId: state.objectiveId,
        }),
      );
      events.push({ id: `measure-${activeSpecimen?.id ?? "specimen"}`, message: `Actual size calculated as ${formatActualSize(micrometres)}.`, xp: 5 });
      return change(withFeedback(next, `Actual size = ${state.measurement.imageSizeMm.toFixed(1)} mm ÷ ${magnification} = ${value.toFixed(2)} ${unitLabel} (${formatActualSize(micrometres)}).`, "success"));
    }
    case "addStroke":
      return change(updateCurrentRecord(state, (record) => ({ ...record, drawing: { ...record.drawing, strokes: [...record.drawing.strokes, action.stroke].slice(-80) } })));
    case "addLabel": {
      return change(updateCurrentRecord(state, (record) => ({
        ...record,
        drawing: { ...record.drawing, labels: [...record.drawing.labels.filter((label) => label.id !== action.label.id), action.label].slice(-20) },
      })));
    }
    case "moveLabel":
      return change(updateCurrentRecord(state, (record) => ({
        ...record,
        drawing: {
          ...record.drawing,
          labels: record.drawing.labels.map((label) =>
            label.id === action.id
              ? { ...label, label: action.label ?? label.label, target: action.target ?? label.target }
              : label,
          ),
        },
      })));
    case "removeLabel":
      return change(updateCurrentRecord(state, (record) => ({
        ...record,
        drawing: { ...record.drawing, labels: record.drawing.labels.filter((label) => label.id !== action.id) },
      })));
    case "clearDrawing":
      return change(withFeedback(updateCurrentRecord(state, (record) => ({ ...record, drawing: { strokes: [], labels: [] } })), "Drawing cleared.", "info"));
    case "setMode": {
      const seed = action.seed ?? state.seed + 1;
      const next = resetSessionSlides(
        {
          ...state,
          mode: action.mode,
          activeSpecimenId: state.activeSpecimenId ?? state.specimens[0]?.id ?? null,
          measurement: { imageSizeMm: null, unit: "micrometre", submitted: false },
          feedback: action.mode === "regular" ? "Regular Practice: hints and step guidance are available." : "Exam Preparation: no procedural hints. Work independently and review your feedback at the end.",
          feedbackKind: "info",
          logs: [],
        },
        seed,
      );
      return change(next);
    }
    case "newSample": {
      const seed = action.seed ?? state.seed + 1;
      return change(withFeedback(resetSessionSlides(state, seed), "A fresh set of specimens and pond-water variations has been loaded.", "success"));
    }
    case "setFeedback":
      return change(withFeedback(state, action.message, action.kind ?? "info"));
    default:
      return change(state);
  }
}

export function suggestionFor(state: BiologyLabState): string | null {
  if (state.mode === "exam") return null;
  if (!state.microscopeSelected) return "Select a microscope at a workstation.";
  const specimen = currentSpecimen(state);
  const slide = currentSlide(state);
  if (!specimen || !slide) return "Choose a specimen from the storage cabinet.";
  if (!slide.ready) {
    const step = nextPreparationStep(specimen, slide);
    return step ? `${step.label}: ${step.instruction}` : "Complete the slide preparation.";
  }
  if (!slide.onStage) return "Place the prepared slide on the microscope stage.";
  if (!slide.secured) return "Secure the slide with the stage clips.";
  const observation = currentObservation(state);
  if (!observation) return "Adjust the microscope to view the specimen.";
  if (observation.illuminationQuality < 0.5) return "Adjust the light intensity and diaphragm so the field is bright but not washed out.";
  if (observation.focusQuality < 0.55) return `Use the ${currentObjective(state).magnification >= 40 ? "fine" : "coarse"} adjustment to focus the image. ${state.focusOffsetMicrometres > 0 ? "Lower the stage slowly." : "Raise the stage slowly."}`;
  if (observation.centringQuality < 0.7) return "Centre the specimen using the stage movement controls.";
  if (observation.visibleStructureIds.length === 0) return "Increase magnification or improve the preparation to reveal structures.";
  if (!state.records[specimen.id]?.structures.length) return "Record the observation when the image is clear.";
  const record = state.records[specimen.id];
  if (!record.drawing.strokes.length) return "Draw what you can actually see in the microscope field.";
  const feedback = currentDrawingFeedback(state, currentExperiment(state)?.id === "measurement-and-drawing");
  if (feedback?.issues.length) return feedback.issues[0];
  if (!record.savedAt) return "Save the notebook entry for this specimen.";
  return "Experiment complete. Try another specimen or a different magnification.";
}

export function examBreakdown(state: BiologyLabState) {
  const records = Object.values(state.records);
  const saved = records.filter((record) => record.savedAt);
  const completed = records.filter((record) => record.completed);
  const areas = new Set<string>();
  for (const mistake of state.mistakes) areas.add(mistake);
  for (const record of records) {
    const specimen = state.specimens.find((entry) => entry.id === record.specimenId);
    const variant = specimen?.variants.find((entry) => entry.id === record.variantId);
    if (variant && record.savedAt) {
      const feedback = assessDrawing(record, variant, currentExperiment(state)?.id === "measurement-and-drawing");
      feedback.issues.forEach((issue) => areas.add(issue));
    }
  }
  return {
    saved: saved.length,
    completed: completed.length,
    total: state.specimens.length,
    mistakes: state.mistakes,
    areas: [...areas],
    completedExperiments: state.completedExperiments,
  };
}

export function requiredStructuresForActive(state: BiologyLabState): StructureSpec[] {
  const variant = currentVariant(state);
  return variant ? assessmentRequiredStructures(variant) : [];
}

export function preparationStepState(state: BiologyLabState) {
  const specimen = currentSpecimen(state);
  const slide = currentSlide(state);
  if (!specimen || !slide) return { next: null, expectedAction: null, quality: 0 };
  return {
    next: nextPreparationStep(specimen, slide),
    expectedAction: expectedAction(specimen, slide),
    quality: preparationQuality(specimen, slide),
  };
}

export type BiologyStore = BiologyLabState & { dispatch: (action: BiologyAction) => void };

type PersistedBiology = Pick<
  BiologyLabState,
  | "mode"
  | "seed"
  | "modelId"
  | "eyepieceId"
  | "objectiveId"
  | "illumination"
  | "focusOffsetMicrometres"
  | "microscopeSelected"
  | "inspectedParts"
  | "activeExperimentId"
  | "activeSpecimenId"
  | "slides"
  | "records"
  | "measurement"
  | "completedExperiments"
  | "mistakes"
>;

export function createBiologyMicroscopyStore(data: BiologyData, seed = 1): StoreApi<BiologyStore> {
  const initial = createBiologyState(data, seed);
  return createStore<BiologyStore>()(
    persist(
      (set, get) => ({
        ...initial,
        dispatch: (action: BiologyAction) => {
          const transition = reduceBiology(get(), action);
          for (const event of transition.events) {
            if (event.xp) {
              const mission = `${event.id}-${transition.state.seed}`;
              void import("@/lib/runtime/gamification").then(({ awardMissionXp }) => awardMissionXp(mission, event.xp!, event.badgeId));
            }
          }
          set({ ...transition.state, dispatch: get().dispatch });
        },
      }),
      {
        name: "expera-biology-microscopy-v1",
        storage: createJSONStorage(() => localStorage),
        partialize: (state): PersistedBiology => ({
          mode: state.mode,
          seed: state.seed,
          modelId: state.modelId,
          eyepieceId: state.eyepieceId,
          objectiveId: state.objectiveId,
          illumination: state.illumination,
          focusOffsetMicrometres: state.focusOffsetMicrometres,
          microscopeSelected: state.microscopeSelected,
          inspectedParts: state.inspectedParts,
          activeExperimentId: state.activeExperimentId,
          activeSpecimenId: state.activeSpecimenId,
          slides: state.slides,
          records: state.records,
          measurement: state.measurement,
          completedExperiments: state.completedExperiments,
          mistakes: state.mistakes,
        }),
        merge: (persisted, current) => {
          const saved = persisted as Partial<PersistedBiology> | undefined;
          if (!saved) return current;
          return {
            ...current,
            ...saved,
            slides: { ...current.slides, ...(saved.slides ?? {}) },
            records: { ...current.records, ...(saved.records ?? {}) },
            microscopy: current.microscopy,
            experiments: current.experiments,
            specimens: current.specimens,
            dispatch: current.dispatch,
          };
        },
      },
    ),
  );
}

export type { ObservationResult, ObservationStatus, SlideState, DrawingStroke, DrawingLabel, DrawingData, FocusKnob, ActualSizeUnit };
