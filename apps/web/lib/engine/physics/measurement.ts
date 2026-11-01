import type {
  LiquidSample,
  MeasuringCylinderSpec,
  MetreRuleSpec,
  MicrometerSpec,
  ParallaxSpec,
  PhysicsStationId,
  SolidSample,
  StopwatchSpec,
  VernierSpec,
} from "@/lib/content/physics";

export type VernierReading = {
  observedMm: number;
  mainScaleMm: number;
  vernierDivision: number;
  zeroErrorMm: number;
  correctedMm: number;
  displayCm: number;
  leastCountMm: number;
};

export type MicrometerReading = {
  observedMm: number;
  sleeveMm: number;
  thimbleDivision: number;
  zeroErrorMm: number;
  correctedMm: number;
  leastCountMm: number;
  pitchMm: number;
};

export type MetreRuleReading = {
  startCm: number;
  endCm: number;
  lengthCm: number;
  lengthMm: number;
  wornZero: boolean;
  smallestDivisionMm: number;
};

export type StopwatchReading = {
  elapsedMs: number;
  seconds: number;
  hundredths: number;
  display: string;
};

export type ParallaxReading = {
  trueReadingMm: number;
  eyeOffsetMm: number;
  shiftMm: number;
  observedMm: number;
  toleranceMm: number;
  aligned: boolean;
};

export type DensityReading = {
  massG: number;
  volumeCm3: number;
  densityGCm3: number;
  densityKgM3: number;
};

export type LiquidDensityReading = {
  emptyMassG: number;
  filledMassG: number;
  liquidMassG: number;
  volumeMl: number;
  densityGCm3: number;
  densityKgM3: number;
};

export type StationEvaluation = {
  stationId: PhysicsStationId;
  ok: boolean;
  mistakes: string[];
  completedChecks: string[];
};

export function roundTo(value: number, step: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) return 0;
  const decimals = Math.max(0, Math.ceil(-Math.log10(step)) + 1);
  return Number((Math.round(value / step) * step).toFixed(decimals));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function vernierReading(jawGapMm: number, spec: VernierSpec): VernierReading {
  const observed = roundTo(clamp(jawGapMm, 0, spec.rangeMm) + spec.zeroErrorMm, spec.leastCountMm);
  let mainScale = Math.floor(observed / spec.mainScaleDivisionMm) * spec.mainScaleDivisionMm;
  let vernierDivision = Math.round((observed - mainScale) / spec.leastCountMm);
  if (vernierDivision >= spec.vernierDivisions) {
    mainScale += spec.mainScaleDivisionMm;
    vernierDivision -= spec.vernierDivisions;
  }
  if (vernierDivision < 0) vernierDivision = 0;
  return {
    observedMm: observed,
    mainScaleMm: roundTo(mainScale, spec.mainScaleDivisionMm),
    vernierDivision,
    zeroErrorMm: spec.zeroErrorMm,
    correctedMm: roundTo(observed - spec.zeroErrorMm, 0.001),
    displayCm: roundTo(observed / 10, 0.001),
    leastCountMm: spec.leastCountMm,
  };
}

export function micrometerReading(spindleGapMm: number, spec: MicrometerSpec): MicrometerReading {
  const observed = roundTo(clamp(spindleGapMm, 0, spec.rangeMm) + spec.zeroErrorMm, spec.leastCountMm);
  let sleeve = Math.floor(observed / spec.pitchMm) * spec.pitchMm;
  let thimble = Math.round((observed - sleeve) / spec.leastCountMm);
  if (thimble >= spec.thimbleDivisions) {
    sleeve += spec.pitchMm;
    thimble -= spec.thimbleDivisions;
  }
  if (thimble < 0) thimble = 0;
  return {
    observedMm: observed,
    sleeveMm: roundTo(sleeve, 0.001),
    thimbleDivision: thimble,
    zeroErrorMm: spec.zeroErrorMm,
    correctedMm: roundTo(observed - spec.zeroErrorMm, 0.001),
    leastCountMm: spec.leastCountMm,
    pitchMm: spec.pitchMm,
  };
}

export function metreRuleReading(startCm: number, endCm: number, spec: MetreRuleSpec): MetreRuleReading {
  const stepCm = spec.smallestDivisionMm / 10;
  const start = roundTo(clamp(startCm, 0, spec.lengthCm), stepCm);
  const end = roundTo(clamp(endCm, 0, spec.lengthCm), stepCm);
  const lengthCm = roundTo(end - start, stepCm);
  return {
    startCm: start,
    endCm: end,
    lengthCm,
    lengthMm: roundTo(lengthCm * 10, spec.smallestDivisionMm),
    wornZero: start > spec.wornZeroOffsetCm * 0.5,
    smallestDivisionMm: spec.smallestDivisionMm,
  };
}

export function stopwatchReading(elapsedMs: number, spec: StopwatchSpec): StopwatchReading {
  const resolutionMs = Math.round(spec.resolutionS * 1000);
  const roundedMs = Math.max(0, Math.round(elapsedMs / resolutionMs) * resolutionMs);
  const seconds = Math.floor(roundedMs / 1000);
  const hundredths = Math.floor((roundedMs % 1000) / 10);
  return {
    elapsedMs: roundedMs,
    seconds,
    hundredths,
    display: `${seconds}.${String(hundredths).padStart(2, "0")}`,
  };
}

export function parallaxReading(trueReadingMm: number, eyeOffsetMm: number, spec: ParallaxSpec): ParallaxReading {
  const shiftMm = roundTo(eyeOffsetMm * spec.parallaxFactor, 0.01);
  const observedMm = roundTo(trueReadingMm + shiftMm, 0.1);
  return {
    trueReadingMm,
    eyeOffsetMm,
    shiftMm,
    observedMm,
    toleranceMm: spec.toleranceMm,
    aligned: Math.abs(shiftMm) <= spec.toleranceMm,
  };
}

export function solidVolumeCm3(diameterMm: number, heightMm: number): number {
  const radiusCm = diameterMm / 20;
  const heightCm = heightMm / 10;
  return Math.PI * radiusCm * radiusCm * heightCm;
}

export function densityFromMassVolume(massG: number, volumeCm3: number): DensityReading {
  const densityGCm3 = volumeCm3 > 0 ? massG / volumeCm3 : 0;
  return {
    massG,
    volumeCm3,
    densityGCm3,
    densityKgM3: densityGCm3 * 1000,
  };
}

export function solidDensity(sample: SolidSample, diameterMm: number, heightMm: number, massG: number): DensityReading {
  return densityFromMassVolume(massG, solidVolumeCm3(diameterMm || sample.diameterMm, heightMm || sample.heightMm));
}

export function liquidDensity(sample: LiquidSample, emptyMassG: number, filledMassG: number, volumeMl: number): LiquidDensityReading {
  const liquidMassG = Math.max(0, filledMassG - emptyMassG);
  const densityGCm3 = volumeMl > 0 ? liquidMassG / volumeMl : 0;
  return {
    emptyMassG,
    filledMassG,
    liquidMassG,
    volumeMl,
    densityGCm3,
    densityKgM3: densityGCm3 * 1000,
  };
}

export function measuringCylinderUncertainty(spec: MeasuringCylinderSpec): number {
  return spec.smallestDivisionMl / 2;
}

export function instrumentUncertainty(leastCount: number): number {
  return leastCount / 2;
}

export function absoluteError(measured: number, accepted: number): number {
  return Math.abs(measured - accepted);
}

export function percentageError(measured: number, accepted: number): number {
  if (accepted === 0) return 0;
  return (absoluteError(measured, accepted) / Math.abs(accepted)) * 100;
}

export function percentageUncertainty(uncertainty: number, reading: number): number {
  if (reading === 0) return 0;
  return (Math.abs(uncertainty) / Math.abs(reading)) * 100;
}

export function percentageDifference(first: number, second: number): number {
  const mean = (Math.abs(first) + Math.abs(second)) / 2;
  if (mean === 0) return 0;
  return (Math.abs(first - second) / mean) * 100;
}

export function formatValue(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

export function formatDensity(densityGCm3: number): string {
  return `${densityGCm3.toFixed(2)} g/cm3 (${(densityGCm3 * 1000).toFixed(0)} kg/m3)`;
}

export function readingWithin(measured: number, target: number, tolerance: number): boolean {
  return Math.abs(measured - target) <= tolerance + 1e-9;
}
