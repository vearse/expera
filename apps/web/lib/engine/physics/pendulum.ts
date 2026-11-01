export type PendulumPhysics = {
  effectiveLengthM: number;
  gravityMS2: number;
  bobMassKg: number;
  bobRadiusM: number;
  dampingCoefficientS: number;
  timeStepS: number;
};

export type PendulumMotion = {
  thetaRad: number;
  omegaRadS: number;
  timeS: number;
};

export type PendulumCrossingDirection = "positive-to-negative" | "negative-to-positive";

export type PendulumCrossing = {
  timeS: number;
  direction: PendulumCrossingDirection;
};

export type PendulumSample = PendulumMotion & {
  thetaDeg: number;
};

export type PendulumPeriodResult = {
  periodS: number;
  crossingTimesS: number[];
  simulatedS: number;
};

export type PendulumFit = {
  slope: number;
  intercept: number;
  r2: number;
  count: number;
};

export type LengthMeasurementMethod = "centre" | "bottom";

export type LengthMeasurement = {
  measuredM: number;
  trueEffectiveM: number;
  systematicErrorM: number;
  method: LengthMeasurementMethod;
};

export type OscillationTiming = {
  totalTimeS: number;
  periodS: number;
  startDelayS: number;
  stopDelayS: number;
  n: number;
};

export type StopwatchTimingSpec = {
  resolutionS: number;
  reactionMinS: number;
  reactionMaxS: number;
};

const TWO_PI = Math.PI * 2;

export function createPendulumMotion(releaseAngleRad: number): PendulumMotion {
  return { thetaRad: releaseAngleRad, omegaRadS: 0, timeS: 0 };
}

function acceleration(theta: number, omega: number, physics: PendulumPhysics): number {
  if (!(physics.effectiveLengthM > 0) || !(physics.gravityMS2 > 0)) return 0;
  return -(physics.gravityMS2 / physics.effectiveLengthM) * Math.sin(theta) - physics.dampingCoefficientS * omega;
}

export function stepPendulum(motion: PendulumMotion, physics: PendulumPhysics, dt: number): PendulumMotion {
  if (!(dt > 0)) return motion;
  const { thetaRad: theta, omegaRadS: omega } = motion;
  const k1Theta = omega;
  const k1Omega = acceleration(theta, omega, physics);
  const k2Theta = omega + (k1Omega * dt) / 2;
  const k2Omega = acceleration(theta + (k1Theta * dt) / 2, omega + (k1Omega * dt) / 2, physics);
  const k3Theta = omega + (k2Omega * dt) / 2;
  const k3Omega = acceleration(theta + (k2Theta * dt) / 2, omega + (k2Omega * dt) / 2, physics);
  const k4Theta = omega + k3Omega * dt;
  const k4Omega = acceleration(theta + k3Theta * dt, omega + k3Omega * dt, physics);
  return {
    thetaRad: theta + (dt / 6) * (k1Theta + 2 * k2Theta + 2 * k3Theta + k4Theta),
    omegaRadS: omega + (dt / 6) * (k1Omega + 2 * k2Omega + 2 * k3Omega + k4Omega),
    timeS: motion.timeS + dt,
  };
}

export function pendulumCrossing(previous: PendulumMotion, next: PendulumMotion): PendulumCrossing | null {
  if (previous.thetaRad > 0 && next.thetaRad <= 0) {
    const span = previous.thetaRad - next.thetaRad;
    const fraction = span > 0 ? previous.thetaRad / span : 0;
    return {
      timeS: previous.timeS + fraction * (next.timeS - previous.timeS),
      direction: "positive-to-negative",
    };
  }
  if (previous.thetaRad < 0 && next.thetaRad >= 0) {
    const span = next.thetaRad - previous.thetaRad;
    const fraction = span > 0 ? -previous.thetaRad / span : 0;
    return {
      timeS: previous.timeS + fraction * (next.timeS - previous.timeS),
      direction: "negative-to-positive",
    };
  }
  return null;
}

export function simulatePendulum(
  physics: PendulumPhysics,
  releaseAngleRad: number,
  durationS: number,
  sampleIntervalS = physics.timeStepS,
): PendulumSample[] {
  const dt = Math.max(1e-6, physics.timeStepS);
  const duration = Math.max(0, durationS);
  const sampleEvery = Math.max(dt, sampleIntervalS);
  let motion = createPendulumMotion(releaseAngleRad);
  const samples: PendulumSample[] = [{ ...motion, thetaDeg: (motion.thetaRad * 180) / Math.PI }];
  let nextSampleS = sampleEvery;
  while (motion.timeS < duration - 1e-12) {
    const step = Math.min(dt, duration - motion.timeS);
    motion = stepPendulum(motion, physics, step);
    if (motion.timeS + 1e-9 >= nextSampleS || motion.timeS >= duration - 1e-9) {
      samples.push({ ...motion, thetaDeg: (motion.thetaRad * 180) / Math.PI });
      while (nextSampleS <= motion.timeS + 1e-9) nextSampleS += sampleEvery;
    }
  }
  return samples;
}

export function measurePeriod(
  physics: PendulumPhysics,
  releaseAngleRad: number,
  options: { maxDurationS?: number; minIntervals?: number } = {},
): PendulumPeriodResult {
  const maxDurationS = options.maxDurationS ?? 90;
  const minIntervals = Math.max(1, options.minIntervals ?? 6);
  const dt = Math.max(1e-6, physics.timeStepS);
  let motion = createPendulumMotion(releaseAngleRad);
  let firstDirection: PendulumCrossingDirection | null = null;
  let lastCrossingS = 0;
  let crossingCount = 0;
  const intervals: number[] = [];
  const crossingTimesS: number[] = [];

  while (motion.timeS < maxDurationS - 1e-12) {
    const previous = motion;
    motion = stepPendulum(previous, physics, Math.min(dt, maxDurationS - motion.timeS));
    const crossing = pendulumCrossing(previous, motion);
    if (!crossing) continue;
    crossingTimesS.push(crossing.timeS);
    crossingCount += 1;
    if (firstDirection === null) {
      firstDirection = crossing.direction;
      lastCrossingS = crossing.timeS;
      continue;
    }
    if (crossing.direction === firstDirection) {
      const interval = crossing.timeS - lastCrossingS;
      if (interval > 0) intervals.push(interval);
      lastCrossingS = crossing.timeS;
      if (intervals.length >= minIntervals) break;
    }
  }

  if (intervals.length === 0) {
    throw new Error("The pendulum did not complete two same-direction centre crossings. Use a larger release angle or a longer run.");
  }
  const periodS = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return {
    periodS,
    crossingTimesS: crossingTimesS.slice(-(intervals.length + 2)),
    simulatedS: motion.timeS,
  };
}

export function smallAnglePeriod(physics: PendulumPhysics): number {
  return TWO_PI * Math.sqrt(physics.effectiveLengthM / physics.gravityMS2);
}

export function pendulumEnergy(motion: PendulumMotion, physics: PendulumPhysics): { kineticJ: number; potentialJ: number; totalJ: number } {
  const kineticJ = 0.5 * physics.bobMassKg * (physics.effectiveLengthM * motion.omegaRadS) ** 2;
  const potentialJ = physics.bobMassKg * physics.gravityMS2 * physics.effectiveLengthM * (1 - Math.cos(motion.thetaRad));
  return { kineticJ, potentialJ, totalJ: kineticJ + potentialJ };
}

export function pendulumTension(motion: PendulumMotion, physics: PendulumPhysics): number {
  if (!(physics.effectiveLengthM > 0)) return 0;
  return physics.bobMassKg * (physics.gravityMS2 * Math.cos(motion.thetaRad) + physics.effectiveLengthM * motion.omegaRadS ** 2);
}

export function measureLength(
  stringLengthM: number,
  bobRadiusM: number,
  method: LengthMeasurementMethod,
  resolutionM = 0.001,
): LengthMeasurement {
  const trueEffectiveM = stringLengthM + bobRadiusM;
  const raw = method === "centre" ? trueEffectiveM : stringLengthM + 2 * bobRadiusM;
  const decimals = Math.max(0, Math.ceil(-Math.log10(resolutionM)));
  const measuredM = Number((Math.round(raw / resolutionM) * resolutionM).toFixed(decimals));
  return {
    measuredM,
    trueEffectiveM,
    systematicErrorM: measuredM - trueEffectiveM,
    method,
  };
}

export function measureAngle(angleDeg: number, resolutionDeg = 0.5): number {
  const decimals = Math.max(0, Math.ceil(-Math.log10(resolutionDeg)));
  return Number((Math.round(angleDeg / resolutionDeg) * resolutionDeg).toFixed(decimals));
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function reactionDelayS(
  seed: number,
  channel: "start" | "stop",
  sequence: number,
  spec: Pick<StopwatchTimingSpec, "reactionMinS" | "reactionMaxS">,
): number {
  const mixed = (seed ^ hashString(channel) ^ Math.imul(sequence + 1, 2654435761)) >>> 0;
  const unit = mulberry32(mixed)();
  return spec.reactionMinS + unit * (spec.reactionMaxS - spec.reactionMinS);
}

export function measuredOscillationTiming(
  periodS: number,
  n: number,
  seed: number,
  sequence: number,
  spec: StopwatchTimingSpec,
): OscillationTiming {
  const startDelayS = reactionDelayS(seed, "start", sequence, spec);
  const stopDelayS = reactionDelayS(seed, "stop", sequence, spec);
  const trueIntervalS = periodS * n + stopDelayS - startDelayS;
  const decimals = Math.max(0, Math.ceil(-Math.log10(spec.resolutionS)));
  const totalTimeS = Math.max(0, Number((Math.round(trueIntervalS / spec.resolutionS) * spec.resolutionS).toFixed(decimals)));
  return {
    totalTimeS,
    periodS: totalTimeS / n,
    startDelayS,
    stopDelayS,
    n,
  };
}

export function lineOfBestFit(points: { x: number; y: number }[]): PendulumFit {
  const valid = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (valid.length < 2) return { slope: 0, intercept: 0, r2: 0, count: valid.length };
  const meanX = valid.reduce((sum, point) => sum + point.x, 0) / valid.length;
  const meanY = valid.reduce((sum, point) => sum + point.y, 0) / valid.length;
  let numerator = 0;
  let denominator = 0;
  for (const point of valid) {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += (point.x - meanX) ** 2;
  }
  const slope = denominator > 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;
  let ssRes = 0;
  let ssTot = 0;
  for (const point of valid) {
    const predicted = slope * point.x + intercept;
    ssRes += (point.y - predicted) ** 2;
    ssTot += (point.y - meanY) ** 2;
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 1;
  return { slope, intercept, r2, count: valid.length };
}

export function gravityFromPeriodSquaredFit(slope: number): number {
  return slope > 0 ? (4 * Math.PI ** 2) / slope : 0;
}

export function periodSquared(periodS: number): number {
  return periodS * periodS;
}

export function formatStopwatch(totalTimeS: number, resolutionS = 0.01): string {
  const rounded = Math.max(0, Math.round(totalTimeS / resolutionS) * resolutionS);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded - minutes * 60;
  const decimals = Math.max(0, Math.ceil(-Math.log10(resolutionS)));
  return minutes > 0
    ? `${minutes}:${seconds.toFixed(decimals).padStart(decimals + 3, "0")}`
    : seconds.toFixed(decimals);
}
