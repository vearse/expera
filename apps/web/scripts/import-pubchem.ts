/**
 * Builds content/chemistry/elements/elements.json from the PubChem periodic table
 * (scripts/data/pubchem-periodictable.json) plus curated notes and WAEC masses.
 * Run: npx tsx scripts/import-pubchem.ts
 */
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { ElementsFile } from "../lib/content/schemas";

const root = process.cwd();
const raw = JSON.parse(fs.readFileSync(path.join(root, "scripts/data/pubchem-periodictable.json"), "utf8"));
const notes = yaml.load(fs.readFileSync(path.join(root, "scripts/data/element-notes.yaml"), "utf8")) as Record<
  string,
  { uses?: string[]; nigerian?: string[]; occurrence?: string[] }
>;
const num = (s: string) => {
  const n = Number(s);
  return s && !Number.isNaN(n) ? n : null;
};
const conventions = yaml.load(fs.readFileSync(path.join(root, "content/chemistry/conventions.yaml"), "utf8")) as { examAtomicMasses: Record<string, number> };

const cols: string[] = raw.Table.Columns.Column;
const rows: Record<string, string>[] = raw.Table.Row.map((r: { Cell: string[] }) => Object.fromEntries(cols.map((c, i) => [c, r.Cell[i]])));

const NOBLE = [2, 10, 18, 36, 54, 86, 118];
const CORES: Record<string, string> = {};

function periodOf(z: number) {
  return NOBLE.findIndex((n) => z <= n) + 1;
}

function positionOf(z: number): { group: number | null; block: "s" | "p" | "d" | "f" } {
  const p = periodOf(z);
  const start = p === 1 ? 1 : NOBLE[p - 2] + 1;
  const i = z - start; // 0-based position in the period
  if (p === 1) return z === 1 ? { group: 1, block: "s" } : { group: 18, block: "s" };
  if (p <= 3) return i < 2 ? { group: i + 1, block: "s" } : { group: i + 11, block: "p" };
  if (p <= 5) return { group: i + 1, block: i < 2 ? "s" : i < 12 ? "d" : "p" };
  // Periods 6 and 7: La/Ac sit in group 3; the next 14 are the f-block (no group).
  if (i < 2) return { group: i + 1, block: "s" };
  if (i === 2) return { group: 3, block: "d" };
  if (i < 17) return { group: null, block: "f" };
  const j = i - 14;
  return { group: j + 1, block: j < 12 ? "d" : "p" };
}

function expand(config: string): string {
  const clean = config.replace(/\(.*?\)/g, "").trim();
  return clean.replace(/\[(\w+)\]/, (_, sym: string) => `${expand(CORES[sym])} `);
}

function shellsOf(config: string): number[] {
  const shells: number[] = [];
  for (const m of expand(config).matchAll(/(\d)([spdf])(\d+)/g)) {
    const n = Number(m[1]);
    shells[n - 1] = (shells[n - 1] ?? 0) + Number(m[3]);
  }
  return Array.from(shells, (v) => v ?? 0);
}

function typeOf(groupBlock: string): "metal" | "non-metal" | "metalloid" {
  const g = groupBlock.toLowerCase();
  if (g.includes("metalloid")) return "metalloid";
  if (g.includes("nonmetal") || g.includes("halogen") || g.includes("noble gas")) return "non-metal";
  return "metal";
}

/** British spellings used in the NERDC curriculum and WAEC papers. */
const BRITISH_NAMES: Record<string, string> = { Aluminum: "Aluminium", Sulfur: "Sulphur", Cesium: "Caesium" };

for (const r of rows) CORES[r.Symbol] = r.ElectronConfiguration;

const elements = rows.map((r) => {
  const z = Number(r.AtomicNumber);
  const pos = positionOf(z);
  const shells = shellsOf(r.ElectronConfiguration);
  const sum = shells.reduce((a, b) => a + b, 0);
  if (sum !== z) throw new Error(`${r.Symbol}: shells sum ${sum} != ${z} (${r.ElectronConfiguration})`);
  const note = notes[r.Symbol] ?? {};
  return {
    atomicNumber: z,
    symbol: r.Symbol,
    name: BRITISH_NAMES[r.Name] ?? r.Name,
    atomicMassIupac: Number(r.AtomicMass),
    atomicMassExam: conventions.examAtomicMasses[r.Symbol] ?? null,
    group: pos.group,
    period: periodOf(z),
    block: pos.block,
    category: r.GroupBlock,
    type: typeOf(r.GroupBlock),
    stateAtRTP: r.StandardState || "Expected to be a solid",
    electronConfiguration: r.ElectronConfiguration,
    shells,
    uses: note.uses ?? [],
    nigerianExamples: note.nigerian ?? [],
    occurrence: note.occurrence ?? [],
    atomicRadius: num(r.AtomicRadius),
    electronegativity: num(r.Electronegativity),
    ionisationEnergy: num(r.IonizationEnergy),
    meltingPoint: num(r.MeltingPoint),
    boilingPoint: num(r.BoilingPoint),
    density: num(r.Density),
    review: "NEEDS_TEACHER_REVIEW" as const,
  };
});

const file = ElementsFile.parse({
  source: {
    dataset: "PubChem Periodic Table of Elements (National Library of Medicine, NIH)",
    url: "https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON",
    licence: "Public domain (US Government work); see https://www.ncbi.nlm.nih.gov/home/about/policies/",
    retrieved: new Date().toISOString().slice(0, 10),
  },
  elements,
});

fs.writeFileSync(path.join(root, "content/chemistry/elements/elements.json"), JSON.stringify(file, null, 1) + "\n");
console.log(`Wrote ${file.elements.length} elements`);
