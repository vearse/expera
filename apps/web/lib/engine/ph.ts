import type { Indicator } from "@/lib/content/schemas";

export type Colour = { name: string; hex: string };

/** Colour of an indicator at a given pH, using its transition range. */
export function indicatorColour(ind: Indicator, pH: number): Colour {
  if (pH < ind.low) return ind.acidColour;
  if (pH > ind.high) return ind.alkaliColour;
  return ind.transitionColour;
}

export function classify(pH: number): "acidic" | "neutral" | "alkaline" {
  if (pH < 6.5) return "acidic";
  if (pH > 7.5) return "alkaline";
  return "neutral";
}

/**
 * pH after mixing a strong acid and a strong base (complete neutralisation).
 * Amounts in mol, total volume in cm3. Water ionisation is ignored except at the exact equivalence point.
 */
export function strongMixPH(molH: number, molOH: number, totalCm3: number): number {
  const litres = totalCm3 / 1000;
  const excess = molH - molOH;
  if (Math.abs(excess) < 1e-12) return 7;
  const pH = excess > 0 ? -Math.log10(excess / litres) : 14 + Math.log10(-excess / litres);
  return Math.min(14, Math.max(0, pH));
}
