"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  detectLabQuality,
  loadLabQualityChoice,
  resolveLabQuality,
  saveLabQualityChoice,
  type LabQuality,
  type LabQualityChoice,
} from "@/lib/sim/labQuality";

type Api = {
  quality: LabQuality;
  detected: LabQuality;
  choice: LabQualityChoice;
  setChoice: (choice: LabQualityChoice) => void;
};

const LabQualityContext = createContext<Api | null>(null);

export function LabQualityProvider({ children }: { children: ReactNode }) {
  const [detected, setDetected] = useState<LabQuality>("medium");
  const [choice, setChoiceState] = useState<LabQualityChoice>("medium");
  const dropped = useRef(false);

  useEffect(() => {
    const auto = detectLabQuality();
    setDetected(auto);
    setChoiceState(loadLabQualityChoice());
  }, []);

  useEffect(() => {
    if (choice !== "auto" || dropped.current) return;
    let frames = 0;
    let acc = 0;
    let last = performance.now();
    let id = 0;
    const sample = (now: number) => {
      const dt = now - last;
      last = now;
      if (frames > 8) acc += dt;
      frames += 1;
      if (frames >= 50) {
        const avg = acc / Math.max(1, frames - 8);
        if (avg > 38 && detected !== "low") {
          dropped.current = true;
          setDetected((prev) => (prev === "high" ? "medium" : "low"));
        }
        return;
      }
      id = requestAnimationFrame(sample);
    };
    id = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(id);
  }, [choice, detected]);

  const setChoice = (next: LabQualityChoice) => {
    saveLabQualityChoice(next);
    setChoiceState(next);
  };

  const quality = resolveLabQuality(choice, detected);
  const value = useMemo(() => ({ quality, detected, choice, setChoice }), [choice, detected, quality]);

  return <LabQualityContext.Provider value={value}>{children}</LabQualityContext.Provider>;
}

export function useLabQuality(): LabQuality {
  return useContext(LabQualityContext)?.quality ?? "medium";
}

export function useLabQualityApi(): Api {
  const ctx = useContext(LabQualityContext);
  if (!ctx) {
    return {
      quality: "medium",
      detected: "medium",
      choice: "medium",
      setChoice: () => undefined,
    };
  }
  return ctx;
}
