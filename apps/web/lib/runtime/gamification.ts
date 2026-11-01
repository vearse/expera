"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type GamificationState = {
  xp: number;
  completedMissions: Set<string>;
  badges: Set<string>;
  streakDays: string[];
  settings: { mute: boolean };
  addXp: (amount: number) => void;
  completeMission: (id: string, badgeId?: string) => void;
  recordActivity: () => void;
  setMute: (mute: boolean) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      completedMissions: new Set(),
      badges: new Set(),
      streakDays: [],
      settings: { mute: false },
      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),
      completeMission: (id, badgeId) =>
        set((s) => {
          const completedMissions = new Set(s.completedMissions);
          completedMissions.add(id);
          const badges = new Set(s.badges);
          if (badgeId) badges.add(badgeId);
          return { completedMissions, badges };
        }),
      recordActivity: () => {
        const d = today();
        const days = get().streakDays;
        if (days[days.length - 1] === d) return;
        set({ streakDays: [...days.filter((x) => x !== d), d].slice(-60) });
      },
      setMute: (mute) => set((s) => ({ settings: { ...s.settings, mute } })),
    }),
    {
      name: "expera-progress-v2",
      partialize: (s) => ({
        xp: s.xp,
        completedMissions: [...s.completedMissions],
        badges: [...s.badges],
        streakDays: s.streakDays,
        settings: s.settings,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<{ completedMissions: string[]; badges: string[] }> | undefined;
        return {
          ...current,
          ...(persisted as object),
          completedMissions: new Set(p?.completedMissions ?? []),
          badges: new Set(p?.badges ?? []),
        };
      },
    },
  ),
);

export function awardMissionXp(missionId: string, xp: number, badgeId?: string) {
  const g = useGamification.getState();
  if (g.completedMissions.has(missionId)) return;
  g.addXp(xp);
  g.completeMission(missionId, badgeId);
  g.recordActivity();
  if (!g.settings.mute && typeof window !== "undefined") {
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      o.frequency.value = 660;
      o.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.12);
    } catch {
      /* ignore */
    }
  }
}

export function levelFromXp(xp: number) {
  if (xp >= 80) return 3;
  if (xp >= 30) return 2;
  return 1;
}
