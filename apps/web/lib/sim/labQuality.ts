export type LabQuality = "low" | "medium" | "high";
export type LabQualityChoice = LabQuality | "auto";

const STORAGE_KEY = "expera-lab-quality";

function gpuRenderer(): string {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return "";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    if (!info) return "";
    return String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? "");
  } catch {
    return "";
  }
}

function isLowGpu(renderer: string): boolean {
  const r = renderer.toLowerCase();
  return (
    r.includes("mali-4") ||
    r.includes("mali-t") ||
    r.includes("adreno 3") ||
    r.includes("adreno 4") ||
    r.includes("adreno 5") ||
    r.includes("powervr") ||
    r.includes("intel hd") ||
    r.includes("intel(r) hd") ||
    r.includes("swiftshader") ||
    r.includes("llvmpipe")
  );
}

export function detectLabQuality(): LabQuality {
  if (typeof navigator === "undefined") return "medium";
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const smallScreen = typeof window !== "undefined" && Math.min(window.innerWidth, window.innerHeight) < 720;
  const gpu = gpuRenderer();

  if (saveData) return "low";
  if (mem !== undefined && mem <= 2) return "low";
  if (cores <= 2) return "low";
  if (smallScreen && (mem === undefined || mem <= 4)) return "low";
  if (isLowGpu(gpu)) return "low";
  if (mem !== undefined && mem >= 8 && cores >= 6 && !smallScreen && !isLowGpu(gpu)) return "high";
  return "medium";
}

export function loadLabQualityChoice(): LabQualityChoice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "low" || raw === "medium" || raw === "high" || raw === "auto") return raw;
  } catch {
    /* ignore */
  }
  return "auto";
}

export function saveLabQualityChoice(choice: LabQualityChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }
}

export function resolveLabQuality(choice: LabQualityChoice, detected: LabQuality): LabQuality {
  return choice === "auto" ? detected : choice;
}

export function textureSizeFor(quality: LabQuality): number {
  return quality === "low" ? 512 : 1024;
}

export function anisotropyFor(quality: LabQuality, max: number): number {
  if (quality === "low") return Math.min(4, max);
  if (quality === "medium") return Math.min(8, max);
  return Math.min(16, max);
}
