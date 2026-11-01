import { describe, expect, it } from "vitest";
import { loadElements } from "@/lib/content/load";
import { trendScale, trendColour } from "./trends";

describe("trends", () => {
  const els = loadElements().elements;
  it("scales atomic radius", () => {
    const s = trendScale(els, "atomicRadius");
    expect(s).not.toBeNull();
    expect(trendColour(100, s!)).toMatch(/^#/);
  });
});
