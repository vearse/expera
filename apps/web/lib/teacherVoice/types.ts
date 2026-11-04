import { z } from "zod";

export const TeacherMessageKind = z.enum(["safety", "mistake", "step_instruction", "encouragement"]);
export type TeacherMessageKind = z.infer<typeof TeacherMessageKind>;

export const TeacherMessageStatus = z.enum(["draft", "reviewed", "approved"]);
export type TeacherMessageStatus = z.infer<typeof TeacherMessageStatus>;

export const TeacherMessageSchema = z.object({
  id: z.string().min(1),
  module: z.string().min(1),
  step: z.string().optional(),
  kind: TeacherMessageKind,
  priority: z.number().int().optional(),
  status: TeacherMessageStatus,
  text: z.string().min(1),
  caption: z.string().optional(),
  audio: z.string().optional(),
});

export const TeacherMessagesFileSchema = z.object({
  version: z.literal(1),
  messages: z.array(TeacherMessageSchema),
});

export type TeacherMessage = z.infer<typeof TeacherMessageSchema> & {
  priority: number;
};

export type TeacherMessageCatalog = {
  messages: TeacherMessage[];
};

export type TeacherVoiceMode = "guided" | "explore" | "exam" | "independent" | "learn";

export type TeacherVoiceSettings = {
  enabled: boolean;
  volume: number;
};

export type TeacherVoiceState = "idle" | "waiting" | "speaking" | "cooldown" | "stopped";

export type TeacherVoiceSnapshot = {
  state: TeacherVoiceState;
  caption: string | null;
  messageId: string | null;
  promptCount: number;
  blocked: boolean;
  enabled: boolean;
};

export type TeacherVoiceEvent =
  | { type: "sceneReady"; moduleId: string }
  | { type: "moduleStarted"; moduleId: string; messageId?: string }
  | { type: "stepStarted"; moduleId: string; stepId: string; messageId: string }
  | { type: "stepCompleted"; moduleId: string; stepId?: string }
  | { type: "teacherMessage"; moduleId: string; messageId: string }
  | { type: "mistakeDetected"; moduleId: string; messageId: string; stepId?: string }
  | { type: "safetyWarning"; moduleId: string; messageId: string }
  | { type: "modeChanged"; moduleId: string; mode: TeacherVoiceMode | string }
  | { type: "modeExited"; moduleId: string }
  | { type: "interactionPerformed"; moduleId?: string }
  | { type: "replayRequested" }
  | { type: "settingsChanged" }
  | { type: "routeChanged"; pathname: string };

export type TeacherAudioPlayer = {
  play: (message: TeacherMessage, volume: number) => Promise<void>;
  stop: () => void;
};
