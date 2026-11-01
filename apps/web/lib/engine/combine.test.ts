import { describe, expect, it } from "vitest";
import { combinePair } from "./combine";

const cations = [{ id: "na", symbol: "Na", charge: 1, name: "Sodium", polyatomic: false }];
const anions = [{ id: "cl", symbol: "Cl", charge: -1, name: "Chloride", polyatomic: false }];
const mols = new Set(["H2O"]);

describe("combine", () => {
  it("forms NaCl", () => {
    const r = combinePair(
      { kind: "cation", id: "na", symbol: "Na" },
      { kind: "anion", id: "cl", symbol: "Cl" },
      cations,
      anions,
      mols,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formula).toBe("NaCl");
  });
  it("rejects two anions", () => {
    const r = combinePair(
      { kind: "anion", id: "cl", symbol: "Cl" },
      { kind: "anion", id: "cl", symbol: "Cl" },
      cations,
      anions,
      mols,
    );
    expect(r.ok).toBe(false);
  });
});
