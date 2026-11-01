"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskOutcome = { taskId: string; correct: boolean; safety: boolean; mistakes: string[] };

export type SessionResult = {
  experimentId: string;
  mode: "regular" | "exam";
  seed: number;
  finishedAt: string;
  outcomes: TaskOutcome[];
};

type ProgressState = {
  results: Record<string, SessionResult>;
  visited: Record<string, string>;
  save: (r: SessionResult) => void;
  visit: (learnId: string) => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      results: {},
      visited: {},
      save: (r) => set((s) => ({ results: { ...s.results, [r.experimentId]: r } })),
      visit: (id) => set((s) => ({ visited: { ...s.visited, [id]: new Date().toISOString() } })),
    }),
    { name: "expera-progress-v1" },
  ),
);

export function summarise(outcomes: TaskOutcome[]) {
  const correct = outcomes.filter((o) => o.correct).length;
  const mistakes = outcomes.flatMap((o) => o.mistakes);
  const safetyErrors = outcomes.filter((o) => o.safety && !o.correct).length;
  return { correct, total: outcomes.length, mistakes, safetyErrors };
}
