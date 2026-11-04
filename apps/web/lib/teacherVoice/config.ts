export const TEACHER_VOICE_CONFIG = {
  initialDelayMs: 5_000,
  repeatIntervalMs: 20_000,
  maxPrompts: 5,
  counterScope: "per-hint" as const,
  gracePeriodMs: 1_500,
  storageKey: "expera-teacher-voice-v1",
  speech: {
    lang: "en-GB",
    rate: 0.98,
    pitch: 1,
    volume: 1,
  },
  priorities: {
    safety: 100,
    mistake: 80,
    step_instruction: 60,
    encouragement: 20,
  },
} as const;

export type TeacherVoiceConfig = typeof TEACHER_VOICE_CONFIG;
