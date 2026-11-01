import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";
import { Review } from "./schemas";

const ROOT = path.join(process.cwd(), "content", "physics");

export const PhysicsStationId = z.enum(["vernier", "micrometer", "metre-rule", "stopwatch", "parallax", "density"]);
export type PhysicsStationId = z.infer<typeof PhysicsStationId>;

export const PhysicsLabMeta = z.object({
  title: z.string(),
  subtitle: z.string(),
  aim: z.string(),
  summary: z.string(),
  hints: z.array(z.string()).min(1),
  criteria: z.array(z.string()).min(1),
  review: Review,
});
export type PhysicsLabMeta = z.infer<typeof PhysicsLabMeta>;

export const VernierSpec = z.object({
  name: z.string(),
  mainScaleDivisionMm: z.number().positive(),
  vernierDivisions: z.number().int().positive(),
  leastCountMm: z.number().positive(),
  rangeMm: z.number().positive(),
  zeroErrorMm: z.number(),
  review: Review,
});
export type VernierSpec = z.infer<typeof VernierSpec>;

export const MicrometerSpec = z.object({
  name: z.string(),
  pitchMm: z.number().positive(),
  thimbleDivisions: z.number().int().positive(),
  leastCountMm: z.number().positive(),
  rangeMm: z.number().positive(),
  zeroErrorMm: z.number(),
  review: Review,
});
export type MicrometerSpec = z.infer<typeof MicrometerSpec>;

export const MetreRuleSpec = z.object({
  name: z.string(),
  lengthCm: z.number().positive(),
  smallestDivisionMm: z.number().positive(),
  wornZeroOffsetCm: z.number().nonnegative(),
  review: Review,
});
export type MetreRuleSpec = z.infer<typeof MetreRuleSpec>;

export const StopwatchSpec = z.object({
  name: z.string(),
  resolutionS: z.number().positive(),
  review: Review,
});
export type StopwatchSpec = z.infer<typeof StopwatchSpec>;

export const BalanceSpec = z.object({
  name: z.string(),
  resolutionG: z.number().positive(),
  review: Review,
});
export type BalanceSpec = z.infer<typeof BalanceSpec>;

export const MeasuringCylinderSpec = z.object({
  name: z.string(),
  capacityMl: z.number().positive(),
  smallestDivisionMl: z.number().positive(),
  review: Review,
});
export type MeasuringCylinderSpec = z.infer<typeof MeasuringCylinderSpec>;

export const ParallaxSpec = z.object({
  name: z.string(),
  trueReadingMm: z.number().positive(),
  parallaxFactor: z.number().positive(),
  toleranceMm: z.number().positive(),
  review: Review,
});
export type ParallaxSpec = z.infer<typeof ParallaxSpec>;

export const PhysicsInstruments = z.object({
  vernier: VernierSpec,
  micrometer: MicrometerSpec,
  metreRule: MetreRuleSpec,
  stopwatch: StopwatchSpec,
  balance: BalanceSpec,
  measuringCylinder: MeasuringCylinderSpec,
  parallax: ParallaxSpec,
});
export type PhysicsInstruments = z.infer<typeof PhysicsInstruments>;

export const VernierSample = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  actualLengthMm: z.number().positive(),
  review: Review,
});
export type VernierSample = z.infer<typeof VernierSample>;

export const MicrometerSample = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  actualThicknessMm: z.number().positive(),
  review: Review,
});
export type MicrometerSample = z.infer<typeof MicrometerSample>;

export const MetreRuleSample = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  actualLengthCm: z.number().positive(),
  placementStartCm: z.number().nonnegative(),
  review: Review,
});
export type MetreRuleSample = z.infer<typeof MetreRuleSample>;

export const StopwatchSample = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  targetSeconds: z.number().positive(),
  review: Review,
});
export type StopwatchSample = z.infer<typeof StopwatchSample>;

export const SolidSample = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  massG: z.number().positive(),
  diameterMm: z.number().positive(),
  heightMm: z.number().positive(),
  acceptedDensityGCm3: z.number().positive(),
  review: Review,
});
export type SolidSample = z.infer<typeof SolidSample>;

export const LiquidSample = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  emptyMassG: z.number().positive(),
  filledMassG: z.number().positive(),
  volumeMl: z.number().positive(),
  acceptedDensityGCm3: z.number().positive(),
  review: Review,
});
export type LiquidSample = z.infer<typeof LiquidSample>;

export const PhysicsSamples = z.object({
  vernier: VernierSample,
  micrometer: MicrometerSample,
  metreRule: MetreRuleSample,
  stopwatch: StopwatchSample,
  solid: SolidSample,
  liquid: LiquidSample,
});
export type PhysicsSamples = z.infer<typeof PhysicsSamples>;

export const PhysicsStation = z.object({
  id: PhysicsStationId,
  order: z.number().int().positive(),
  title: z.string(),
  short: z.string(),
  summary: z.string(),
  hint: z.string(),
  icon: z.string(),
  review: Review,
});
export type PhysicsStation = z.infer<typeof PhysicsStation>;

export const PhysicsFile = z.object({
  review: Review,
  defaultStationId: PhysicsStationId,
  lab: PhysicsLabMeta,
  instruments: PhysicsInstruments,
  samples: PhysicsSamples,
  stations: z.array(PhysicsStation).length(6),
});
export type PhysicsFile = z.infer<typeof PhysicsFile>;

export type PhysicsData = {
  lab: PhysicsLabMeta;
  defaultStationId: PhysicsStationId;
  instruments: PhysicsInstruments;
  samples: PhysicsSamples;
  stations: PhysicsStation[];
  review: z.infer<typeof Review>;
};

function read(): unknown {
  return loadYaml(fs.readFileSync(path.join(ROOT, "measurement.yaml"), "utf8"));
}

export function loadPhysics(): PhysicsData {
  const result = PhysicsFile.safeParse(read());
  if (!result.success) {
    throw new Error(`Invalid Physics content in physics/measurement.yaml:\n${z.prettifyError(result.error)}`);
  }
  const file = result.data;
  const errors: string[] = [];
  const ids = new Set<PhysicsStationId>();
  for (const station of file.stations) {
    if (ids.has(station.id)) errors.push(`duplicate station "${station.id}"`);
    ids.add(station.id);
  }
  if (!ids.has(file.defaultStationId)) errors.push(`unknown default station "${file.defaultStationId}"`);

  const { vernier, micrometer, metreRule, parallax } = file.instruments;
  if (Math.abs(vernier.mainScaleDivisionMm / vernier.vernierDivisions - vernier.leastCountMm) > 1e-9) {
    errors.push("Vernier least count does not equal main-scale division / Vernier divisions");
  }
  if (Math.abs(micrometer.pitchMm / micrometer.thimbleDivisions - micrometer.leastCountMm) > 1e-9) {
    errors.push("Micrometer least count does not equal pitch / thimble divisions");
  }
  if (file.samples.liquid.filledMassG <= file.samples.liquid.emptyMassG) {
    errors.push("Liquid filled mass must be greater than empty mass");
  }
  if (file.samples.metreRule.placementStartCm >= metreRule.lengthCm) {
    errors.push("Metre-rule placement is outside the rule");
  }
  if (file.samples.solid.diameterMm <= 0 || file.samples.solid.heightMm <= 0) {
    errors.push("Solid dimensions must be positive");
  }
  if (parallax.toleranceMm > parallax.trueReadingMm * 0.1) {
    errors.push("Parallax tolerance is too large for a useful reading");
  }
  if (errors.length) throw new Error(errors.join("\n"));

  return {
    lab: file.lab,
    defaultStationId: file.defaultStationId,
    instruments: file.instruments,
    samples: file.samples,
    stations: [...file.stations].sort((a, b) => a.order - b.order),
    review: file.review,
  };
}

export function physicsReviewCount(data: PhysicsData): number {
  const reviews = [
    data.review,
    data.lab.review,
    data.instruments.vernier.review,
    data.instruments.micrometer.review,
    data.instruments.metreRule.review,
    data.instruments.stopwatch.review,
    data.instruments.balance.review,
    data.instruments.measuringCylinder.review,
    data.instruments.parallax.review,
    data.samples.vernier.review,
    data.samples.micrometer.review,
    data.samples.metreRule.review,
    data.samples.stopwatch.review,
    data.samples.solid.review,
    data.samples.liquid.review,
    ...data.stations.map((station) => station.review),
  ];
  return reviews.filter((review) => review === "NEEDS_TEACHER_REVIEW").length;
}
