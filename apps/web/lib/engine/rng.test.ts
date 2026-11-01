import { describe, expect, it } from "vitest";
import { createRng, roundTo } from "./rng";

describe("rng", () => {
  it("gives the same sequence for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect(Array.from({ length: 5 }, a.next)).toEqual(Array.from({ length: 5 }, b.next));
  });

  it("stays in [0, 1)", () => {
    const r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("rounds to burette resolution", () => {
    expect(roundTo(23.47, 0.05)).toBe(23.45);
    expect(roundTo(23.48, 0.05)).toBe(23.5);
    expect(roundTo(0.1 + 0.2, 0.05)).toBe(0.3);
  });
});
