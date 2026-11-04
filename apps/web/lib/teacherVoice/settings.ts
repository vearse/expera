"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TEACHER_VOICE_CONFIG } from "./config";

type TeacherVoiceSettingsState = {
  enabled: boolean;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
};

export const useTeacherVoiceSettings = create<TeacherVoiceSettingsState>()(
  persist(
    (set) => ({
      enabled: true,
      volume: 0.9,
      setEnabled: (enabled) => set({ enabled }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: TEACHER_VOICE_CONFIG.storageKey,
      version: 1,
      skipHydration: true,
      partialize: (state) => ({ enabled: state.enabled, volume: state.volume }),
    },
  ),
);

export function getTeacherVoiceSettings() {
  const state = useTeacherVoiceSettings.getState();
  return { enabled: state.enabled, volume: state.volume };
}
