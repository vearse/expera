import { describe, expect, it } from "vitest";
import { loadQual } from "@/lib/content/load";
import { distinguishable, inferenceOptions, observe } from "./qual";

const data = loadQual();

describe("qualitative analysis engine", () => {
  it("Cu2+ gives a deep blue solution with excess NH3(aq)", () => {
    expect(observe(data, "cuso4", "nh3-excess")[0].observation).toMatch(/deep blue/);
  });

  it("Zn2+ and Al3+ both dissolve in excess NaOH, but only Zn2+ dissolves in excess NH3", () => {
    expect(observe(data, "znso4", "naoh-excess")[0].observation).toMatch(/dissolves/);
    expect(observe(data, "al2so4", "naoh-excess")[0].observation).toMatch(/dissolves/);
    expect(observe(data, "znso4", "nh3-excess")[0].observation).toMatch(/dissolves/);
    expect(observe(data, "al2so4", "nh3-excess")[0].observation).toMatch(/insoluble/);
  });

  it("NH4+ gives ammonia on warming with NaOH", () => {
    expect(observe(data, "nh4cl", "naoh-warm")[0].inference).toMatch(/NH4\+/);
    expect(observe(data, "kno3", "naoh-warm")[0].observation).toBe("No gas evolved");
  });

  it("Pb2+ interferes with the BaCl2 test", () => {
    const obs = observe(data, "pbno3", "bacl2");
    expect(obs).toHaveLength(1);
    expect(obs[0].inference).toMatch(/Pb2\+/);
  });

  it("tests with no reaction return the no-change result", () => {
    expect(observe(data, "kno3", "agno3")[0].inference).toBe("Cl- absent");
  });

  it("every salt in the pool can be identified from the tests", () => {
    expect(distinguishable(data).sort()).toEqual(data.salts.map((s) => s.id).sort());
  });

  it("offers every correct inference in the picker", () => {
    const options = new Set(inferenceOptions(data));
    for (const s of data.salts) for (const t of data.tests) for (const o of observe(data, s.id, t.id)) expect(options.has(o.inference)).toBe(true);
  });
});
