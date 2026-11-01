import type { Apparatus } from "@/lib/content/schemas";
import type { SimulationEvent } from "./simulationTypes";

export type ApparatusChallenge = "explore" | "identify" | "assemble" | "read";

export type ReadingTarget = "burette" | "pipette" | "measuring-cylinder";

export type ApparatusState = {
  items: Apparatus[];
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
};

export type ApparatusAction =
  | { type: "select"; id: string }
  | { type: "inspect" }
  | { type: "closeInspect" }
  | { type: "toBench" }
  | { type: "toShelf" }
  | { type: "startIdentify"; id: string }
  | { type: "guess"; id: string }
  | { type: "startSetup"; id: "titration" | "filtration" }
  | { type: "checkSetup" }
  | { type: "clearBench" }
  | { type: "reorderBench"; ids: string[] }
  | { type: "startReading"; target: ReadingTarget; trueReading: number }
  | { type: "setView"; view: "eye" | "above" | "below" }
  | { type: "submitReading"; value: number };

const SETUPS: Record<"titration" | "filtration", string[]> = {
  titration: ["retort-stand", "burette", "conical-flask", "white-tile"],
  filtration: ["filter-funnel", "beaker"],
};

export function createApparatusState(items: Apparatus[]): ApparatusState {
  return {
    items,
    selectedId: items[0]?.id ?? null,
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
  };
}

export function reduceApparatus(state: ApparatusState, action: ApparatusAction): { state: ApparatusState; events: SimulationEvent[] } {
  const events: SimulationEvent[] = [];
  const item = (id: string | null) => state.items.find((a) => a.id === id);

  switch (action.type) {
    case "select":
      return { state: { ...state, selectedId: action.id }, events };
    case "inspect":
      return { state: { ...state, inspecting: true }, events: [{ id: "inspect", message: item(state.selectedId)?.name ?? "Selected." }] };
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
      const target = item(state.identifyPromptId);
      if (!target) return { state, events };
      const ok = action.id === target.id;
      const first = ok && !state.identified.includes(target.id);
      if (first) events.push({ id: "identified", message: `${target.name} identified.`, xp: 5, badgeId: state.identified.length + 1 >= 8 ? "apparatus-expert" : undefined });
      return {
        state: {
          ...state,
          identified: first ? [...state.identified, target.id] : state.identified,
          identifyFeedback: ok ? `${target.name}: ${target.use}` : `That is ${item(action.id)?.name ?? "something else"}. Look for ${target.name}. ${target.use}`,
        },
        events,
      };
    }
    case "startSetup":
      return { state: { ...state, setupId: action.id, setupFeedback: null, bench: [] }, events };
    case "clearBench":
      return { state: { ...state, bench: [], setupFeedback: null }, events };
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
        const missingNames = missing.map((id) => item(id)?.name ?? id).join(", ");
        return {
          state: {
            ...state,
            setupFeedback: missing.length ? `Still needed: ${missingNames}.` : "Remove apparatus that is not part of this setup.",
            mistakes: [...state.mistakes, "Setup was not complete."],
          },
          events,
        };
      }
      events.push({ id: "setup", message: `${state.setupId} setup is complete.`, xp: 10 });
      return { state: { ...state, setupFeedback: "The apparatus is assembled in the right arrangement." }, events };
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
      return {
        state: {
          ...state,
          recordedReading: action.value,
          readingFeedback: ok
            ? `Correct. The meniscus is at ${state.trueReading.toFixed(2)} cm3.`
            : `The scale from this angle looks like ${seen.toFixed(2)} cm3. The true meniscus, read at eye level, is ${state.trueReading.toFixed(2)} cm3.`,
        },
        events,
      };
    }
    default:
      return { state, events };
  }
}

export const APPARATUS_SETUPS = SETUPS;
