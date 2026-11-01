import { describe, expect, it } from "vitest";
import { REACTIONS, calculate, concordantSet, equivalenceVolume, flaskPH, isValidReading, makeProblem, readingIsAccurate } from "./titration";

const hcl = { reaction: REACTIONS["hcl-naoh"], acidConc: 0.1, baseConc: 0.1, pipetteVolume: 25 };
const h2so4 = { reaction: REACTIONS["h2so4-naoh"], acidConc: 0.05, baseConc: 0.1, pipetteVolume: 25 };

describe("titration engine", () => {
  it("equal concentrations of HCl and NaOH need equal volumes", () => {
    expect(equivalenceVolume(hcl)).toBeCloseTo(25, 10);
  });

  it("uses the 1:2 mole ratio for H2SO4 and NaOH", () => {
    // 25.0 cm3 of 0.100 mol dm-3 NaOH = 0.0025 mol, needs 0.00125 mol H2SO4 = 25.0 cm3 of 0.050 mol dm-3.
    expect(equivalenceVolume(h2so4)).toBeCloseTo(25, 10);
  });

  it("worked example: average titre 24.50 cm3 of 0.100 mol dm-3 HCl with 25.0 cm3 NaOH", () => {
    const c = calculate(hcl, 24.5);
    expect(c.molAcid).toBeCloseTo(0.00245, 10);
    expect(c.molBase).toBeCloseTo(0.00245, 10);
    expect(c.baseConc).toBeCloseTo(0.098, 10);
    expect(c.baseMassConc).toBeCloseTo(3.92, 10);
  });

  it("flask pH falls as acid is added and is 7 at equivalence", () => {
    let last = 14;
    for (let v = 0; v <= 30; v += 0.5) {
      const pH = flaskPH(hcl, 25, v);
      expect(pH).toBeLessThanOrEqual(last + 1e-9);
      last = pH;
    }
    expect(flaskPH(hcl, 25, 25)).toBe(7);
    expect(flaskPH(hcl, 25, 0)).toBeCloseTo(13, 5);
  });

  it("finds the concordant titres", () => {
    expect(concordantSet([24.5, 24.6, 25.1], 0.2)).toEqual([0, 1]);
    expect(concordantSet([24.5, 24.55, 24.6], 0.2)).toEqual([0, 1, 2]);
  });

  it("checks burette reading format and accuracy", () => {
    expect(isValidReading("23.45", 2)).toBe(true);
    expect(isValidReading("23.4", 2)).toBe(false);
    expect(readingIsAccurate(23.45, 23.47, 0.05)).toBe(true);
    expect(readingIsAccurate(23.3, 23.47, 0.05)).toBe(false);
  });

  it("same seed gives the same Exam Prep sample and readings", () => {
    expect(makeProblem("exam", 123, 25)).toEqual(makeProblem("exam", 123, 25));
    expect(makeProblem("exam", 123, 25)).not.toEqual(makeProblem("exam", 124, 25));
  });

  it("Exam Prep noise stays within realistic bounds", () => {
    for (let s = 0; s < 200; s++) {
      const { problem, trials } = makeProblem("exam", s, 25);
      expect(problem.baseConc).toBeGreaterThanOrEqual(0.08);
      expect(problem.baseConc).toBeLessThanOrEqual(0.12);
      for (const t of trials) {
        expect(Math.abs(t.pipetteActual - 25)).toBeLessThanOrEqual(0.06);
        expect(t.initialLevel).toBeGreaterThanOrEqual(0);
        expect(t.initialLevel + equivalenceVolume(problem, t.pipetteActual)).toBeLessThan(50);
      }
    }
  });
});
