import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";
import { Review } from "./schemas";

const ROOT = path.join(process.cwd(), "content", "physics");

export const PendulumLabMeta = z.object({
  title: z.string(),
  subtitle: z.string(),
  aim: z.string(),
  summary: z.string(),
  hints: z.array(z.string()).min(1),
  criteria: z.array(z.string()).min(1),
  review: Review,
});
export type PendulumLabMeta = z.infer<typeof PendulumLabMeta>;

export const PendulumBob = z.object({
  id: z.string(),
  name: z.string(),
  massKg: z.number().positive(),
  radiusM: z.number().positive(),
  colour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  review: Review,
});
export type PendulumBob = z.infer<typeof PendulumBob>;

export const PendulumGravityPreset = z.object({
  id: z.string(),
  name: z.string(),
  accelerationMS2: z.number().positive(),
  review: Review,
});
export type PendulumGravityPreset = z.infer<typeof PendulumGravityPreset>;

export const PendulumLengthSpec = z.object({
  minM: z.number().positive(),
  maxM: z.number().positive(),
  stepM: z.number().positive(),
  resolutionM: z.number().positive(),
  defaultM: z.number().positive(),
  smallAngleLimitDeg: z.number().positive(),
  review: Review,
});
export type PendulumLengthSpec = z.infer<typeof PendulumLengthSpec>;

export const PendulumAngleSpec = z.object({
  minDeg: z.number().positive(),
  maxDeg: z.number().max(90),
  stepDeg: z.number().positive(),
  resolutionDeg: z.number().positive(),
  defaultDeg: z.number().positive(),
  largeAngleThresholdDeg: z.number().positive(),
  review: Review,
});
export type PendulumAngleSpec = z.infer<typeof PendulumAngleSpec>;

export const PendulumDampingSpec = z.object({
  offCoefficient: z.number().nonnegative(),
  onCoefficient: z.number().positive(),
  defaultEnabled: z.boolean(),
  review: Review,
});
export type PendulumDampingSpec = z.infer<typeof PendulumDampingSpec>;

export const PendulumStopwatchSpec = z.object({
  resolutionS: z.number().positive(),
  reactionMinS: z.number().nonnegative(),
  reactionMaxS: z.number().positive(),
  review: Review,
});
export type PendulumStopwatchSpec = z.infer<typeof PendulumStopwatchSpec>;

export const PendulumTimingSpec = z.object({
  timeStepS: z.number().positive(),
  speed: z.number().positive().max(12),
  maxSwingS: z.number().positive(),
  maxCatchUpS: z.number().positive(),
  oscillationOptions: z.array(z.number().int().positive()).min(1),
  defaultOscillations: z.number().int().positive(),
  review: Review,
});
export type PendulumTimingSpec = z.infer<typeof PendulumTimingSpec>;

export const PendulumAnalysisSpec = z.object({
  minRows: z.number().int().min(5),
  minDistinctLengths: z.number().int().min(5),
  targetErrorPercent: z.number().positive(),
  review: Review,
});
export type PendulumAnalysisSpec = z.infer<typeof PendulumAnalysisSpec>;

export const PendulumTaskSpec = z.object({
  id: z.enum(["mass", "amplitude", "gravity", "damping"]),
  title: z.string(),
  description: z.string(),
  review: Review,
});
export type PendulumTaskSpec = z.infer<typeof PendulumTaskSpec>;

export const PendulumFile = z.object({
  review: Review,
  defaultBobId: z.string(),
  defaultGravityId: z.string(),
  lab: PendulumLabMeta,
  bobs: z.array(PendulumBob).min(2),
  gravityPresets: z.array(PendulumGravityPreset).min(1),
  length: PendulumLengthSpec,
  angle: PendulumAngleSpec,
  damping: PendulumDampingSpec,
  stopwatch: PendulumStopwatchSpec,
  timing: PendulumTimingSpec,
  analysis: PendulumAnalysisSpec,
  tasks: z.array(PendulumTaskSpec).min(1),
});
export type PendulumFile = z.infer<typeof PendulumFile>;

export type PendulumData = Omit<PendulumFile, "review"> & {
  review: z.infer<typeof Review>;
};

function read(): unknown {
  return loadYaml(fs.readFileSync(path.join(ROOT, "pendulum.yaml"), "utf8"));
}

export function loadPendulum(): PendulumData {
  const result = PendulumFile.safeParse(read());
  if (!result.success) {
    throw new Error(`Invalid Physics content in physics/pendulum.yaml:\n${z.prettifyError(result.error)}`);
  }
  const file = result.data;
  const errors: string[] = [];
  if (!file.bobs.some((bob) => bob.id === file.defaultBobId)) errors.push(`unknown default bob "${file.defaultBobId}"`);
  if (!file.gravityPresets.some((gravity) => gravity.id === file.defaultGravityId)) errors.push(`unknown default gravity "${file.defaultGravityId}"`);
  if (file.length.minM >= file.length.maxM) errors.push("Pendulum length minimum must be less than maximum");
  if (file.length.defaultM < file.length.minM || file.length.defaultM > file.length.maxM) errors.push("Default pendulum length is outside its range");
  if (file.angle.minDeg >= file.angle.maxDeg) errors.push("Pendulum angle minimum must be less than maximum");
  if (file.angle.defaultDeg < file.angle.minDeg || file.angle.defaultDeg > file.angle.maxDeg) errors.push("Default release angle is outside its range");
  if (file.angle.largeAngleThresholdDeg > file.angle.maxDeg) errors.push("Large-angle threshold is above the maximum angle");
  if (file.stopwatch.reactionMinS >= file.stopwatch.reactionMaxS) errors.push("Stopwatch reaction minimum must be less than maximum");
  if (!file.timing.oscillationOptions.includes(file.timing.defaultOscillations)) errors.push("Default oscillation count is not offered");
  if (file.timing.timeStepS > 0.02) errors.push("Timing step is too coarse for a stable pendulum integration");
  if (file.analysis.minDistinctLengths < 5) errors.push("At least five distinct lengths are required for the graph");
  if (file.analysis.minRows < file.analysis.minDistinctLengths) errors.push("Minimum rows cannot be fewer than distinct lengths");
  if (new Set(file.bobs.map((bob) => bob.id)).size !== file.bobs.length) errors.push("Duplicate bob id");
  if (new Set(file.gravityPresets.map((gravity) => gravity.id)).size !== file.gravityPresets.length) errors.push("Duplicate gravity preset id");
  if (new Set(file.tasks.map((task) => task.id)).size !== file.tasks.length) errors.push("Duplicate discovery task id");

  const maxBobRadius = Math.max(...file.bobs.map((bob) => bob.radiusM));
  if (file.length.minM <= maxBobRadius) errors.push("Shortest string is shorter than the largest bob radius");
  for (const bob of file.bobs) {
    if (bob.massKg <= 0 || bob.radiusM <= 0) errors.push(`${bob.id}: bob mass and radius must be positive`);
  }
  if (errors.length) throw new Error(errors.join("\n"));
  return file;
}

export function pendulumReviewCount(data: PendulumData): number {
  const reviews = [
    data.review,
    data.lab.review,
    data.length.review,
    data.angle.review,
    data.damping.review,
    data.stopwatch.review,
    data.timing.review,
    data.analysis.review,
    ...data.bobs.map((bob) => bob.review),
    ...data.gravityPresets.map((gravity) => gravity.review),
    ...data.tasks.map((task) => task.review),
  ];
  return reviews.filter((review) => review === "NEEDS_TEACHER_REVIEW").length;
}
