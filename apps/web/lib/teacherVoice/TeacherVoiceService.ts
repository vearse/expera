import { TEACHER_VOICE_CONFIG } from "./config";
import type {
  TeacherAudioPlayer,
  TeacherMessage,
  TeacherVoiceEvent,
  TeacherVoiceSettings,
  TeacherVoiceSnapshot,
  TeacherVoiceState,
} from "./types";

type TimerHandle = ReturnType<typeof setTimeout>;

type TeacherVoiceServiceOptions = {
  messages: TeacherMessage[];
  player: TeacherAudioPlayer;
  settings: () => TeacherVoiceSettings;
  allowUnapproved?: boolean;
  onSnapshot?: (snapshot: TeacherVoiceSnapshot) => void;
  now?: () => number;
  setTimer?: (callback: () => void, delayMs: number) => TimerHandle;
  clearTimer?: (timer: TimerHandle) => void;
};

const INSTRUCTION_KINDS = new Set(["step_instruction", "encouragement"]);

function isInstruction(message: TeacherMessage | null): boolean {
  return message !== null && INSTRUCTION_KINDS.has(message.kind);
}

export class TeacherVoiceService {
  private readonly messagesById: Map<string, TeacherMessage>;
  private readonly player: TeacherAudioPlayer;
  private readonly settings: () => TeacherVoiceSettings;
  private readonly allowUnapproved: boolean;
  private readonly onSnapshot?: (snapshot: TeacherVoiceSnapshot) => void;
  private readonly now: () => number;
  private readonly setTimer: (callback: () => void, delayMs: number) => TimerHandle;
  private readonly clearTimer: (timer: TimerHandle) => void;

  private state: TeacherVoiceState = "idle";
  private pending: TeacherMessage | null = null;
  private current: TeacherMessage | null = null;
  private lastMessage: TeacherMessage | null = null;
  private timer: TimerHandle | null = null;
  private promptCount = 0;
  private sceneReady = false;
  private moduleId: string | null = null;
  private mode = "guided";
  private scopeStartedAt = 0;
  private lastInteractionAt = 0;
  private blocked = false;
  private generation = 0;
  private warnedMissing = new Set<string>();

  constructor(options: TeacherVoiceServiceOptions) {
    this.messagesById = new Map(options.messages.map((message) => [message.id, message]));
    this.player = options.player;
    this.settings = options.settings;
    this.allowUnapproved = options.allowUnapproved ?? false;
    this.onSnapshot = options.onSnapshot;
    this.now = options.now ?? (() => Date.now());
    this.setTimer = options.setTimer ?? ((callback, delayMs) => setTimeout(callback, delayMs));
    this.clearTimer = options.clearTimer ?? ((timer) => clearTimeout(timer));
  }

  handle(event: TeacherVoiceEvent) {
    switch (event.type) {
      case "sceneReady":
        this.moduleId = event.moduleId;
        this.sceneReady = true;
        if (this.pending) this.schedule();
        else this.emitSnapshot();
        return;

      case "moduleStarted":
        this.moduleId = event.moduleId;
        this.sceneReady = true;
        if (event.messageId) {
          const message = this.resolve(event.messageId);
          if (message) this.enqueue(message, true);
        } else {
          this.emitSnapshot();
        }
        return;

      case "stepStarted": {
        this.moduleId = event.moduleId;
        this.sceneReady = true;
        this.interrupt();
        this.promptCount = 0;
        this.scopeStartedAt = this.now();
        const message = this.resolve(event.messageId);
        this.pending = message && this.canPlay(message) ? message : null;
        if (!this.pending) {
          this.state = "idle";
          this.emitSnapshot();
          return;
        }
        this.schedule();
        return;
      }

      case "stepCompleted":
        this.moduleId = event.moduleId;
        this.interrupt();
        this.pending = null;
        this.promptCount = 0;
        this.scopeStartedAt = 0;
        this.state = "idle";
        this.emitSnapshot();
        return;

      case "teacherMessage":
        this.moduleId = event.moduleId;
        this.publish(event.messageId, true);
        return;

      case "mistakeDetected":
        this.moduleId = event.moduleId;
        this.publish(event.messageId, true);
        return;

      case "safetyWarning":
        this.moduleId = event.moduleId;
        this.publish(event.messageId, true);
        return;

      case "modeChanged":
        this.moduleId = event.moduleId;
        this.mode = event.mode;
        if (!this.instructionsAllowed()) {
          if (isInstruction(this.current)) this.interrupt();
          if (isInstruction(this.pending)) {
            this.pending = null;
            this.clearSchedule();
          }
        }
        this.emitSnapshot();
        if (this.pending) this.schedule();
        return;

      case "modeExited":
        this.stop();
        return;

      case "interactionPerformed":
        this.lastInteractionAt = this.now();
        if (this.state === "waiting" || this.state === "cooldown") this.schedule();
        return;

      case "replayRequested":
        this.replay();
        return;

      case "settingsChanged":
        if (!this.settings().enabled) {
          this.stop();
          return;
        }
        if (this.state === "stopped") this.state = "idle";
        this.emitSnapshot();
        if (this.pending) this.schedule();
        return;

      case "routeChanged":
        this.stop();
        return;
    }
  }

  replay() {
    if (!this.lastMessage || !this.settings().enabled) return;
    this.interrupt();
    this.pending = this.lastMessage;
    this.promptCount = 0;
    this.scopeStartedAt = this.now();
    this.blocked = false;
    this.schedule(0);
  }

  unlock() {
    this.blocked = false;
    if (this.pending) {
      this.schedule(0);
      return;
    }
    this.replay();
  }

  stop() {
    this.interrupt();
    this.pending = null;
    this.promptCount = 0;
    this.scopeStartedAt = 0;
    this.state = "stopped";
    this.emitSnapshot();
  }

  private publish(messageId: string, resetPromptCount: boolean) {
    const message = this.resolve(messageId);
    if (!message) return;
    this.enqueue(message, resetPromptCount);
  }

  private enqueue(message: TeacherMessage, resetPromptCount: boolean) {
    if (!this.canPlay(message)) return;

    if (this.current?.id === message.id) return;
    if (this.pending?.id === message.id && !resetPromptCount) return;

    if (this.current && message.priority > this.current.priority) {
      this.interrupt();
    } else if (this.pending && message.priority < this.pending.priority) {
      return;
    }

    const changed = this.pending?.id !== message.id;
    this.pending = message;
    if (resetPromptCount || changed) {
      this.promptCount = 0;
      this.scopeStartedAt = this.now();
    }
    this.schedule();
  }

  private canPlay(message: TeacherMessage): boolean {
    if (!this.settings().enabled) return false;
    if (!this.allowUnapproved && message.status !== "approved") return false;
    if (!this.instructionsAllowed() && isInstruction(message)) return false;
    return true;
  }

  private instructionsAllowed(): boolean {
    return this.mode !== "explore" && this.mode !== "exam" && this.mode !== "independent";
  }

  private resolve(messageId: string): TeacherMessage | null {
    const message = this.messagesById.get(messageId);
    if (message) return message;
    if (process.env.NODE_ENV !== "production" && !this.warnedMissing.has(messageId)) {
      this.warnedMissing.add(messageId);
      console.warn(`[teacher-voice] Missing message "${messageId}".`);
    }
    return null;
  }

  private schedule(delayOverride?: number, nextState: TeacherVoiceState = "waiting") {
    this.clearSchedule();
    if (!this.pending) {
      this.state = "idle";
      this.emitSnapshot();
      return;
    }
    if (this.state === "speaking") {
      this.emitSnapshot();
      return;
    }
    if (!this.settings().enabled) {
      this.state = "stopped";
      this.emitSnapshot();
      return;
    }
    if (!this.sceneReady) {
      this.state = "idle";
      this.emitSnapshot();
      return;
    }
    if (!this.canPlay(this.pending)) {
      this.pending = null;
      this.state = "idle";
      this.emitSnapshot();
      return;
    }
    if (this.promptCount >= TEACHER_VOICE_CONFIG.maxPrompts) {
      this.pending = null;
      this.state = "idle";
      this.emitSnapshot();
      return;
    }

    const now = this.now();
    const priorityMessage = this.pending.kind === "safety" || this.pending.kind === "mistake";
    const baseDelay =
      delayOverride ??
      (priorityMessage
        ? 0
        : this.promptCount === 0
          ? Math.max(0, this.scopeStartedAt + TEACHER_VOICE_CONFIG.initialDelayMs - now)
          : TEACHER_VOICE_CONFIG.repeatIntervalMs);
    const graceRemaining =
      this.lastInteractionAt > 0
        ? Math.max(0, this.lastInteractionAt + TEACHER_VOICE_CONFIG.gracePeriodMs - now)
        : 0;
    const delayMs = Math.max(baseDelay, graceRemaining);

    this.state = nextState;
    this.emitSnapshot();
    this.timer = this.setTimer(() => {
      this.timer = null;
      void this.speak();
    }, delayMs);
  }

  private async speak() {
    const message = this.pending;
    if (!message || !this.canPlay(message)) {
      this.state = "idle";
      this.emitSnapshot();
      return;
    }

    this.current = message;
    this.state = "speaking";
    this.emitSnapshot();

    const generation = ++this.generation;
    try {
      await this.player.play(message, this.settings().volume);
    } catch {
      if (generation !== this.generation) return;
      this.current = null;
      this.blocked = true;
      this.state = "idle";
      this.emitSnapshot();
      return;
    }

    if (generation !== this.generation) return;

    this.current = null;
    this.lastMessage = message;
    this.promptCount += 1;
    this.blocked = false;

    if (this.promptCount >= TEACHER_VOICE_CONFIG.maxPrompts) {
      this.pending = null;
      this.state = "idle";
      this.emitSnapshot();
      return;
    }

    this.state = "cooldown";
    this.emitSnapshot();
    this.schedule(undefined, "cooldown");
  }

  private interrupt() {
    this.clearSchedule();
    this.generation += 1;
    this.player.stop();
    this.current = null;
    this.state = "idle";
  }

  private clearSchedule() {
    if (this.timer !== null) {
      this.clearTimer(this.timer);
      this.timer = null;
    }
  }

  private emitSnapshot() {
    this.onSnapshot?.({
      state: this.state,
      caption: this.current ? (this.current.caption ?? this.current.text) : null,
      messageId: this.current?.id ?? this.pending?.id ?? this.lastMessage?.id ?? null,
      promptCount: this.promptCount,
      blocked: this.blocked,
      enabled: this.settings().enabled,
    });
  }
}

export function createTeacherVoiceService(options: TeacherVoiceServiceOptions) {
  return new TeacherVoiceService(options);
}

export type { TeacherVoiceServiceOptions };
