import type { Apparatus, GuidedTourStage, Task } from "@/lib/content/schemas";
import type { ApparatusPartStates } from "./apparatusPartStates";
import { APPARATUS_SETUP_DEFINITIONS } from "./apparatusSetups";

/**
 * Guided teacher-step schema (single source of truth for Ms. Ada copy and in-room cards):
 * - Each stage has 1..N substeps (guidedStepIndex).
 * - Each substep exposes hint0 / hint1 / hint2 (escalate via hintLevel, max 2).
 * - primaryAction describes what the learner should do; highlightIds optional for 3D affordances at hint ≥ 1.
 * - Completion is handled in apparatusStore reducers — not auto-complete on “show answer”.
 */
export type GuidedStageId =
  | "safety"
  | "identify"
  | "reading"
  | "handling"
  | "assemble"
  | "cleanup"
  | "assessment";

export type GuidedPrimaryAction =
  | { kind: "choice" }
  | { kind: "identify"; apparatusId: string }
  | { kind: "reading" }
  | { kind: "handling-bunsen" }
  | { kind: "assemble"; setupId: "titration" | "filtration" }
  | { kind: "cleanup" }
  | { kind: "assemble-final"; setupId: "titration" };

export type GuidedStepView = {
  stepIndex: number;
  stepTotal: number;
  title: string;
  hint0: string;
  hint1: string;
  hint2: string;
  answerReveal: string | null;
  primaryAction: GuidedPrimaryAction;
  highlightIds: string[];
};

export type GuidedStage = GuidedTourStage;

export const GUIDED_STAGES: GuidedStage[] = [
  {
    id: "safety",
    title: "Safety briefing",
    theory: "Wear a laboratory coat and eye protection. Know hazard symbols, lab rules, and what to do if something spills.",
    taskKind: "choice",
  },
  {
    id: "identify",
    title: "Apparatus identification",
    theory: "Name each piece of apparatus and state what it is used for before you touch it.",
    taskKind: "identify-click",
  },
  {
    id: "reading",
    title: "Reading measuring instruments",
    theory: "Read the bottom of the meniscus at eye level. Burette readings are to 0.05 cm³.",
    taskKind: "reading",
  },
  {
    id: "handling",
    title: "Handling skills",
    theory: "Light a Bunsen safely, adjust the air hole for a blue flame, and never pipette by mouth.",
    taskKind: "handling",
  },
  {
    id: "assemble",
    title: "Assembling set-ups",
    theory: "Build each standard layout with the correct apparatus in a safe order.",
    taskKind: "assemble",
  },
  {
    id: "cleanup",
    title: "Clean-up",
    theory: "Turn off gas, tidy the bench, and wash glassware before you leave.",
    taskKind: "checklist",
  },
  {
    id: "assessment",
    title: "Final check",
    theory: "Build the titration set-up your teacher requests with no hints.",
    taskKind: "assemble-final",
    setupTarget: "titration",
  },
];

export const ASSEMBLE_SEQUENCE: Array<"titration" | "filtration"> = ["titration", "filtration"];

export function stageByIndex(index: number): GuidedStage {
  return GUIDED_STAGES[Math.min(Math.max(index, 0), GUIDED_STAGES.length - 1)]!;
}

export type GuidedStepStateSlice = {
  mode: "guided" | "explore";
  guidedStageIndex: number;
  guidedStepIndex: number;
  hintLevel: number;
  safetyTasks: Task[];
  identifyTasks: Task[];
  identifyPromptId: string | null;
  partStates: ApparatusPartStates;
  setupId: "titration" | "filtration" | null;
  items?: Apparatus[];
  stageComplete?: boolean;
  celebrationMessage?: string | null;
};

const PRAISE = ["Good job!", "Well done!", "Excellent work!", "Nicely done!", "Brilliant!"] as const;

export function identifyTargetForStepIndex(slice: GuidedStepStateSlice, stepIndex: number): string | null {
  const task = slice.identifyTasks[stepIndex];
  return task?.type === "choice" && task.image ? task.image : null;
}

function nextStageTeaser(next: GuidedStage): string {
  switch (next.id) {
    case "identify":
      return "Next up: Apparatus identification — I will point you to each item on the shelves.";
    case "reading":
      return "Next up: reading burettes and cylinders at eye level.";
    case "handling":
      return "Next up: lighting the Bunsen burner safely.";
    case "assemble":
      return "Next up: building titration and filtration set-ups on the bench.";
    case "cleanup":
      return "Next up: tidying the bench before you leave.";
    case "assessment":
      return "Next up: a final titration check without hints.";
    default:
      return `Next up: ${next.title}.`;
  }
}

export function stageCelebrationMessage(slice: GuidedStepStateSlice & { guidedStageIndex: number }): string {
  const stage = stageByIndex(slice.guidedStageIndex);
  const praise = PRAISE[slice.guidedStageIndex % PRAISE.length]!;
  const next = GUIDED_STAGES[slice.guidedStageIndex + 1];
  if (!next) {
    return `${praise} You completed the whole guided laboratory.`;
  }
  return `${praise} You finished ${stage.title}. ${nextStageTeaser(next)}`;
}

export function safetyChoiceTasks(tasks: Task[]): Task[] {
  return tasks.filter((t): t is Task & { type: "choice" } => t.type === "choice" && t.safety);
}

export function identifyChoiceTasks(tasks: Task[]): Task[] {
  return tasks.filter((t): t is Task & { type: "choice"; image: string } => t.type === "choice" && Boolean(t.image) && !t.safety);
}

export function stepsInStage(stage: GuidedStage, slice: GuidedStepStateSlice): number {
  switch (stage.id) {
    case "safety":
      return Math.max(1, slice.safetyTasks.length);
    case "identify":
      return Math.max(1, Math.min(5, slice.identifyTasks.length));
    case "reading":
    case "handling":
    case "cleanup":
      return 1;
    case "assemble":
      return ASSEMBLE_SEQUENCE.length;
    case "assessment":
      return 1;
    default:
      return 1;
  }
}

function choiceOptionText(task: Task & { type: "choice" }, answerId: string): string {
  return task.options.find((o) => o.id === answerId)?.text ?? answerId;
}

export function resolveGuidedStep(stage: GuidedStage, slice: GuidedStepStateSlice): GuidedStepView | null {
  if (slice.mode !== "guided") return null;
  const stepTotal = stepsInStage(stage, slice);
  const stepIndex = Math.min(slice.guidedStepIndex, stepTotal - 1);

  if (stage.id === "safety") {
    const task = slice.safetyTasks[stepIndex];
    if (!task || task.type !== "choice") {
      return {
        stepIndex,
        stepTotal,
        title: "Safety briefing",
        hint0: "Answer each safety question in the card.",
        hint1: "Read every option before you choose.",
        hint2: "Pick the option that matches standard laboratory practice.",
        answerReveal: null,
        primaryAction: { kind: "choice" },
        highlightIds: [],
      };
    }
    return {
      stepIndex,
      stepTotal,
      title: task.prompt.slice(0, 72),
      hint0: task.hint ?? "Choose the safest correct answer.",
      hint1: "Eliminate options that would cause injury or damage.",
      hint2: task.explain,
      answerReveal: choiceOptionText(task, task.answer),
      primaryAction: { kind: "choice" },
      highlightIds: task.image ? [task.image] : [],
    };
  }

  if (stage.id === "identify") {
    const task = slice.identifyTasks[stepIndex];
    const apparatusId = task?.type === "choice" && task.image ? task.image : "burette";
    const apparatus = slice.items?.find((i) => i.id === apparatusId);
    const name = apparatus?.name ?? apparatusId.replace(/-/g, " ");
    return {
      stepIndex,
      stepTotal,
      title: task?.type === "choice" ? task.prompt : "Find the apparatus",
      hint0: task?.type === "choice" ? `${task.prompt} Find the ${name} on the shelves.` : `Find the ${name}.`,
      hint1: `${name}: ${apparatus?.use ?? "Check the shape and size on the storeroom shelves."}`,
      hint2: task?.type === "choice" ? task.explain : `Select the ${name} and submit.`,
      answerReveal: name,
      primaryAction: { kind: "identify", apparatusId },
      highlightIds: [apparatusId],
    };
  }

  if (stage.id === "reading") {
    return {
      stepIndex: 0,
      stepTotal: 1,
      title: "Read at eye level",
      hint0: "Pick an instrument, set eye level, then choose the correct reading.",
      hint1: "Move your viewpoint to eye level before you record the meniscus.",
      hint2: "Parallax error happens when your eye is above or below the scale.",
      answerReveal: null,
      primaryAction: { kind: "reading" },
      highlightIds: ["burette", "pipette", "measuring-cylinder"],
    };
  }

  if (stage.id === "handling") {
    return {
      stepIndex: 0,
      stepTotal: 1,
      title: "Bunsen burner",
      hint0: "Select the Bunsen, place it on the bench, light it and open the air hole.",
      hint1: "Use the part controls when the Bunsen is on the bench.",
      hint2: "A safe working flame is blue and non-luminous with the air hole open.",
      answerReveal: null,
      primaryAction: { kind: "handling-bunsen" },
      highlightIds: ["bunsen-burner"],
    };
  }

  if (stage.id === "assemble") {
    const setupId = ASSEMBLE_SEQUENCE[stepIndex] ?? "titration";
    return {
      stepIndex,
      stepTotal,
      title: setupId === "titration" ? "Titration set-up" : "Filtration set-up",
      hint0: `Start the ${setupId} set-up and place every required item on the bench.`,
      hint1: "Check the guide for each item if you are unsure.",
      hint2: "When the bench matches the list, press Check set-up.",
      answerReveal: null,
      primaryAction: { kind: "assemble", setupId },
      highlightIds: [],
    };
  }

  if (stage.id === "cleanup") {
    return {
      stepIndex: 0,
      stepTotal: 1,
      title: "Tidy the bench",
      hint0: "Clear the bench, then confirm it is tidy.",
      hint1: "Turn off gas and return glassware to the shelves.",
      hint2: "A clean bench prevents spills and mix-ups.",
      answerReveal: null,
      primaryAction: { kind: "cleanup" },
      highlightIds: [],
    };
  }

  if (stage.id === "assessment") {
    return {
      stepIndex: 0,
      stepTotal: 1,
      title: "Final titration check",
      hint0: "Build the titration set-up without hints, then check it.",
      hint1: "You need the stand, burette, flask and white tile.",
      hint2: "Read each apparatus guide below if you need a reminder.",
      answerReveal: null,
      primaryAction: { kind: "assemble-final", setupId: "titration" },
      highlightIds: [],
    };
  }

  return null;
}

export function teacherMessageFromStep(step: GuidedStepView, hintLevel: number, slice?: GuidedStepStateSlice): string {
  if (step.primaryAction.kind === "identify" && slice) {
    const targetId = slice.identifyPromptId ?? step.primaryAction.apparatusId;
    const apparatus = slice.items?.find((i) => i.id === targetId);
    const name = apparatus?.name ?? targetId.replace(/-/g, " ");
    if (hintLevel >= 2) return step.hint2;
    if (hintLevel === 1) return step.hint1;
    return `${step.title} Click the ${name} in the room, or select it and press Submit.`;
  }
  if (hintLevel >= 2) return step.hint2;
  if (hintLevel === 1) return step.hint1;
  return step.hint0;
}

export function guidedTeacherMessage(state: GuidedStepStateSlice & { items: Apparatus[]; guidedStageIndex: number; mode: "guided" | "explore" }): string {
  if (state.mode !== "guided") return "";
  if (state.stageComplete || state.celebrationMessage) {
    const base = state.celebrationMessage || stageCelebrationMessage(state);
    const next = GUIDED_STAGES[state.guidedStageIndex + 1];
    return next ? `${base} Click me to start the next stage.` : `${base} Click me to see your summary.`;
  }
  const stage = stageByIndex(state.guidedStageIndex);
  const step = resolveGuidedStep(stage, { ...state, items: state.items });
  if (!step) return "Answer on the bench note, or click me for a hint.";
  const message = teacherMessageFromStep(step, state.hintLevel, { ...state, items: state.items });
  const needsNote = step.primaryAction.kind === "choice";
  if (state.hintLevel >= 2) return needsNote ? `${message} Answer on the bench note.` : message;
  if (state.hintLevel === 1) return `${message} Click me once more for the last hint.`;
  return `${message} Click me for a stronger hint.`;
}

export function highlightIdsForStep(
  step: GuidedStepView | null,
  hintLevel: number,
  ctx?: { identifyPromptId?: string | null },
): string[] {
  if (!step) return [];
  if (step.primaryAction.kind === "identify" && ctx?.identifyPromptId) return step.highlightIds;
  if (hintLevel >= 1) return step.highlightIds;
  return [];
}

export type GuidedPointerView = {
  apparatusId: string | null;
  label: string;
  atBench?: boolean;
};

/**
 * Resolves the in-room pointer for every guided action that does not need the
 * bench note to answer a question. Question steps (safety choices) return null
 * and stay in the note.
 */
export function guidedPointerFor(
  state: GuidedStepStateSlice & {
    bench: string[];
    readingTarget?: "burette" | "pipette" | "measuring-cylinder" | null;
  },
  step: GuidedStepView | null,
): GuidedPointerView | null {
  if (!step) return null;
  const nameOf = (id: string) => state.items?.find((entry) => entry.id === id)?.name ?? id.replace(/-/g, " ");
  const action = step.primaryAction;

  switch (action.kind) {
    case "choice":
      return null;
    case "identify":
      return { apparatusId: action.apparatusId, label: `Click the ${nameOf(action.apparatusId)}` };
    case "reading": {
      const target = state.readingTarget ?? "burette";
      return {
        apparatusId: target,
        label: state.readingTarget ? `Read the ${nameOf(target)} at eye level` : "Choose an instrument, then read at eye level",
      };
    }
    case "handling-bunsen":
      return {
        apparatusId: "bunsen-burner",
        label: state.bench.includes("bunsen-burner") ? "Light it and open the air hole" : "Drag the Bunsen burner to the bench",
      };
    case "assemble":
    case "assemble-final": {
      const required = APPARATUS_SETUP_DEFINITIONS[action.setupId].required;
      const missing = required.find((id) => !state.bench.includes(id));
      if (missing) return { apparatusId: missing, label: `Drag the ${nameOf(missing)} to the bench` };
      if (state.bench.some((id) => !required.includes(id))) {
        return { apparatusId: null, atBench: true, label: "Remove extra apparatus, then check the set-up" };
      }
      return { apparatusId: null, atBench: true, label: "Check the set-up on the bench" };
    }
    case "cleanup":
      return { apparatusId: null, atBench: true, label: "Clear the bench and tidy up" };
    default:
      return null;
  }
}
