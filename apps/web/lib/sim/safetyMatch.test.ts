import { describe, expect, it } from "vitest";
import { matchSafety } from "./simulationTypes";

describe("safety match", () => {
  it("returns the pipette-by-mouth rule", () => {
    const hit = matchSafety("pipette_by_mouth", [
      { id: "pipette-mouth", pattern: "pipette_by_mouth", message: "Never pipette by mouth.", severity: "error", safeProcedure: "Use a filler." },
    ]);
    expect(hit?.ruleId).toBe("pipette-mouth");
    expect(hit?.safeProcedure).toBe("Use a filler.");
  });
});
