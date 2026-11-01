import { describe, expect, it } from "vitest";
import { ionicFormula, isBalanced, molarMass, parseFormula, shellsUpTo20, valencyFromOuter } from "./formula";

const M = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, Ca: 40, Cu: 63.5 };

describe("formula engine", () => {
  it("parses brackets and hydrates", () => {
    expect(parseFormula("Al2(SO4)3")).toEqual({ Al: 2, S: 3, O: 12 });
    expect(parseFormula("(NH4)2SO4")).toEqual({ N: 2, H: 8, S: 1, O: 4 });
    expect(parseFormula("CuSO4·5H2O")).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
  });

  it("calculates molar masses with WAEC values", () => {
    expect(molarMass("NaOH", M)).toBe(40);
    expect(molarMass("NaCl", M)).toBe(58.5);
    expect(molarMass("CaCO3", M)).toBe(100);
    expect(molarMass("CuSO4·5H2O", M)).toBe(249.5);
    expect(molarMass("H2SO4", M)).toBe(98);
  });

  it("builds ionic formulae by balancing charges", () => {
    const al = { symbol: "Al", charge: 3, polyatomic: false };
    const so4 = { symbol: "SO4", charge: -2, polyatomic: true };
    const nh4 = { symbol: "NH4", charge: 1, polyatomic: true };
    const cl = { symbol: "Cl", charge: -1, polyatomic: false };
    const o = { symbol: "O", charge: -2, polyatomic: false };
    expect(ionicFormula(al, so4).formula).toBe("Al2(SO4)3");
    expect(ionicFormula(nh4, cl).formula).toBe("NH4Cl");
    expect(ionicFormula(nh4, so4).formula).toBe("(NH4)2SO4");
    expect(ionicFormula(al, o).formula).toBe("Al2O3");
    expect(ionicFormula({ symbol: "Mg", charge: 2, polyatomic: false }, o).formula).toBe("MgO");
  });

  it("checks balanced equations", () => {
    expect(isBalanced([{ formula: "H2", coefficient: 2 }, { formula: "O2", coefficient: 1 }], [{ formula: "H2O", coefficient: 2 }])).toBe(true);
    expect(isBalanced([{ formula: "H2", coefficient: 1 }, { formula: "O2", coefficient: 1 }], [{ formula: "H2O", coefficient: 1 }])).toBe(false);
    expect(isBalanced([{ formula: "H2", coefficient: 4 }, { formula: "O2", coefficient: 2 }], [{ formula: "H2O", coefficient: 4 }])).toBe(true);
  });

  it("gives SS electron arrangements and valencies", () => {
    expect(shellsUpTo20(11)).toEqual([2, 8, 1]);
    expect(shellsUpTo20(20)).toEqual([2, 8, 8, 2]);
    expect(valencyFromOuter(1, 3)).toBe(1);
    expect(valencyFromOuter(6, 2)).toBe(2);
    expect(valencyFromOuter(7, 3)).toBe(1);
    expect(valencyFromOuter(4, 2)).toBe(4);
    expect(valencyFromOuter(2, 1)).toBe(0);
    expect(valencyFromOuter(8, 3)).toBe(0);
  });
});
