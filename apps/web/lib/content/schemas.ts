import { z } from "zod";

export const Review = z.enum(["NEEDS_TEACHER_REVIEW", "APPROVED"]);

export const Colour = z.object({ name: z.string(), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) });

export const Element = z.object({
  atomicNumber: z.number().int().min(1).max(118),
  symbol: z.string().min(1).max(3),
  name: z.string(),
  atomicMassIupac: z.number().positive(),
  atomicMassExam: z.number().positive().nullable(),
  group: z.number().int().min(1).max(18).nullable(),
  period: z.number().int().min(1).max(7),
  block: z.enum(["s", "p", "d", "f"]),
  category: z.string(),
  type: z.enum(["metal", "non-metal", "metalloid"]),
  stateAtRTP: z.string(),
  electronConfiguration: z.string(),
  shells: z.array(z.number().int().nonnegative()),
  uses: z.array(z.string()),
  nigerianExamples: z.array(z.string()),
  occurrence: z.array(z.string()).default([]),
  atomicRadius: z.number().nullable(),
  electronegativity: z.number().nullable(),
  ionisationEnergy: z.number().nullable(),
  meltingPoint: z.number().nullable(),
  boilingPoint: z.number().nullable(),
  density: z.number().nullable(),
  review: Review,
});
export type Element = z.infer<typeof Element>;

export const ElementsFile = z.object({
  source: z.object({ dataset: z.string(), url: z.string(), licence: z.string(), retrieved: z.string() }),
  elements: z.array(Element).length(118),
});

export const Indicator = z.object({
  id: z.string(),
  name: z.string(),
  low: z.number(),
  high: z.number(),
  acidColour: Colour,
  transitionColour: Colour,
  alkaliColour: Colour,
  review: Review,
});
export type Indicator = z.infer<typeof Indicator>;

export const Substance = z.object({
  id: z.string(),
  name: z.string(),
  pH: z.number().min(0).max(14),
  nigerian: z.boolean().default(false),
  note: z.string().optional(),
  review: Review,
});
export type Substance = z.infer<typeof Substance>;

export const Reagent = z.object({
  id: z.string(),
  name: z.string(),
  formula: z.string(),
  kind: z.enum(["acid", "base", "salt", "indicator", "test-reagent", "solvent"]),
  hazards: z.array(z.string()),
  review: Review,
});

export const ReagentsFile = z.object({
  indicators: z.array(Indicator),
  substances: z.array(Substance),
  reagents: z.array(Reagent),
});

export const Apparatus = z.object({
  id: z.string(),
  name: z.string(),
  use: z.string(),
  howTo: z.array(z.string()).optional(),
  tip: z.string().optional(),
  safety: z.string().optional(),
  review: Review,
});
export type Apparatus = z.infer<typeof Apparatus>;

const Obs = z.object({ observation: z.string(), inference: z.string() });
export type Obs = z.infer<typeof Obs>;

export const QualTest = z.object({
  id: z.string(),
  for: z.enum(["cation", "anion"]),
  name: z.string(),
  procedure: z.string(),
  noChange: Obs,
});
export type QualTest = z.infer<typeof QualTest>;

/** An ion and what it shows in each test. Tests not listed give the test's `noChange` result. */
export const Ion = z.object({
  id: z.string(),
  ion: z.string(),
  name: z.string(),
  results: z.record(z.string(), Obs),
  review: Review,
});
export type Ion = z.infer<typeof Ion>;

export const Salt = z.object({ id: z.string(), formula: z.string(), name: z.string(), cation: z.string(), anion: z.string() });
export type Salt = z.infer<typeof Salt>;

export const Gas = z.object({ id: z.string(), name: z.string(), formula: z.string(), test: z.string(), result: z.string(), review: Review });
export type Gas = z.infer<typeof Gas>;

export const QualFile = z.object({
  tests: z.array(QualTest),
  cations: z.array(Ion),
  anions: z.array(Ion),
  gases: z.array(Gas),
  salts: z.array(Salt),
});

export const IonInfo = z.object({
  id: z.string(),
  symbol: z.string(),
  charge: z.number().int().refine((c) => c !== 0),
  name: z.string(),
  polyatomic: z.boolean().default(false),
});
export type IonInfo = z.infer<typeof IonInfo>;

export const Molecule = z.object({
  id: z.string(),
  formula: z.string(),
  name: z.string(),
  bondType: z.enum(["covalent", "ionic", "metallic"]),
  shape: z.string(),
  bondAngle: z.string(),
  lonePairs: z.number().int().nonnegative(),
  atoms: z.array(z.object({ el: z.string(), x: z.number(), y: z.number(), z: z.number() })),
  bonds: z.array(z.tuple([z.number().int(), z.number().int(), z.number().int().min(1).max(3)])),
  bondLengths: z.array(z.object({ bond: z.string(), pm: z.number() })).default([]),
  structural2d: z.array(z.object({ x1: z.number(), y1: z.number(), x2: z.number(), y2: z.number() })).default([]),
  lattice: z.string().optional(),
  stateAtRTP: z.string().optional(),
  review: Review,
});
export type Molecule = z.infer<typeof Molecule>;

export const EquationExercise = z.object({
  id: z.string(),
  left: z.array(z.string()),
  right: z.array(z.string()),
  states: z.array(z.string()),
  answer: z.array(z.number().int().positive()),
});
export type EquationExercise = z.infer<typeof EquationExercise>;

export const CompoundsFile = z.object({
  cations: z.array(IonInfo),
  anions: z.array(IonInfo),
  molecules: z.array(Molecule),
  equations: z.array(EquationExercise),
  isotopes: z.record(z.string(), z.array(z.object({ mass: z.number().int(), name: z.string().optional() }))),
  review: Review,
});

const TaskBase = { id: z.string(), prompt: z.string(), hint: z.string().optional(), explain: z.string(), safety: z.boolean().default(false) };

export const Task = z.discriminatedUnion("type", [
  z.object({
    ...TaskBase,
    type: z.literal("choice"),
    image: z.string().optional(),
    options: z.array(z.object({ id: z.string(), text: z.string() })).min(2),
    answer: z.string(),
  }),
  z.object({ ...TaskBase, type: z.literal("order"), items: z.array(z.string()).min(2) }),
  z.object({ ...TaskBase, type: z.literal("numeric"), answer: z.number(), tolerance: z.number().nonnegative(), unit: z.string() }),
  z.object({
    ...TaskBase,
    type: z.literal("bench"),
    bench: z.enum(["titration", "qual", "indicator", "burette-reading", "cylinder-reading", "rf", "neutralise"]),
  }),
]);
export type Task = z.infer<typeof Task>;

export const Experiment = z.object({
  id: z.string(),
  title: z.string(),
  scope: z.string(),
  wave: z.literal(1),
  aim: z.string(),
  apparatus: z.array(z.string()),
  reagents: z.array(z.string()),
  safety: z.array(z.string()),
  keyIdea: z.string(),
  reviseTopic: z.string(),
  learnLinks: z.array(z.string()),
  review: Review,
  tasks: z.array(Task).min(1),
});
export type Experiment = z.infer<typeof Experiment>;

export const GuidedStageId = z.enum(["safety", "identify", "reading", "handling", "assemble", "cleanup", "assessment"]);
export type GuidedStageId = z.infer<typeof GuidedStageId>;

export const GuidedTourStage = z.object({
  id: GuidedStageId,
  title: z.string(),
  theory: z.string(),
  taskKind: z.enum(["choice", "identify-click", "reading", "handling", "assemble", "checklist", "assemble-final"]),
  setupTarget: z.enum(["titration", "filtration"]).optional(),
});
export type GuidedTourStage = z.infer<typeof GuidedTourStage>;

export const GuidedTour = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  title: z.string(),
  review: Review,
  stages: z.array(GuidedTourStage).min(1),
});
export type GuidedTour = z.infer<typeof GuidedTour>;

export const Conventions = z
  .object({
    review: Review,
    units: z.record(z.string(), z.string()),
    spelling: z.array(z.string()),
    examAtomicMasses: z.record(z.string(), z.number()),
    titration: z.object({
      readingDecimalPlaces: z.number().int(),
      readingResolution: z.number(),
      concordanceTolerance: z.number(),
      pipetteVolume: z.number(),
      tableRows: z.array(z.string()),
      tableColumns: z.array(z.string()),
    }),
    qual: z.object({ tableColumns: z.array(z.string()) }),
  })
  .passthrough();
export type Conventions = z.infer<typeof Conventions>;
