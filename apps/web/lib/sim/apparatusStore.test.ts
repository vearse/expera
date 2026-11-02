import { describe, expect, it } from "vitest";
import { createApparatusState, reduceApparatus } from "./apparatusStore";
import type { Apparatus, Task } from "@/lib/content/schemas";

const items: Apparatus[] = [
  { id: "burette", name: "Burette", use: "Delivers a variable volume.", review: "NEEDS_TEACHER_REVIEW" },
  { id: "beaker", name: "Beaker", use: "Holds liquid.", review: "NEEDS_TEACHER_REVIEW" },
  { id: "filter-funnel", name: "Filter funnel", use: "Holds filter paper.", review: "NEEDS_TEACHER_REVIEW" },
  { id: "retort-stand", name: "Retort stand and clamp", use: "Holds the burette.", review: "NEEDS_TEACHER_REVIEW" },
  { id: "conical-flask", name: "Conical flask", use: "Holds the titration mixture.", review: "NEEDS_TEACHER_REVIEW" },
  { id: "white-tile", name: "White tile", use: "Shows the colour change.", review: "NEEDS_TEACHER_REVIEW" },
];

const safetyTask: Task = {
  id: "label-corrosive",
  type: "choice",
  safety: true,
  prompt: "Corrosive label?",
  options: [
    { id: "a", text: "Corrosive" },
    { id: "b", text: "Flammable" },
  ],
  answer: "a",
  explain: "Acids are corrosive.",
};

describe("apparatus simulation", () => {
  it("rejects an incomplete titration setup", () => {
    let state = createApparatusState(items);
    state = reduceApparatus(state, { type: "startSetup", id: "titration" }).state;
    state = reduceApparatus({ ...state, selectedId: "burette" }, { type: "toBench" }).state;
    const checked = reduceApparatus(state, { type: "checkSetup" });
    expect(checked.state.setupFeedback).toMatch(/Still needed/);
    expect(checked.events).toHaveLength(0);
  });

  it("reorders bench items while keeping the same set", () => {
    let state = createApparatusState(items);
    state = reduceApparatus({ ...state, selectedId: "burette" }, { type: "toBench" }).state;
    state = reduceApparatus({ ...state, selectedId: "beaker" }, { type: "toBench" }).state;
    state = reduceApparatus(state, { type: "reorderBench", ids: ["beaker", "burette"] }).state;
    expect(state.bench).toEqual(["beaker", "burette"]);
    const ignored = reduceApparatus(state, { type: "reorderBench", ids: ["beaker"] }).state;
    expect(ignored.bench).toEqual(["beaker", "burette"]);
  });

  it("accepts the full filtration setup", () => {
    let state = createApparatusState(items);
    state = reduceApparatus(state, { type: "startSetup", id: "filtration" }).state;
    state = reduceApparatus({ ...state, selectedId: "filter-funnel" }, { type: "toBench" }).state;
    state = reduceApparatus({ ...state, selectedId: "beaker" }, { type: "toBench" }).state;
    const checked = reduceApparatus(state, { type: "checkSetup" });
    expect(checked.events[0]?.xp).toBe(10);
  });

  it("escalates guided hints without advancing the step", () => {
    let state = createApparatusState(items, "guided", [safetyTask]);
    state = reduceApparatus(state, { type: "requestHint" }).state;
    expect(state.hintLevel).toBe(1);
    expect(state.guidedStepIndex).toBe(0);
  });

  it("advances safety substep on a correct choice", () => {
    let state = createApparatusState(items, "guided", [safetyTask, { ...safetyTask, id: "label-flammable", answer: "b" }]);
    state = reduceApparatus(state, { type: "answerChoice", taskId: safetyTask.id, optionId: "a" }).state;
    expect(state.guidedStepIndex).toBe(1);
  });
});
