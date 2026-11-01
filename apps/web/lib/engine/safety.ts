import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";

export type SafetyRule = { id: string; pattern: string; message: string; severity: "error" | "warning" };

let cache: SafetyRule[] | null = null;

export function loadSafetyRules(): SafetyRule[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), "content/chemistry/safety-rules.yaml");
  const data = loadYaml(fs.readFileSync(file, "utf8")) as { rules: SafetyRule[] };
  cache = data.rules;
  return cache;
}

export function checkSafetyAction(action: string): SafetyRule | null {
  return loadSafetyRules().find((r) => r.pattern === action) ?? null;
}
