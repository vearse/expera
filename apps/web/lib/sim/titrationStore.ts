import { average, calculate, concordantSet, equivalenceVolume, flaskPH, makeProblem, type TitrationProblem } from "@/lib/engine/titration";
import { roundTo } from "@/lib/engine/rng";
import type { SafetyEvent, SafetyRuleInput, SimulationEvent } from "./simulationTypes";
import { matchSafety } from "./simulationTypes";

export type ViewAngle = "eye" | "above" | "below";

export type TitreRow = {
  label: string;
  initial: number;
  final: number;
  titre: number;
  trueDelivered: number;
};

export type TitrationState = {
  mode: "regular" | "exam";
  seed: number;
  problem: TitrationProblem;
  trialIndex: number;
  labels: string[];
  rinsed: boolean;
  filled: boolean;
  bubbleRemoved: boolean;
  bubbleReleased: boolean;
  initialTrue: number;
  initialRecorded: number | null;
  deliveredToFlask: number;
  baseInFlask: boolean;
  pipetteVolume: number;
  indicatorDrops: number;
  onTile: boolean;
  swirled: boolean;
  view: ViewAngle;
  rows: TitreRow[];
  finished: boolean;
  mistakes: string[];
  safetyEvents: SafetyEvent[];
  criticalSafetyOpen: boolean;
};

export type TitrationAction =
  | { type: "rinse" }
  | { type: "fill" }
  | { type: "removeBubble" }
  | { type: "setView"; view: ViewAngle }
  | { type: "recordInitial" }
  | { type: "pipette"; method: "filler" | "mouth" }
  | { type: "addIndicator" }
  | { type: "setTile"; on: boolean }
  | { type: "swirl" }
  | { type: "deliver"; cm3: number }
  | { type: "recordFinal" }
  | { type: "nextTrial" }
  | { type: "restart"; seed: number; mode?: "regular" | "exam" };

const BUBBLE_CM3 = 0.2;
const PARALLAX_CM3 = 0.1;

export function createTitrationState(mode: "regular" | "exam", seed: number, pipetteVolume = 25): TitrationState {
  const made = makeProblem(mode, seed, pipetteVolume);
  return {
    mode,
    seed,
    problem: made.problem,
    trialIndex: 0,
    labels: made.trials.map((t) => t.label),
    rinsed: false,
    filled: false,
    bubbleRemoved: false,
    bubbleReleased: false,
    initialTrue: made.trials[0]?.initialLevel ?? 0,
    initialRecorded: null,
    deliveredToFlask: 0,
    baseInFlask: false,
    pipetteVolume: made.trials[0]?.pipetteActual ?? pipetteVolume,
    indicatorDrops: 0,
    onTile: false,
    swirled: false,
    view: "eye",
    rows: [],
    finished: false,
    mistakes: [],
    safetyEvents: [],
    criticalSafetyOpen: false,
  };
}

function trialInitial(state: TitrationState, index: number) {
  const made = makeProblem(state.mode, state.seed, state.problem.pipetteVolume);
  return made.trials[index] ?? made.trials[0];
}

export function buretteReading(state: TitrationState): number {
  const bubble = !state.bubbleRemoved && state.bubbleReleased ? BUBBLE_CM3 : 0;
  return roundTo(state.initialTrue + state.deliveredToFlask + bubble, 0.05);
}

export function recordedLevel(trueLevel: number, view: ViewAngle): number {
  const shift = view === "above" ? PARALLAX_CM3 : view === "below" ? -PARALLAX_CM3 : 0;
  return roundTo(trueLevel + shift, 0.05);
}

export function flaskAcidCm3(state: TitrationState): number {
  return state.deliveredToFlask;
}

export function currentPH(state: TitrationState): number | null {
  if (!state.baseInFlask) return null;
  const conc = state.rinsed || state.trialIndex > 0 ? state.problem.acidConc : state.problem.acidConc * 0.97;
  const problem = { ...state.problem, acidConc: conc };
  return flaskPH(problem, state.pipetteVolume, flaskAcidCm3(state));
}

export function endpointVolume(state: TitrationState): number {
  const conc = state.rinsed || state.trialIndex > 0 ? state.problem.acidConc : state.problem.acidConc * 0.97;
  return equivalenceVolume({ ...state.problem, acidConc: conc }, state.pipetteVolume);
}

export function reduceTitration(
  state: TitrationState,
  action: TitrationAction,
  rules: SafetyRuleInput[] = [],
): { state: TitrationState; events: SimulationEvent[]; safetyEvents: SafetyEvent[] } {
  const events: SimulationEvent[] = [];
  const safetyEvents: SafetyEvent[] = [];
  const note = (message: string) => state.mistakes.includes(message) ? state.mistakes : [...state.mistakes, message];

  if (action.type === "restart") {
    return { state: createTitrationState(action.mode ?? state.mode, action.seed, state.problem.pipetteVolume), events, safetyEvents };
  }
  if (state.finished) return { state, events, safetyEvents };

  switch (action.type) {
    case "rinse":
      return { state: { ...state, rinsed: true }, events: [{ id: "rinsed", message: "Burette rinsed with the acid." }], safetyEvents };
    case "fill":
      if (!state.rinsed) {
        return { state: { ...state, filled: true, mistakes: note("The burette was filled without rinsing it with the acid.") }, events, safetyEvents };
      }
      return { state: { ...state, filled: true }, events: [{ id: "filled", message: "Burette filled." }], safetyEvents };
    case "removeBubble":
      return { state: { ...state, bubbleRemoved: true }, events: [{ id: "bubble", message: "Air bubble removed from the jet." }], safetyEvents };
    case "setView":
      return { state: { ...state, view: action.view }, events, safetyEvents };
    case "recordInitial": {
      if (!state.filled) return { state: { ...state, mistakes: note("Record the initial reading after filling the burette.") }, events, safetyEvents };
      const value = recordedLevel(state.initialTrue, state.view);
      const mistakes = state.view === "eye" ? state.mistakes : note("The initial reading was not taken at eye level, so parallax makes it wrong.");
      return { state: { ...state, initialRecorded: value, mistakes }, events: [{ id: "initial", message: `Initial reading ${value.toFixed(2)} cm3.` }], safetyEvents };
    }
    case "pipette": {
      if (action.method === "mouth") {
        const hit = matchSafety("pipette_by_mouth", rules);
        if (hit) safetyEvents.push(hit);
        return {
          state: { ...state, criticalSafetyOpen: true, safetyEvents: [...state.safetyEvents, ...safetyEvents], mistakes: note("Pipetting by mouth is unsafe and does not transfer the base.") },
          events,
          safetyEvents,
        };
      }
      const trial = trialInitial(state, state.trialIndex);
      return {
        state: { ...state, baseInFlask: true, pipetteVolume: trial.pipetteActual, criticalSafetyOpen: false },
        events: [{ id: "pipette", message: "25 cm3 of base transferred with a pipette filler.", xp: 5 }],
        safetyEvents,
      };
    }
    case "addIndicator": {
      const drops = state.indicatorDrops + 1;
      const mistakes = drops > 5 ? note("Too much indicator makes the end-point colour harder to judge.") : state.mistakes;
      return { state: { ...state, indicatorDrops: drops, mistakes }, events, safetyEvents };
    }
    case "setTile":
      return { state: { ...state, onTile: action.on }, events, safetyEvents };
    case "swirl":
      return { state: { ...state, swirled: true }, events, safetyEvents };
    case "deliver": {
      if (!state.filled || state.initialRecorded === null) {
        return { state: { ...state, mistakes: note("Fill the burette and record the initial reading before opening the tap.") }, events, safetyEvents };
      }
      if (!state.baseInFlask) {
        return { state: { ...state, mistakes: note("There is no base in the conical flask yet.") }, events, safetyEvents };
      }
      const add = Math.max(0, action.cm3);
      let delivered = state.deliveredToFlask + add;
      let bubbleReleased = state.bubbleReleased;
      let mistakes = state.mistakes;
      if (!state.bubbleRemoved && !bubbleReleased && delivered > 0) {
        bubbleReleased = true;
        mistakes = note("An air bubble left the jet, so the burette reading is larger than the volume that entered the flask.");
      }
      const end = endpointVolume({ ...state, deliveredToFlask: delivered });
      if (delivered > end + 0.15) mistakes = note("The end point was overshot. The titre will be higher than the equivalence volume.");
      if (!state.swirled && delivered > 1) mistakes = note("The flask was not swirled, so the colour change is uneven.");
      return { state: { ...state, deliveredToFlask: delivered, bubbleReleased, mistakes }, events, safetyEvents };
    }
    case "recordFinal": {
      if (state.initialRecorded === null) return { state, events, safetyEvents };
      const trueFinal = buretteReading(state);
      const final = recordedLevel(trueFinal, state.view);
      const titre = roundTo(final - state.initialRecorded, 0.05);
      const row: TitreRow = { label: state.labels[state.trialIndex] ?? "Trial", initial: state.initialRecorded, final, titre, trueDelivered: roundTo(state.deliveredToFlask, 0.05) };
      const rows = [...state.rows, row];
      const mistakes = state.view === "eye" ? state.mistakes : note("A final reading taken off eye level includes a parallax error.");
      const done = rows.length >= state.labels.length;
      if (done) events.push({ id: "table-complete", message: "All four titres are recorded.", xp: 15, badgeId: "titration-star" });
      return { state: { ...state, rows, mistakes, finished: done }, events, safetyEvents };
    }
    case "nextTrial": {
      if (state.finished || state.rows.length <= state.trialIndex) return { state, events, safetyEvents };
      const next = state.trialIndex + 1;
      if (next >= state.labels.length) return { state: { ...state, finished: true }, events, safetyEvents };
      const trial = trialInitial(state, next);
      return {
        state: {
          ...state,
          trialIndex: next,
          filled: state.rinsed,
          bubbleRemoved: false,
          bubbleReleased: false,
          initialTrue: trial.initialLevel,
          initialRecorded: null,
          deliveredToFlask: 0,
          baseInFlask: false,
          pipetteVolume: trial.pipetteActual,
          indicatorDrops: 0,
          swirled: false,
        },
        events,
        safetyEvents,
      };
    }
    default:
      return { state, events, safetyEvents };
  }
}

export function titrationSummary(state: TitrationState) {
  const accurate = state.rows.filter((r) => r.label !== "Rough").map((r) => r.titre);
  const idx = concordantSet(accurate, 0.2);
  const values = idx.map((i) => accurate[i]);
  const avg = values.length ? average(values) : null;
  const calc = avg === null ? null : calculate(state.problem, avg);
  return { concordant: values, average: avg, calculation: calc };
}
