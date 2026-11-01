import type { ModuleKind, ModuleSubject } from "./types";

export function moduleTopicPath(subject: ModuleSubject, kind: ModuleKind, id: string): string {
  return `/${subject}/${kind}/${id}`;
}

export function moduleRunPath(subject: ModuleSubject, kind: ModuleKind, id: string, mode?: "guided" | "explore"): string {
  const base = `${moduleTopicPath(subject, kind, id)}/run`;
  if (mode) return `${base}?mode=${mode}`;
  return base;
}
