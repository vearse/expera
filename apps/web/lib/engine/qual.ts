import type { Ion, Obs, QualTest, Salt } from "@/lib/content/schemas";

export type QualData = { tests: QualTest[]; cations: Ion[]; anions: Ion[]; salts: Salt[] };

/**
 * What a student sees when a test is done on salt X. Both ions are checked,
 * because a cation can interfere with an anion test (e.g. Pb2+ with BaCl2/HCl).
 */
export function observe(data: QualData, saltId: string, testId: string): Obs[] {
  const salt = data.salts.find((s) => s.id === saltId);
  const test = data.tests.find((t) => t.id === testId);
  if (!salt || !test) throw new Error(`Unknown salt ${saltId} or test ${testId}`);
  const cation = data.cations.find((c) => c.id === salt.cation)!;
  const anion = data.anions.find((a) => a.id === salt.anion)!;
  const primary = test.for === "cation" ? cation : anion;
  const secondary = test.for === "cation" ? anion : cation;
  const results = [primary.results[testId], secondary.results[testId]].filter((r): r is Obs => Boolean(r));
  return results.length ? results : [test.noChange];
}

/** Every inference phrase in the data, for the inference picker. */
export function inferenceOptions(data: QualData): string[] {
  const all = new Set<string>();
  for (const t of data.tests) all.add(t.noChange.inference);
  for (const ion of [...data.cations, ...data.anions]) for (const r of Object.values(ion.results)) all.add(r.inference);
  return [...all].sort();
}

/** Salts that can be told apart from every other salt in the pool by the available tests. */
export function distinguishable(data: QualData): string[] {
  const fingerprint = (saltId: string) => data.tests.map((t) => observe(data, saltId, t.id).map((o) => o.observation).join("|")).join("#");
  const prints = data.salts.map((s) => fingerprint(s.id));
  return data.salts.filter((_, i) => prints.filter((p) => p === prints[i]).length === 1).map((s) => s.id);
}
