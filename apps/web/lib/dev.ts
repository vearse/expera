/**
 * Dev-facing controls (stage jumpers, review flags) are hidden from students.
 * Enable them locally with NEXT_PUBLIC_EXPERA_DEV_TOOLS=1.
 */
export function devToolsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_EXPERA_DEV_TOOLS === "1";
}
