import type { ModuleDetail, ModuleDetailParams, ModuleKind, ModuleSubject } from "@expera/shared";
import { getModuleDetail as getModuleDetailLocal, listModuleIds as listModuleIdsLocal } from "@expera/shared";

export type { ModuleDetail, ModuleDetailParams, ModuleKind, ModuleSubject };

/**
 * Module metadata for topic pages.
 * Uses MODULES_API_BASE_URL when set (Nest API), otherwise @expera/shared catalogue.
 */
export async function getModuleDetail(params: ModuleDetailParams): Promise<ModuleDetail | null> {
  const apiBase = process.env.MODULES_API_BASE_URL;
  if (apiBase) {
    try {
      const url = `${apiBase.replace(/\/$/, "")}/modules/${params.subject}/${params.kind}/${params.id}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) return (await res.json()) as ModuleDetail;
    } catch {
      // fall through to local catalogue
    }
  }

  return getModuleDetailLocal(params);
}

export async function listModuleIds(subject: ModuleDetailParams["subject"], kind: ModuleDetailParams["kind"]): Promise<string[]> {
  return listModuleIdsLocal(subject, kind);
}
