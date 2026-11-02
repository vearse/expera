import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";
import {
  Apparatus,
  CompoundsFile,
  Conventions,
  ElementsFile,
  Experiment,
  GuidedTour,
  QualFile,
  ReagentsFile,
} from "./schemas";
import { isBalanced, parseFormula } from "@/lib/engine/formula";

const ROOT = path.join(process.cwd(), "content", "chemistry");

function read(rel: string): unknown {
  const file = path.join(ROOT, rel);
  const text = fs.readFileSync(file, "utf8");
  return rel.endsWith(".json") ? JSON.parse(text) : loadYaml(text);
}

function parse<T extends z.ZodTypeAny>(schema: T, rel: string): z.infer<T> {
  const result = schema.safeParse(read(rel));
  if (!result.success) {
    throw new Error(`Invalid content in ${rel}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const loadConventions = () => parse(Conventions, "conventions.yaml");
export const loadElements = () => parse(ElementsFile, "elements/elements.json");
export const loadReagents = () => parse(ReagentsFile, "reagents.yaml");
export const loadApparatus = () => parse(z.array(Apparatus), "apparatus.yaml");
export const loadQual = () => parse(QualFile, "qual-tests.yaml");
export const loadCompounds = () => parse(CompoundsFile, "compounds.yaml");

const benchDir = () => (fs.existsSync(path.join(ROOT, "lab")) ? "lab" : "experiments");

export function listExperimentIds(): string[] {
  return fs
    .readdirSync(path.join(ROOT, benchDir()))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => f.replace(/\.yaml$/, ""));
}

export function loadExperiment(id: string) {
  const dir = benchDir();
  const exp = parse(Experiment, `${dir}/${id}.yaml`);
  if (exp.id !== id) throw new Error(`${dir}/${id}.yaml has id "${exp.id}"`);
  return exp;
}

export function loadGuidedTour(id: string) {
  const dir = path.join(ROOT, "tours");
  if (!fs.existsSync(dir)) return null;
  const file = path.join(dir, `${id}.yaml`);
  if (!fs.existsSync(file)) return null;
  const result = GuidedTour.safeParse(read(`tours/${id}.yaml`));
  if (!result.success) throw new Error(`Invalid tour in tours/${id}.yaml:\n${z.prettifyError(result.error)}`);
  return result.data;
}

export function loadAll() {
  const conventions = loadConventions();
  const elements = loadElements();
  const reagents = loadReagents();
  const apparatus = loadApparatus();
  const qual = loadQual();
  const compounds = loadCompounds();
  const experiments = listExperimentIds().map(loadExperiment);

  const apparatusIds = new Set(apparatus.map((a) => a.id));
  const reagentIds = new Set(reagents.reagents.map((r) => r.id));
  const cationIds = new Set(qual.cations.map((c) => c.id));
  const anionIds = new Set(qual.anions.map((a) => a.id));
  const errors: string[] = [];

  for (const exp of experiments) {
    for (const a of exp.apparatus) if (!apparatusIds.has(a)) errors.push(`${exp.id}: unknown apparatus "${a}"`);
    for (const r of exp.reagents) if (!reagentIds.has(r)) errors.push(`${exp.id}: unknown reagent "${r}"`);
    for (const t of exp.tasks) {
      if (t.type === "choice" && !t.options.some((o) => o.id === t.answer)) errors.push(`${exp.id}/${t.id}: answer not in options`);
      if (t.type === "choice" && t.image && !apparatusIds.has(t.image)) errors.push(`${exp.id}/${t.id}: unknown image "${t.image}"`);
    }
  }
  const testIds = new Set(qual.tests.map((t) => t.id));
  for (const ion of [...qual.cations, ...qual.anions]) {
    for (const t of Object.keys(ion.results)) if (!testIds.has(t)) errors.push(`ion ${ion.id}: unknown test "${t}"`);
  }
  for (const s of qual.salts) {
    if (!cationIds.has(s.cation)) errors.push(`salt ${s.id}: unknown cation ${s.cation}`);
    if (!anionIds.has(s.anion)) errors.push(`salt ${s.id}: unknown anion ${s.anion}`);
  }
  const masses = conventions.examAtomicMasses;
  for (const ion of [...compounds.cations, ...compounds.anions]) {
    for (const el of Object.keys(parseFormula(ion.symbol))) if (masses[el] === undefined) errors.push(`ion ${ion.id}: no exam mass for ${el}`);
  }
  for (const eq of compounds.equations) {
    const side = (fs: string[], offset: number) => fs.map((f, i) => ({ formula: f, coefficient: eq.answer[offset + i] }));
    if (eq.answer.length !== eq.left.length + eq.right.length) errors.push(`equation ${eq.id}: answer length`);
    else if (!isBalanced(side(eq.left, 0), side(eq.right, eq.left.length))) errors.push(`equation ${eq.id}: stored answer is not balanced`);
  }
  for (const m of compounds.molecules) {
    const counts: Record<string, number> = {};
    for (const a of m.atoms) counts[a.el] = (counts[a.el] ?? 0) + 1;
    if (JSON.stringify(Object.entries(counts).sort()) !== JSON.stringify(Object.entries(parseFormula(m.formula)).sort())) errors.push(`molecule ${m.id}: atoms do not match formula`);
  }
  if (errors.length) throw new Error(errors.join("\n"));

  return { conventions, elements, reagents, apparatus, qual, compounds, experiments };
}
