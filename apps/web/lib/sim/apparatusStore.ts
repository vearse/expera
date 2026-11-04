import type { Apparatus, Task } from "@/lib/content/schemas";
import type { SimulationEvent } from "./simulationTypes";
import { defaultPartStates, type ApparatusPartStates } from "./apparatusPartStates";
import {
  ASSEMBLE_SEQUENCE,
  identifyChoiceTasks,
  identifyTargetForStepIndex,
  safetyChoiceTasks,
  stageByIndex,
  stageCelebrationMessage,
  stepsInStage,
} from "./apparatusGuided";
import { APPARATUS_SETUP_DEFINITIONS } from "./apparatusSetups";

export type { GuidedStage, GuidedStageId } from "./apparatusGuided";
export {
  ASSEMBLE_SEQUENCE,
  GUIDED_STAGES,
  guidedPointerFor,
  guidedTeacherMessage,
  highlightIdsForStep,
  resolveGuidedStep,
  stageByIndex,
  teacherMessageFromStep,
} from "./apparatusGuided";
export { APPARATUS_SETUP_DEFINITIONS } from "./apparatusSetups";

export type ReadingTarget = "burette" | "pipette" | "measuring-cylinder";

export type ApparatusState = {
  items: Apparatus[];
  mode: "guided" | "explore";
  selectedId: string | null;
  inspecting: boolean;
  bench: string[];
  identified: string[];
  identifyPromptId: string | null;
  identifyFeedback: string | null;
  setupId: "titration" | "filtration" | null;
  setupFeedback: string | null;
  readingTarget: ReadingTarget | null;
  trueReading: number | null;
  view: "eye" | "above" | "below";
  recordedReading: number | null;
  readingFeedback: string | null;
  mistakes: string[];
  guidedStageIndex: number;
  guidedStepIndex: number;
  hintLevel: number;
  stageComplete: boolean;
  choiceFeedback: string | null;
  safetyTasks: Task[];
  identifyTasks: Task[];
  partStates: ApparatusPartStates;
  showSummary: boolean;
  celebrationMessage: string | null;
};

export type ApparatusAction =
  | { type: "select"; id: string }
  | { type: "deselect" }
  | { type: "inspect" }
  | { type: "closeInspect" }
  | { type: "toBench" }
  | { type: "toShelf" }
  | { type: "startIdentify"; id: string }
  | { type: "guess"; id: string }
  | { type: "startSetup"; id: "titration" | "filtration" }
  | { type: "checkSetup" }
  | { type: "clearBench" }
  | { type: "resetBench" }
  | { type: "reorderBench"; ids: string[] }
  | { type: "startReading"; target: ReadingTarget; trueReading: number }
  | { type: "setView"; view: "eye" | "above" | "below" }
  | { type: "submitReading"; value: number }
  | { type: "answerChoice"; taskId: string; optionId: string }
  | { type: "requestHint" }
  | { type: "advanceGuided" }
  | { type: "jumpToGuidedStage"; index: number }
  | { type: "togglePart"; part: "bunsen-lit" | "bunsen-air" }
  | { type: "closeSummary" };

const SETUPS: Record<"titration" | "filtration", string[]> = {
  titration: APPARATUS_SETUP_DEFINITIONS.titration.required,
  filtration: APPARATUS_SETUP_DEFINITIONS.filtration.required,
};

export const APPARATUS_SETUPS = SETUPS;

export function createApparatusState(
  items: Apparatus[],
  mode: "guided" | "explore" = "explore",
  guidedTasks: Task[] = [],
): ApparatusState {
  return {
    items,
    mode,
    selectedId: mode === "explore" ? items[0]?.id ?? null : null,
    inspecting: false,
    bench: [],
    identified: [],
    identifyPromptId: null,
    identifyFeedback: null,
    setupId: null,
    setupFeedback: null,
    readingTarget: null,
    trueReading: null,
    view: "eye",
    recordedReading: null,
    readingFeedback: null,
    mistakes: [],
    guidedStageIndex: 0,
    guidedStepIndex: 0,
    hintLevel: 0,
    stageComplete: false,
    choiceFeedback: null,
    safetyTasks: safetyChoiceTasks(guidedTasks),
    identifyTasks: identifyChoiceTasks(guidedTasks),
    partStates: defaultPartStates(),
    showSummary: false,
    celebrationMessage: null,
  };
}

function item(state: ApparatusState, id: string | null) {
  return state.items.find((a) => a.id === id);
}

function advanceStepOrStage(state: ApparatusState): Pick<
  ApparatusState,
  "guidedStepIndex" | "stageComplete" | "guidedStageIndex" | "hintLevel" | "choiceFeedback" | "identifyFeedback" | "celebrationMessage" | "identifyPromptId"
> {
  const stage = stageByIndex(state.guidedStageIndex);
  const total = stepsInStage(stage, state);
  const nextStep = state.guidedStepIndex + 1;
  if (nextStep >= total) {
    return {
      guidedStepIndex: state.guidedStepIndex,
      stageComplete: true,
      guidedStageIndex: state.guidedStageIndex,
      hintLevel: 0,
      choiceFeedback: null,
      identifyFeedback: null,
      celebrationMessage: stageCelebrationMessage(state),
      identifyPromptId: null,
    };
  }
  const slice = { ...state, guidedStepIndex: nextStep };
  return {
    guidedStepIndex: nextStep,
    stageComplete: false,
    guidedStageIndex: state.guidedStageIndex,
    hintLevel: 0,
    choiceFeedback: null,
    identifyFeedback: null,
    celebrationMessage: null,
    identifyPromptId: stage.id === "identify" ? identifyTargetForStepIndex(slice, nextStep) : state.identifyPromptId,
  };
}

function stateForGuidedStageIndex(state: ApparatusState, index: number): ApparatusState {
  const clamped = Math.min(GUIDED_STAGE_COUNT - 1, Math.max(0, index));
  const nextStage = stageByIndex(clamped);
  const slice = { ...state, guidedStageIndex: clamped, guidedStepIndex: 0 };
  return {
    ...state,
    guidedStageIndex: clamped,
    guidedStepIndex: 0,
    hintLevel: 0,
    stageComplete: false,
    choiceFeedback: null,
    setupFeedback: null,
    celebrationMessage: null,
    setupId: nextStage.id === "assemble" ? ASSEMBLE_SEQUENCE[0]! : nextStage.id === "assessment" ? "titration" : null,
    bench: [],
    partStates: defaultPartStates(),
    trueReading: null,
    readingFeedback: null,
    readingTarget: null,
    recordedReading: null,
    view: "eye",
    identifyFeedback: null,
    identifyPromptId: nextStage.id === "identify" ? identifyTargetForStepIndex(slice, 0) : null,
    showSummary: false,
  };
}

export function reduceApparatus(state: ApparatusState, action: ApparatusAction): { state: ApparatusState; events: SimulationEvent[] } {
  const events: SimulationEvent[] = [];
  const stage = stageByIndex(state.guidedStageIndex);

  switch (action.type) {
    case "select":
      return { state: { ...state, selectedId: action.id }, events };
    case "deselect":
      return { state: { ...state, selectedId: null }, events };
    case "inspect":
      return { state: { ...state, inspecting: true }, events: [{ id: "inspect", message: item(state, state.selectedId)?.name ?? "Selected." }] };
    case "closeInspect":
      return { state: { ...state, inspecting: false }, events };
    case "toBench": {
      if (!state.selectedId || state.bench.includes(state.selectedId)) return { state, events };
      return { state: { ...state, bench: [...state.bench, state.selectedId] }, events };
    }
    case "toShelf":
      return { state: { ...state, bench: state.bench.filter((id) => id !== state.selectedId) }, events };
    case "startIdentify":
      return { state: { ...state, identifyPromptId: action.id, identifyFeedback: null }, events };
    case "guess": {
      const target = item(state, state.identifyPromptId);
      if (!target) return { state, events };
      const ok = action.id === target.id;
      const first = ok && !state.identified.includes(target.id);
      if (first) events.push({ id: "identified", message: `${target.name} identified.`, xp: 5, badgeId: state.identified.length + 1 >= 8 ? "apparatus-expert" : undefined });
      let next: ApparatusState = {
        ...state,
        identified: first ? [...state.identified, target.id] : state.identified,
        identifyFeedback: ok ? `${target.name}: ${target.use}` : `Look for ${target.name}. ${target.use}`,
      };
      if (state.mode === "guided" && stage.id === "identify" && ok) {
        const progress = advanceStepOrStage(next);
        next = { ...next, ...progress };
      }
      return { state: next, events };
    }
    case "startSetup":
      return { state: { ...state, setupId: action.id, setupFeedback: null, bench: [] }, events };
    case "clearBench":
    case "resetBench":
      return { state: { ...state, bench: [], setupFeedback: null, partStates: defaultPartStates() }, events };
    case "reorderBench": {
      const allowed = new Set(state.bench);
      const ordered = action.ids.filter((id) => allowed.has(id));
      return ordered.length === state.bench.length ? { state: { ...state, bench: ordered }, events } : { state, events };
    }
    case "checkSetup": {
      if (!state.setupId) return { state, events };
      const need = SETUPS[state.setupId];
      const missing = need.filter((id) => !state.bench.includes(id));
      const extra = state.bench.filter((id) => !need.includes(id));
      if (missing.length || extra.length) {
        const missingNames = missing.map((id) => item(state, id)?.name ?? id).join(", ");
        return {
          state: {
            ...state,
            setupFeedback: missing.length ? `Still needed: ${missingNames}.` : "Remove apparatus that is not part of this set-up.",
            mistakes: [...state.mistakes, "Set-up was not complete."],
          },
          events,
        };
      }
      events.push({ id: "setup", message: `${state.setupId} set-up is complete.`, xp: 10 });
      let next: ApparatusState = { ...state, setupFeedback: "The apparatus is assembled in the right arrangement." };
      if (state.mode === "guided" && (stage.id === "assemble" || stage.id === "assessment")) {
        const progress = advanceStepOrStage(next);
        next = { ...next, ...progress };
        if (stage.id === "assemble" && !progress.stageComplete && progress.guidedStepIndex !== state.guidedStepIndex) {
          const nextSetup = ASSEMBLE_SEQUENCE[progress.guidedStepIndex] ?? "filtration";
          next = { ...next, bench: [], setupId: nextSetup, setupFeedback: `Next: ${nextSetup}.`, partStates: defaultPartStates() };
        }
      }
      return { state: next, events };
    }
    case "startReading":
      return { state: { ...state, readingTarget: action.target, trueReading: action.trueReading, recordedReading: null, readingFeedback: null, view: "eye" }, events };
    case "setView":
      return { state: { ...state, view: action.view }, events };
    case "submitReading": {
      if (state.trueReading === null) return { state, events };
      const shift = state.view === "above" ? 0.1 : state.view === "below" ? -0.1 : 0;
      const seen = Math.round((state.trueReading + shift) * 20) / 20;
      const ok = Math.abs(action.value - state.trueReading) <= 0.05 + 1e-9 && state.view === "eye";
      if (ok) events.push({ id: "reading", message: "Reading taken at eye level.", xp: 5 });
      let next: ApparatusState = {
        ...state,
        recordedReading: action.value,
        readingFeedback: ok
          ? `Correct. The meniscus is at ${state.trueReading.toFixed(2)} cm3.`
          : `The scale from this angle looks like ${seen.toFixed(2)} cm3. The true meniscus, read at eye level, is ${state.trueReading.toFixed(2)} cm3.`,
      };
      if (state.mode === "guided" && stage.id === "reading" && ok) {
        next = { ...next, ...advanceStepOrStage(next) };
      }
      return { state: next, events };
    }
    case "answerChoice": {
      const pool = stage.id === "safety" ? state.safetyTasks : state.identifyTasks;
      const task = pool.find((t) => t.id === action.taskId);
      if (!task || task.type !== "choice") return { state, events };
      const ok = action.optionId === task.answer;
      let next: ApparatusState = {
        ...state,
        choiceFeedback: ok ? task.explain : `${task.explain} Try again.`,
        mistakes: ok ? state.mistakes : [...state.mistakes, task.prompt],
      };
      if (state.mode === "guided" && stage.id === "safety" && ok) {
        next = { ...next, ...advanceStepOrStage(next) };
      }
      return { state: next, events };
    }
    case "togglePart": {
      const parts = { ...state.partStates, bunsen: { ...state.partStates.bunsen } };
      if (action.part === "bunsen-lit") parts.bunsen.lit = !parts.bunsen.lit;
      if (action.part === "bunsen-air") parts.bunsen.airOpen = !parts.bunsen.airOpen;
      let next = { ...state, partStates: parts };
      if (state.mode === "guided" && stage.id === "handling" && parts.bunsen.lit && parts.bunsen.airOpen) {
        next = { ...next, stageComplete: true, celebrationMessage: stageCelebrationMessage(next), hintLevel: 0 };
      }
      return { state: next, events };
    }
    case "requestHint": {
      if (state.mode !== "guided") return { state, events };
      return { state: { ...state, hintLevel: Math.min(2, state.hintLevel + 1) }, events };
    }
    case "jumpToGuidedStage": {
      if (state.mode !== "guided") return { state, events };
      return { state: stateForGuidedStageIndex(state, action.index), events };
    }
    case "advanceGuided": {
      if (state.mode !== "guided") return { state, events };
      if (stage.id === "handling" || stage.id === "cleanup") {
        const nextIndex = state.guidedStageIndex + 1;
        if (nextIndex >= GUIDED_STAGE_COUNT) {
          return { state: { ...state, showSummary: true, stageComplete: false }, events };
        }
        return { state: stateForGuidedStageIndex(state, nextIndex), events };
      }
      if (!state.stageComplete) return { state, events };
      const nextIndex = state.guidedStageIndex + 1;
      if (nextIndex >= GUIDED_STAGE_COUNT) {
        return { state: { ...state, showSummary: true }, events };
      }
      return { state: stateForGuidedStageIndex(state, nextIndex), events };
    }
    case "closeSummary":
      return { state: { ...state, showSummary: false }, events };
    default:
      return { state, events };
  }
}

const GUIDED_STAGE_COUNT = 7;
