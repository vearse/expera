export function openEarlyAccess() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("expera-early-access"));
}
