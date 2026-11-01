"use client";

import { useEffect } from "react";
import { ATOM_MISSIONS, missionComplete } from "@/lib/stores/atomStore";
import { awardMissionXp, useGamification } from "@/lib/runtime/gamification";

export function useAtomMissions(protons: number, neutrons: number, electrons: number) {
  const completed = useGamification((s) => s.completedMissions);
  useEffect(() => {
    for (const m of ATOM_MISSIONS) {
      if (completed.has(m.id)) continue;
      if (missionComplete({ protons, neutrons, electrons }, m)) {
        awardMissionXp(m.id, m.xp, m.id === "na-23" ? "builder-na" : undefined);
      }
    }
  }, [protons, neutrons, electrons, completed]);
}
