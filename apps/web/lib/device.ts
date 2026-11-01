"use client";

import { useEffect, useState } from "react";

export type ViewMode = "2d" | "3d";

export function detectWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function defaultViewMode(): ViewMode {
  if (typeof navigator === "undefined") return "2d";
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (!detectWebGL()) return "2d";
  if (saveData) return "2d";
  if (mem !== undefined && mem <= 2) return "2d";
  if (cores <= 2) return "2d";
  return "3d";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const SETTINGS_KEY = "expera-view-settings";

export function loadViewOverride(): ViewMode | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw === "2d" || raw === "3d") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveViewOverride(mode: ViewMode) {
  localStorage.setItem(SETTINGS_KEY, mode);
}

export function useViewMode(): [ViewMode, (m: ViewMode) => void, boolean] {
  const [mode, setMode] = useState<ViewMode>("2d");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const override = loadViewOverride();
    setMode(override ?? defaultViewMode());
    setReady(true);
  }, []);
  const set = (m: ViewMode) => {
    saveViewOverride(m);
    setMode(m);
  };
  return [mode, set, ready];
}
