import { describe, expect, it } from "vitest";
import { createTitrationState, reduceTitration, titrationSummary, buretteReading } from "./titrationStore";

const rules = [{ id: "pipette-mouth", pattern: "pipette_by_mouth", message: "Never pipette by mouth.", severity: "error" as const, safeProcedure: "Use a filler." }];

function runToEndpoint(seed = 1) {
  let state = createTitrationState("regular", seed, 25);
  state = reduceTitration(state, { type: "rinse" }, rules).state;
  state = reduceTitration(state, { type: "fill" }, rules).state;
  state = reduceTitration(state, { type: "removeBubble" }, rules).state;
  state = reduceTitration(state, { type: "recordInitial" }, rules).state;
  state = reduceTitration(state, { type: "pipette", method: "filler" }, rules).state;
  state = reduceTitration(state, { type: "addIndicator" }, rules).state;
  state = reduceTitration(state, { type: "addIndicator" }, rules).state;
  state = reduceTitration(state, { type: "swirl" }, rules).state;
  state = reduceTitration(state, { type: "deliver", cm3: 25 }, rules).state;
  return state;
}

describe("titration simulation", () => {
  it("is deterministic", () => {
    const a = runToEndpoint(4);
    const b = runToEndpoint(4);
    expect(a.deliveredToFlask).toBe(b.deliveredToFlask);
    expect(buretteReading(a)).toBe(buretteReading(b));
  });

  it("reaches the 25.00 cm3 equivalence for 0.10 mol dm-3 HCl and NaOH", () => {
    const state = runToEndpoint();
    expect(buretteReading(state)).toBe(25);
    const done = reduceTitration(state, { type: "recordFinal" }, rules).state;
    expect(done.rows[0].titre).toBe(25);
    expect(done.rows[0].trueDelivered).toBe(25);
  });

  it("does not transfer base when the pipette is used by mouth", () => {
    let state = createTitrationState("regular", 1, 25);
    const step = reduceTitration(state, { type: "pipette", method: "mouth" }, rules);
    expect(step.safetyEvents[0]?.ruleId).toBe("pipette-mouth");
    expect(step.state.baseInFlask).toBe(false);
    expect(step.state.criticalSafetyOpen).toBe(true);
  });

  it("shifts the recorded reading when the eye is above the meniscus", () => {
    let state = createTitrationState("regular", 1, 25);
    state = reduceTitration(state, { type: "rinse" }, rules).state;
    state = reduceTitration(state, { type: "fill" }, rules).state;
    state = reduceTitration(state, { type: "setView", view: "above" }, rules).state;
    state = reduceTitration(state, { type: "recordInitial" }, rules).state;
    expect(state.initialRecorded).toBe(0.1);
  });

  it("counts an air bubble in the burette reading but not in the flask", () => {
    let state = createTitrationState("regular", 1, 25);
    state = reduceTitration(state, { type: "rinse" }, rules).state;
    state = reduceTitration(state, { type: "fill" }, rules).state;
    state = reduceTitration(state, { type: "recordInitial" }, rules).state;
    state = reduceTitration(state, { type: "pipette", method: "filler" }, rules).state;
    state = reduceTitration(state, { type: "deliver", cm3: 25 }, rules).state;
    expect(state.deliveredToFlask).toBe(25);
    expect(buretteReading(state)).toBe(25.2);
  });

  it("averages concordant titres", () => {
    let state = runToEndpoint();
    state = reduceTitration(state, { type: "recordFinal" }, rules).state;
    state = reduceTitration(state, { type: "nextTrial" }, rules).state;
    state = reduceTitration(state, { type: "removeBubble" }, rules).state;
    state = reduceTitration(state, { type: "recordInitial" }, rules).state;
    state = reduceTitration(state, { type: "pipette", method: "filler" }, rules).state;
    state = reduceTitration(state, { type: "swirl" }, rules).state;
    state = reduceTitration(state, { type: "deliver", cm3: 25 }, rules).state;
    state = reduceTitration(state, { type: "recordFinal" }, rules).state;
    const summary = titrationSummary(state);
    expect(summary.average).toBe(25);
    expect(summary.calculation?.baseConc).toBeCloseTo(0.1, 5);
  });
});
