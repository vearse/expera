import { getLocalChemistryModule, listChemistryModuleIds } from "./catalogue/chemistry";
import type { ModuleDetail, ModuleDetailParams } from "./types";

/** Resolve module metadata from the in-repo catalogue (same data the API will serve). */
export function getModuleDetail(params: ModuleDetailParams): ModuleDetail | null {
  if (params.subject === "chemistry") {
    return getLocalChemistryModule(params.kind, params.id);
  }
  return null;
}

export function listModuleIds(subject: ModuleDetailParams["subject"], kind: ModuleDetailParams["kind"]): string[] {
  if (subject === "chemistry") {
    return listChemistryModuleIds(kind);
  }
  return [];
}
