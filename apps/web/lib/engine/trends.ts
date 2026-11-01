import type { Element } from "@/lib/content/schemas";

export type TrendKey = "atomicRadius" | "electronegativity" | "ionisationEnergy" | "meltingPoint" | "density";

export const TREND_LABELS: Record<TrendKey, string> = {
  atomicRadius: "Atomic radius (pm)",
  electronegativity: "Electronegativity",
  ionisationEnergy: "First ionisation energy (eV)",
  meltingPoint: "Melting point (K)",
  density: "Density (g cm-3)",
};

/** Colour-blind-safe viridis-like ramp (5 stops). */
const STOPS = ["#440154", "#31688e", "#35b779", "#fde725", "#ffffbf"];

export function trendValue(e: Element, key: TrendKey): number | null {
  return e[key];
}

export function trendScale(elements: Element[], key: TrendKey): { min: number; max: number } | null {
  const vals = elements.map((e) => trendValue(e, key)).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

export function trendColour(value: number | null, scale: { min: number; max: number } | null): string {
  if (value === null || !scale || scale.max === scale.min) return "#e2e8f0";
  const t = Math.max(0, Math.min(1, (value - scale.min) / (scale.max - scale.min)));
  const i = Math.min(STOPS.length - 1, Math.floor(t * STOPS.length));
  return STOPS[i];
}

export function normaliseState(s: string): "solid" | "liquid" | "gas" | "other" {
  const l = s.toLowerCase();
  if (l.includes("solid")) return "solid";
  if (l.includes("liquid")) return "liquid";
  if (l.includes("gas")) return "gas";
  return "other";
}
