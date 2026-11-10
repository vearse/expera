"use client";

import type { LabQualityChoice } from "@/lib/sim/labQuality";
import { useLabQualityApi } from "./LabQualityContext";

export function LabQualityControl() {
  const { quality, choice, setChoice } = useLabQualityApi();
  return (
    <label className="inline-flex min-h-10 w-full items-center justify-between gap-1.5 rounded-lg bg-white/90 px-2.5 text-[11px] font-semibold text-slate-700 shadow-sm sm:min-h-9 sm:w-auto sm:justify-start">
      Graphics
      <select
        aria-label="Laboratory graphics quality"
        value={choice}
        onChange={(event) => setChoice(event.target.value as LabQualityChoice)}
        className="bg-transparent text-[11px] font-semibold text-slate-800 outline-none"
      >
        <option value="auto">Auto ({quality})</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>
  );
}
