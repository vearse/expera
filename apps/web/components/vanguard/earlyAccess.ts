export type WaitlistPreset = "student" | "teacher" | "school";

const WAITLIST_PRESETS: readonly WaitlistPreset[] = ["student", "teacher", "school"];

export function isWaitlistPreset(value: unknown): value is WaitlistPreset {
  return typeof value === "string" && (WAITLIST_PRESETS as readonly string[]).includes(value);
}

export function openEarlyAccess(preset?: WaitlistPreset) {
  if (typeof window === "undefined") return;
  const normalized = isWaitlistPreset(preset) ? preset : null;
  window.dispatchEvent(new CustomEvent("expera-early-access", { detail: { preset: normalized } }));
}
