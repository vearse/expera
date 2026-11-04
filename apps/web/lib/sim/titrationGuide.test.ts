import { describe, expect, it } from "vitest";
import { actionList, currentGuidedStep, targetKey } from "./guidedSimulation";
import { TITRATION_GUIDED_STEPS, TITRATION_INTERACTION_POINTS } from "./titrationGuide";
import { createTitrationState, reduceTitration, type TitrationAction, type TitrationState } from "./titrationStore";

function runGuidedTitration(trials = 4) {
  let state: TitrationState = createTitrationState("regular", 1, 25);
  let armed: string[] = [];
  let lastStepId = "";
  const visited: string[] = [];

  for (let guard = 0; guard < 800; guard += 1) {
    const current = currentGuidedStep(TITRATION_GUIDED_STEPS, state);
    if (!current) break;
    const step = current.step;
    if (step.id !== lastStepId) {
      armed = [];
      lastStepId = step.id;
      visited.push(step.id);
    }

    if (step.id === "record-initial") {
      state = reduceTitration(state, { type: "recordInitial" }).state;
      continue;
    }
    if (step.id === "record-final") {
      state = reduceTitration(state, { type: "recordFinal" }).state;
      continue;
    }
    if (step.id === "next-trial") {
      if (state.rows.length >= trials) break;
      state = reduceTitration(state, { type: "nextTrial" }).state;
      continue;
    }

    const targets = step.targets ?? [];
    const target = targets.find((entry) => !armed.includes(targetKey(entry)));
    expect(target, `no remaining target for ${step.id}`).toBeTruthy();
    for (const action of actionList(target!.action)) {
      state = reduceTitration(state, action as TitrationAction).state;
    }
    if (!step.repeat) armed.push(targetKey(target!));
  }

  return { state, visited };
}

describe("titration guided steps", () => {
  it("starts by rinsing the burette", () => {
    const state = createTitrationState("regular", 1, 25);
    const current = currentGuidedStep(TITRATION_GUIDED_STEPS, state);
    expect(current?.step.id).toBe("rinse-burette");
  });

  it("keeps every hotspot clickable without another hotspot covering it", () => {
    const points = Object.entries(TITRATION_INTERACTION_POINTS);
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const [keyA, a] = points[i]!;
        const [keyB, b] = points[j]!;
        const dx = a.position[0] - b.position[0];
        const dy = a.position[1] - b.position[1];
        const dz = a.position[2] - b.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        expect(distance, `${keyA} overlaps ${keyB}`).toBeGreaterThan(a.radius + b.radius);
      }
    }
  });

  it("gives every target a short pointer label", () => {
    for (const step of TITRATION_GUIDED_STEPS) {
      for (const target of step.targets ?? []) {
        expect(target.pointerLabel ?? step.pointerLabel, `${step.id} has no pointer label`).toBeTruthy();
      }
    }
  });

  it("walks the apparatus sequence to four recorded titres", () => {
    const { state, visited } = runGuidedTitration(4);
    expect(visited).toContain("add-indicator");
    expect(visited).toContain("fine-end-point");
    expect(visited).toContain("record-final");
    expect(state.finished).toBe(true);
    expect(state.rows).toHaveLength(4);
    for (const row of state.rows) expect(row.titre).toBeGreaterThan(24.8);
  });
});
