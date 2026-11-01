import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadPendulum } from "@/lib/content/pendulum";
import {
  createPendulumMotion,
  formatStopwatch,
  gravityFromPeriodSquaredFit,
  lineOfBestFit,
  measureAngle,
  measureLength,
  measurePeriod,
  measuredOscillationTiming,
  pendulumEnergy,
  pendulumTension,
  periodSquared,
  reactionDelayS,
  simulatePendulum,
  smallAnglePeriod,
  stepPendulum,
  type PendulumPhysics,
} from "./pendulum";

const data = loadPendulum();
const bob = data.bobs.find((item) => item.id === data.defaultBobId)!;
const earth = data.gravityPresets.find((item) => item.id === "earth")!;
const moon = data.gravityPresets.find((item) => item.id === "moon")!;

function physics(overrides: Partial<PendulumPhysics> = {}): PendulumPhysics {
  return {
    effectiveLengthM: 1,
    gravityMS2: earth.accelerationMS2,
    bobMassKg: bob.massKg,
    bobRadiusM: bob.radiusM,
    dampingCoefficientS: data.damping.offCoefficient,
    timeStepS: data.timing.timeStepS,
    ...overrides,
  };
}

describe("pendulum numerical engine", () => {
  it("uses RK4 with a fixed step and integrates the nonlinear equation", () => {
    const config = physics();
    const motion = createPendulumMotion(5 * Math.PI / 180);
    const next = stepPendulum(motion, config, config.timeStepS);
    expect(next.timeS).toBeCloseTo(config.timeStepS, 12);
    expect(next.thetaRad).toBeLessThan(motion.thetaRad);
    expect(next.omegaRadS).toBeLessThan(0);
  });

  it("gives the known small-angle period for a 1 m Earth pendulum", () => {
    const result = measurePeriod(physics(), 2 * Math.PI / 180);
    expect(result.periodS).toBeCloseTo(2.006, 3);
    expect(result.periodS).toBeCloseTo(smallAnglePeriod(physics()), 2);
  });

  it("shows the real large-amplitude increase and not the small-angle approximation", () => {
    const small = measurePeriod(physics(), 5 * Math.PI / 180).periodS;
    const large = measurePeriod(physics(), 25 * Math.PI / 180).periodS;
    expect(large).toBeGreaterThan(small);
    expect((large - small) / small).toBeGreaterThan(0.01);
    expect(large).toBeCloseTo(2.03, 2);
  });

  it("scales as the square root of length when the amplitude is small", () => {
    const quarter = measurePeriod(physics({ effectiveLengthM: 0.25 }), 4 * Math.PI / 180).periodS;
    const full = measurePeriod(physics({ effectiveLengthM: 1 }), 4 * Math.PI / 180).periodS;
    expect(full / quarter).toBeCloseTo(2, 2);
  });

  it("is independent of bob mass", () => {
    const light = measurePeriod(physics({ bobMassKg: 0.02, bobRadiusM: 0.02 }), 5 * Math.PI / 180).periodS;
    const heavy = measurePeriod(physics({ bobMassKg: 0.5, bobRadiusM: 0.02 }), 5 * Math.PI / 180).periodS;
    expect(heavy).toBeCloseTo(light, 12);
  });

  it("changes period when gravity changes", () => {
    const earthPeriod = measurePeriod(physics(), 5 * Math.PI / 180).periodS;
    const moonPeriod = measurePeriod(physics({ gravityMS2: moon.accelerationMS2 }), 5 * Math.PI / 180).periodS;
    expect(moonPeriod / earthPeriod).toBeCloseTo(Math.sqrt(earth.accelerationMS2 / moon.accelerationMS2), 2);
  });

  it("converges as the fixed time step is reduced", () => {
    const coarse = measurePeriod(physics({ timeStepS: 1 / 120 }), 5 * Math.PI / 180).periodS;
    const fine = measurePeriod(physics({ timeStepS: 1 / 960 }), 5 * Math.PI / 180).periodS;
    expect(Math.abs(coarse - fine)).toBeLessThan(2e-6);
  });

  it("conserves energy without damping", () => {
    const config = physics();
    let motion = createPendulumMotion(8 * Math.PI / 180);
    const initial = pendulumEnergy(motion, config).totalJ;
    for (let index = 0; index < 4800; index += 1) motion = stepPendulum(motion, config, config.timeStepS);
    const final = pendulumEnergy(motion, config).totalJ;
    expect(final).toBeCloseTo(initial, 9);
    expect(pendulumTension(motion, config)).toBeGreaterThan(0);
  });

  it("loses amplitude but keeps a nearly unchanged period when damping is on", () => {
    const config = physics({ dampingCoefficientS: 0.12 });
    const samples = simulatePendulum(config, 18 * Math.PI / 180, 20, 0.05);
    const peaks = samples
      .filter((sample, index) => index > 0 && index < samples.length - 1)
      .filter((sample) => sample.thetaRad > 0 && sample.thetaRad > samples[samples.indexOf(sample) - 1].thetaRad && sample.thetaRad >= samples[samples.indexOf(sample) + 1].thetaRad)
      .map((sample) => sample.thetaDeg);
    expect(peaks.length).toBeGreaterThan(4);
    for (let index = 1; index < Math.min(peaks.length, 6); index += 1) {
      expect(peaks[index]).toBeLessThan(peaks[index - 1]);
    }
    const dampedPeriod = measurePeriod(config, 18 * Math.PI / 180).periodS;
    const undampedPeriod = measurePeriod(physics(), 18 * Math.PI / 180).periodS;
    expect(Math.abs(dampedPeriod - undampedPeriod)).toBeLessThan(0.01);
  });

  it("is deterministic for the same state and configuration", () => {
    const config = physics();
    const first = simulatePendulum(config, 12 * Math.PI / 180, 3, 0.1);
    const second = simulatePendulum(config, 12 * Math.PI / 180, 3, 0.1);
    expect(second).toEqual(first);
  });
});

describe("pendulum measurements", () => {
  it("measures to the bob centre or shows a systematic error to the bottom", () => {
    const centre = measureLength(0.98, 0.02, "centre", 0.001);
    const bottom = measureLength(0.98, 0.02, "bottom", 0.001);
    expect(centre.measuredM).toBeCloseTo(1, 3);
    expect(centre.systematicErrorM).toBeCloseTo(0, 12);
    expect(bottom.measuredM).toBeCloseTo(1.02, 3);
    expect(bottom.systematicErrorM).toBeCloseTo(0.02, 12);
  });

  it("rounds a protractor reading to its resolution", () => {
    expect(measureAngle(5.24, 0.5)).toBeCloseTo(5, 2);
    expect(measureAngle(5.3, 0.5)).toBeCloseTo(5.5, 2);
  });

  it("reduces reaction-time error by timing repeated oscillations", () => {
    const spec = { resolutionS: 0.01, reactionMinS: 0.12, reactionMaxS: 0.32 };
    let singleError = 0;
    let repeatedError = 0;
    for (let seed = 0; seed < 200; seed += 1) {
      singleError += Math.abs(measuredOscillationTiming(2, 1, seed, seed, spec).periodS - 2) / 2;
      repeatedError += Math.abs(measuredOscillationTiming(2, 20, seed, seed, spec).periodS - 2) / 2;
    }
    expect(singleError / 200).toBeGreaterThan(0.02);
    expect(repeatedError / 200).toBeLessThan(0.005);
  });

  it("produces reproducible reaction delays for a seed and sequence", () => {
    const spec = { resolutionS: 0.01, reactionMinS: 0.12, reactionMaxS: 0.32 };
    expect(reactionDelayS(7, "start", 0, spec)).toBe(reactionDelayS(7, "start", 0, spec));
    expect(reactionDelayS(7, "start", 0, spec)).not.toBe(reactionDelayS(8, "start", 0, spec));
  });

  it("fits T squared against L and recovers g", () => {
    const lengths = [0.25, 0.5, 0.75, 1, 1.25];
    const points = lengths.map((length) => ({ x: length, y: periodSquared(measurePeriod(physics({ effectiveLengthM: length }), 3 * Math.PI / 180).periodS) }));
    const fit = lineOfBestFit(points);
    expect(fit.r2).toBeCloseTo(1, 5);
    expect(gravityFromPeriodSquaredFit(fit.slope)).toBeCloseTo(9.81, 2);
  });

  it("formats a stopwatch to its resolution", () => {
    expect(formatStopwatch(8.249, 0.01)).toBe("8.25");
    expect(formatStopwatch(65.4, 0.01)).toBe("1:05.40");
  });

  it("keeps the engine free of React, Three, Next, Zustand and component imports", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "lib/engine/physics/pendulum.ts"), "utf8");
    expect(source).not.toMatch(/from\s+["'](?:react|three|next|zustand|@react-three)/);
    expect(source).not.toMatch(/from\s+["'][^"']*components\//);
  });
});
