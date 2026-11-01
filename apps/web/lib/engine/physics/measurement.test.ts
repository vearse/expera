import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadPhysics } from "@/lib/content/physics";
import {
  absoluteError,
  densityFromMassVolume,
  formatDensity,
  liquidDensity,
  metreRuleReading,
  micrometerReading,
  parallaxReading,
  percentageError,
  percentageUncertainty,
  readingWithin,
  roundTo,
  solidDensity,
  solidVolumeCm3,
  stopwatchReading,
  vernierReading,
} from "./measurement";

const data = loadPhysics();
const { vernier, micrometer, metreRule, stopwatch, parallax } = data.instruments;

describe("Vernier calipers", () => {
  it("reads 2.34 cm from a 23 mm main scale and the 4th Vernier division", () => {
    const reading = vernierReading(23.4, vernier);
    expect(reading.mainScaleMm).toBe(23);
    expect(reading.vernierDivision).toBe(4);
    expect(reading.observedMm).toBeCloseTo(23.4, 8);
    expect(reading.displayCm).toBeCloseTo(2.34, 8);
  });

  it("subtracts a positive zero error", () => {
    const reading = vernierReading(23.4, { ...vernier, zeroErrorMm: 0.1 });
    expect(reading.observedMm).toBeCloseTo(23.5, 8);
    expect(reading.correctedMm).toBeCloseTo(23.4, 8);
  });

  it("always keeps the Vernier division inside the scale", () => {
    for (let gap = 0; gap <= 120; gap += 0.1) {
      const reading = vernierReading(gap, vernier);
      expect(reading.vernierDivision).toBeGreaterThanOrEqual(0);
      expect(reading.vernierDivision).toBeLessThan(vernier.vernierDivisions);
      expect(reading.mainScaleMm).toBeLessThanOrEqual(reading.observedMm + 1e-9);
      expect(reading.observedMm).toBeCloseTo(gap, 8);
    }
  });
});

describe("micrometer screw gauge", () => {
  it("reads 5.78 mm and corrects +0.02 mm zero error to 5.76 mm", () => {
    expect(micrometer.zeroErrorMm).toBeCloseTo(0.02, 8);
    const reading = micrometerReading(5.76, micrometer);
    expect(reading.sleeveMm).toBeCloseTo(5.5, 8);
    expect(reading.thimbleDivision).toBe(28);
    expect(reading.observedMm).toBeCloseTo(5.78, 8);
    expect(reading.correctedMm).toBeCloseTo(5.76, 8);
  });

  it("handles a thimble reading that rolls over to the next sleeve mark", () => {
    const reading = micrometerReading(5.995, micrometer);
    expect(reading.observedMm).toBeCloseTo(6.02, 8);
    expect(reading.sleeveMm).toBeCloseTo(6, 8);
    expect(reading.thimbleDivision).toBe(2);
  });

  it("returns a stable corrected reading for random spindle positions", () => {
    for (const gap of [0, 0.01, 0.37, 2.5, 7.89, 12.34, 24.99]) {
      const reading = micrometerReading(gap, micrometer);
      expect(reading.correctedMm).toBeCloseTo(gap, 2);
      expect(reading.observedMm).toBeCloseTo(roundTo(gap + micrometer.zeroErrorMm, micrometer.leastCountMm), 8);
    }
  });
});

describe("metre rule and stopwatch", () => {
  it("uses end mark minus start mark with a damaged zero end", () => {
    const reading = metreRuleReading(2, 14.3, metreRule);
    expect(reading.lengthCm).toBeCloseTo(12.3, 8);
    expect(reading.lengthMm).toBeCloseTo(123, 8);
    expect(reading.wornZero).toBe(true);
  });

  it("clamps rule readings to the length of the rule", () => {
    const reading = metreRuleReading(-4, 150, metreRule);
    expect(reading.startCm).toBe(0);
    expect(reading.endCm).toBe(100);
    expect(reading.lengthCm).toBe(100);
  });

  it("formats a stopwatch to hundredths of a second", () => {
    expect(stopwatchReading(0, stopwatch).display).toBe("0.00");
    expect(stopwatchReading(4200, stopwatch).display).toBe("4.20");
    expect(stopwatchReading(1236, stopwatch).display).toBe("1.24");
  });
});

describe("parallax", () => {
  it("shifts the apparent reading and marks only a level eye as aligned", () => {
    const shifted = parallaxReading(48, 5, parallax);
    expect(shifted.shiftMm).toBeCloseTo(0.9, 8);
    expect(shifted.observedMm).toBeCloseTo(48.9, 8);
    expect(shifted.aligned).toBe(false);

    const level = parallaxReading(48, 0, parallax);
    expect(level.shiftMm).toBe(0);
    expect(level.aligned).toBe(true);
  });
});

describe("density and errors", () => {
  it("calculates 54 g / 20 cm3 = 2.7 g/cm3 = 2700 kg/m3", () => {
    const density = densityFromMassVolume(54, 20);
    expect(density.densityGCm3).toBeCloseTo(2.7, 8);
    expect(density.densityKgM3).toBeCloseTo(2700, 8);
    expect(formatDensity(density.densityGCm3)).toBe("2.70 g/cm3 (2700 kg/m3)");
  });

  it("calculates solid density from measured dimensions", () => {
    expect(solidVolumeCm3(20, 63.7)).toBeCloseTo(20.012, 3);
    const density = solidDensity(data.samples.solid, 20, 63.7, 54);
    expect(density.densityGCm3).toBeCloseTo(2.7, 2);
  });

  it("calculates liquid density from mass difference and volume", () => {
    const density = liquidDensity(data.samples.liquid, 48.2, 98.6, 40);
    expect(density.liquidMassG).toBeCloseTo(50.4, 8);
    expect(density.densityGCm3).toBeCloseTo(1.26, 8);
    expect(density.densityKgM3).toBeCloseTo(1260, 8);
  });

  it("calculates absolute and percentage error", () => {
    expect(absoluteError(4.8, 5)).toBeCloseTo(0.2, 8);
    expect(percentageError(4.8, 5)).toBeCloseTo(4, 8);
    expect(percentageUncertainty(0.05, 2.5)).toBeCloseTo(2, 8);
  });

  it("handles zero accepted values without dividing by zero", () => {
    expect(percentageError(4, 0)).toBe(0);
    expect(percentageUncertainty(0.1, 0)).toBe(0);
  });
});

describe("determinism and precision", () => {
  it("rounds mechanically to the requested instrument resolution", () => {
    expect(roundTo(12.349, 0.1)).toBeCloseTo(12.3, 8);
    expect(roundTo(12.351, 0.1)).toBeCloseTo(12.4, 8);
    expect(roundTo(0.025, 0.01)).toBeCloseTo(0.03, 8);
  });

  it("produces identical readings for identical mechanical states", () => {
    const first = vernierReading(31.7, vernier);
    const second = vernierReading(31.7, vernier);
    expect(second).toEqual(first);
    expect(readingWithin(first.observedMm, 31.7, 0.05)).toBe(true);
  });

  it("keeps the engine free of React, Three, Next and Zustand imports", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "lib/engine/physics/measurement.ts"), "utf8");
    expect(source).not.toMatch(/from\s+["'](?:react|three|next|zustand|@react-three)/);
    expect(source).not.toMatch(/from\s+["'][^"']*components\//);
  });
});
