import { loadApparatus, loadConventions, loadQual, loadReagents } from "./load";
import type { LabData } from "@/lib/runtime/types";

export function loadLabData(): LabData {
  const reagents = loadReagents();
  return {
    conventions: loadConventions(),
    indicators: reagents.indicators,
    substances: reagents.substances,
    apparatus: loadApparatus(),
    qual: loadQual(),
  };
}
