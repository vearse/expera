import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";
import { Review } from "./schemas";

const ROOT = path.join(process.cwd(), "content", "biology");

export const PrepAction = z.enum(["sample", "mount", "dry", "stain", "coverslip"]);
export type PrepAction = z.infer<typeof PrepAction>;

export const ObjectiveSpec = z.object({
  id: z.string(),
  name: z.string(),
  magnification: z.number().positive(),
  numericalAperture: z.number().positive(),
  depthOfFieldMicrometres: z.number().positive(),
  focusShiftMicrometres: z.number(),
});
export type ObjectiveSpec = z.infer<typeof ObjectiveSpec>;

export const MicroscopePartSpec = z.object({
  id: z.string(),
  name: z.string(),
  fn: z.string(),
});
export type MicroscopePartSpec = z.infer<typeof MicroscopePartSpec>;

export const EyepieceSpec = z.object({
  id: z.string(),
  name: z.string(),
  magnification: z.number().positive(),
  fieldNumberMm: z.number().positive(),
});
export type EyepieceSpec = z.infer<typeof EyepieceSpec>;

export const MicroscopeModelSpec = z.object({
  id: z.string(),
  name: z.string(),
  lightSource: z.enum(["led", "mirror"]),
  description: z.string(),
  defaultEyepieceId: z.string(),
  defaultObjectiveId: z.string(),
  coarseStepMicrometres: z.number().positive(),
  fineStepMicrometres: z.number().positive(),
  focusRangeMicrometres: z.number().positive(),
  eyepieces: z.array(EyepieceSpec).min(1),
  objectives: z.array(ObjectiveSpec).min(1),
  parts: z.array(MicroscopePartSpec).min(1),
  review: Review,
});
export type MicroscopeModelSpec = z.infer<typeof MicroscopeModelSpec>;

export const MicroscopyFile = z.object({
  review: Review,
  defaultModelId: z.string(),
  defaultIllumination: z.number().min(0).max(100),
  defaultDiaphragm: z.number().min(0).max(100),
  defaultCondenser: z.number().min(0).max(100),
  units: z.object({ imageSize: z.string(), actualSize: z.string() }),
  models: z.array(MicroscopeModelSpec).min(1),
});

export const StainSpec = z.object({
  id: z.string(),
  name: z.string(),
  required: z.boolean(),
  purpose: z.string(),
  review: Review,
});
export type StainSpec = z.infer<typeof StainSpec>;

export const PrepStep = z.object({
  id: z.string(),
  action: PrepAction,
  label: z.string(),
  instruction: z.string(),
  success: z.string(),
  error: z.string(),
});
export type PrepStep = z.infer<typeof PrepStep>;

export const StructureSpec = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["organism", "cell-part", "organelle", "structure"]),
  description: z.string(),
  minTotalMagnification: z.number().positive(),
  minClarity: z.number().min(0).max(1),
  expectedInDrawing: z.boolean(),
  point: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]),
  referenceSizeMicrometres: z.number().positive().optional(),
});
export type StructureSpec = z.infer<typeof StructureSpec>;

export const SpecimenVariant = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  structures: z.array(StructureSpec).min(1),
});
export type SpecimenVariant = z.infer<typeof SpecimenVariant>;

export const SpecimenSpec = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  organism: z.string(),
  sampleKind: z.enum(["plant", "animal", "microbial"]),
  description: z.string(),
  materials: z.array(z.string()).min(1),
  stain: StainSpec.nullable(),
  steps: z.array(PrepStep).min(1),
  variants: z.array(SpecimenVariant).min(1),
  review: Review,
});
export type SpecimenSpec = z.infer<typeof SpecimenSpec>;

export const SpecimensFile = z.object({
  review: Review,
  specimens: z.array(SpecimenSpec).min(1),
});

export const BiologyExperiment = z.object({
  id: z.string(),
  title: z.string(),
  specimenId: z.string(),
  aim: z.string(),
  summary: z.string(),
  hints: z.array(z.string()),
  criteria: z.array(z.string()),
  review: Review,
});
export type BiologyExperiment = z.infer<typeof BiologyExperiment>;

export const ExperimentsFile = z.object({
  review: Review,
  experiments: z.array(BiologyExperiment).min(1),
});

export type MicroscopyContent = z.infer<typeof MicroscopyFile>;
export type SpecimensContent = z.infer<typeof SpecimensFile>;
export type ExperimentsContent = z.infer<typeof ExperimentsFile>;

export type BiologyData = {
  microscopy: MicroscopyContent;
  specimens: SpecimensContent;
  experiments: ExperimentsContent;
};

function read(rel: string): unknown {
  return loadYaml(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function parse<T extends z.ZodTypeAny>(schema: T, rel: string): z.infer<T> {
  const result = schema.safeParse(read(rel));
  if (!result.success) {
    throw new Error(`Invalid Biology content in ${rel}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const loadMicroscopy = () => parse(MicroscopyFile, "microscopy.yaml");
export const loadSpecimens = () => parse(SpecimensFile, "specimens.yaml");
export const loadBiologyExperiments = () => parse(ExperimentsFile, "microscopy-experiments.yaml");

export function loadBiology(): BiologyData {
  const microscopy = loadMicroscopy();
  const specimens = loadSpecimens();
  const experiments = loadBiologyExperiments();
  const errors: string[] = [];

  const modelIds = new Set<string>();
  for (const model of microscopy.models) {
    if (modelIds.has(model.id)) errors.push(`duplicate microscope model "${model.id}"`);
    modelIds.add(model.id);
    if (!model.eyepieces.some((e) => e.id === model.defaultEyepieceId)) errors.push(`${model.id}: unknown default eyepiece`);
    if (!model.objectives.some((o) => o.id === model.defaultObjectiveId)) errors.push(`${model.id}: unknown default objective`);
    const objectiveIds = new Set(model.objectives.map((o) => o.id));
    if (objectiveIds.size !== model.objectives.length) errors.push(`${model.id}: duplicate objective id`);
    const eyepieceIds = new Set(model.eyepieces.map((e) => e.id));
    if (eyepieceIds.size !== model.eyepieces.length) errors.push(`${model.id}: duplicate eyepiece id`);
  }
  if (!modelIds.has(microscopy.defaultModelId)) errors.push(`unknown default microscope "${microscopy.defaultModelId}"`);

  const specimenIds = new Set<string>();
  for (const specimen of specimens.specimens) {
    if (specimenIds.has(specimen.id)) errors.push(`duplicate specimen "${specimen.id}"`);
    specimenIds.add(specimen.id);
    const actions = specimen.steps.map((s) => s.action);
    if (!actions.includes("sample")) errors.push(`${specimen.id}: preparation must include a sample step`);
    if (!actions.includes("mount")) errors.push(`${specimen.id}: preparation must include a mount step`);
    if (!actions.includes("coverslip")) errors.push(`${specimen.id}: preparation must include a coverslip step`);
    if (specimen.stain?.required && !actions.includes("stain")) errors.push(`${specimen.id}: required stain has no stain step`);
    const variantIds = new Set(specimen.variants.map((v) => v.id));
    if (variantIds.size !== specimen.variants.length) errors.push(`${specimen.id}: duplicate variant id`);
    for (const variant of specimen.variants) {
      const structureIds = new Set(variant.structures.map((s) => s.id));
      if (structureIds.size !== variant.structures.length) errors.push(`${specimen.id}/${variant.id}: duplicate structure id`);
      if (!variant.structures.some((s) => s.expectedInDrawing)) errors.push(`${specimen.id}/${variant.id}: no structure is expected in drawings`);
    }
  }

  const experimentIds = new Set<string>();
  for (const experiment of experiments.experiments) {
    if (experimentIds.has(experiment.id)) errors.push(`duplicate experiment "${experiment.id}"`);
    experimentIds.add(experiment.id);
    if (!specimenIds.has(experiment.specimenId)) errors.push(`${experiment.id}: unknown specimen "${experiment.specimenId}"`);
  }

  if (errors.length) throw new Error(errors.join("\n"));
  return { microscopy, specimens, experiments };
}

export function biologyReviewCount(data: BiologyData): number {
  const reviews = [
    data.microscopy.review,
    ...data.microscopy.models.map((m) => m.review),
    data.specimens.review,
    ...data.specimens.specimens.map((s) => s.review),
    ...data.specimens.specimens.flatMap((s) => (s.stain ? [s.stain.review] : [])),
    data.experiments.review,
    ...data.experiments.experiments.map((e) => e.review),
  ];
  return reviews.filter((r) => r === "NEEDS_TEACHER_REVIEW").length;
}
