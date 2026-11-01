import { createRng, roundTo } from "./rng";
import { strongMixPH } from "./ph";

/** aA + bB -> products. Acid in the burette, base in the conical flask. */
export type Reaction = {
  id: string;
  acid: { name: string; formula: string; hPerFormula: number };
  base: { name: string; formula: string; ohPerFormula: number; molarMass: number };
  a: number;
  b: number;
  equation: string;
};

/** Molar masses use WAEC rounded values: Na 23, O 16, H 1. */
export const REACTIONS: Record<string, Reaction> = {
  "hcl-naoh": {
    id: "hcl-naoh",
    acid: { name: "hydrochloric acid", formula: "HCl", hPerFormula: 1 },
    base: { name: "sodium hydroxide", formula: "NaOH", ohPerFormula: 1, molarMass: 40 },
    a: 1,
    b: 1,
    equation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H2O(l)",
  },
  "h2so4-naoh": {
    id: "h2so4-naoh",
    acid: { name: "tetraoxosulphate(VI) acid", formula: "H2SO4", hPerFormula: 2 },
    base: { name: "sodium hydroxide", formula: "NaOH", ohPerFormula: 1, molarMass: 40 },
    a: 1,
    b: 2,
    equation: "H2SO4(aq) + 2NaOH(aq) → Na2SO4(aq) + 2H2O(l)",
  },
};

export type TitrationProblem = {
  reaction: Reaction;
  acidConc: number; // mol dm-3, given to the student
  baseConc: number; // mol dm-3, hidden in Exam Prep
  pipetteVolume: number; // nominal cm3
};

export type Trial = {
  label: string;
  initialLevel: number; // true burette level before titrating, cm3
  pipetteActual: number; // true volume delivered by the pipette this trial
};

export function equivalenceVolume(p: TitrationProblem, pipetteCm3 = p.pipetteVolume): number {
  const molBase = (p.baseConc * pipetteCm3) / 1000;
  const molAcid = (molBase * p.reaction.a) / p.reaction.b;
  return (molAcid * 1000) / p.acidConc;
}

/** pH of the flask after `acidCm3` of acid has been run in. */
export function flaskPH(p: TitrationProblem, pipetteCm3: number, acidCm3: number): number {
  const molH = (p.acidConc * acidCm3 * p.reaction.acid.hPerFormula) / 1000;
  const molOH = (p.baseConc * pipetteCm3 * p.reaction.base.ohPerFormula) / 1000;
  return strongMixPH(molH, molOH, pipetteCm3 + acidCm3);
}

export function makeProblem(mode: "regular" | "exam", seed: number, pipetteVolume: number): { problem: TitrationProblem; trials: Trial[] } {
  const rng = createRng(seed);
  const labels = ["Rough", "1st", "2nd", "3rd"];
  if (mode === "regular") {
    return {
      problem: { reaction: REACTIONS["hcl-naoh"], acidConc: 0.1, baseConc: 0.1, pipetteVolume },
      trials: labels.map((label) => ({ label, initialLevel: 0, pipetteActual: pipetteVolume })),
    };
  }
  const reaction = rng.pick(Object.values(REACTIONS));
  const acidConc = reaction.id === "hcl-naoh" ? 0.1 : 0.05;
  const baseConc = roundTo(rng.range(0.08, 0.12), 0.001);
  // Exam Prep noise: burette not refilled exactly to zero, and a grade B 25 cm3 pipette tolerance (about ±0.06 cm3).
  const trials = labels.map((label) => ({
    label,
    initialLevel: roundTo(rng.range(0, 2), 0.01),
    pipetteActual: pipetteVolume + rng.range(-0.06, 0.06),
  }));
  return { problem: { reaction, acidConc, baseConc, pipetteVolume }, trials };
}

export function isValidReading(text: string, decimals: number): boolean {
  return new RegExp(`^\\d{1,2}\\.\\d{${decimals}}$`).test(text.trim());
}

export function readingIsAccurate(recorded: number, trueLevel: number, resolution: number): boolean {
  return Math.abs(recorded - trueLevel) <= resolution + 1e-9;
}

/** The largest set of accurate titres (not the rough) that agree within `tolerance`. */
export function concordantSet(titres: number[], tolerance: number): number[] {
  let best: number[] = [];
  for (let mask = 1; mask < 1 << titres.length; mask++) {
    const idx = titres.map((_, i) => i).filter((i) => mask & (1 << i));
    const vals = idx.map((i) => titres[i]);
    if (Math.max(...vals) - Math.min(...vals) <= tolerance + 1e-9 && idx.length > best.length) best = idx;
  }
  return best;
}

export function average(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export type Calculation = { molAcid: number; molBase: number; baseConc: number; baseMassConc: number };

/** WAEC-style calculation from the student's average titre. */
export function calculate(p: TitrationProblem, avgTitre: number): Calculation {
  const molAcid = (p.acidConc * avgTitre) / 1000;
  const molBase = (molAcid * p.reaction.b) / p.reaction.a;
  const baseConc = (molBase * 1000) / p.pipetteVolume;
  return { molAcid, molBase, baseConc, baseMassConc: baseConc * p.reaction.base.molarMass };
}

/** Within `pct` percent of the expected value. */
export function closeTo(value: number, expected: number, pct = 1) {
  return Math.abs(value - expected) <= Math.abs(expected) * (pct / 100) + 1e-12;
}
