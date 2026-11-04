import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEACHER_VOICE_CONFIG } from "./config";
import { TeacherVoiceService } from "./TeacherVoiceService";
import type { TeacherMessage, TeacherMessageKind, TeacherVoiceSnapshot } from "./types";

function message(id: string, kind: TeacherMessageKind, status: TeacherMessage["status"] = "approved"): TeacherMessage {
  return {
    id,
    module: "test",
    kind,
    status,
    priority: TEACHER_VOICE_CONFIG.priorities[kind],
    text: id,
    caption: id,
  };
}

function player() {
  return {
    play: vi.fn(async (_message: TeacherMessage, _volume: number) => undefined),
    stop: vi.fn(() => undefined),
  };
}

function createService(options: {
  messages?: TeacherMessage[];
  settings?: { enabled: boolean; volume: number };
  allowUnapproved?: boolean;
  onSnapshot?: (snapshot: TeacherVoiceSnapshot) => void;
} = {}) {
  const audio = player();
  const settings = options.settings ?? { enabled: true, volume: 1 };
  const service = new TeacherVoiceService({
    messages: options.messages ?? [
      message("instruction", "step_instruction"),
      message("safety", "safety"),
      message("draft", "step_instruction", "draft"),
    ],
    player: audio,
    settings: () => settings,
    allowUnapproved: options.allowUnapproved,
    onSnapshot: options.onSnapshot,
    now: () => Date.now(),
  });
  return { service, player: audio, settings };
}

describe("TeacherVoiceService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits for the initial delay before speaking a step instruction", async () => {
    const { service, player } = createService();
    service.handle({ type: "sceneReady", moduleId: "test" });
    service.handle({ type: "stepStarted", moduleId: "test", stepId: "step-1", messageId: "instruction" });

    await vi.advanceTimersByTimeAsync(TEACHER_VOICE_CONFIG.initialDelayMs - 1);
    expect(player.play).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(player.play).toHaveBeenCalledWith(expect.objectContaining({ id: "instruction" }), 1);
  });

  it("repeats the same hint at the repeat interval and stops after the prompt limit", async () => {
    const { service, player } = createService();
    service.handle({ type: "stepStarted", moduleId: "test", stepId: "step-1", messageId: "instruction" });

    await vi.advanceTimersByTimeAsync(TEACHER_VOICE_CONFIG.initialDelayMs);
    for (let index = 1; index < TEACHER_VOICE_CONFIG.maxPrompts; index += 1) {
      await vi.advanceTimersByTimeAsync(TEACHER_VOICE_CONFIG.repeatIntervalMs);
    }
    expect(player.play).toHaveBeenCalledTimes(TEACHER_VOICE_CONFIG.maxPrompts);

    await vi.advanceTimersByTimeAsync(TEACHER_VOICE_CONFIG.repeatIntervalMs);
    expect(player.play).toHaveBeenCalledTimes(TEACHER_VOICE_CONFIG.maxPrompts);
  });

  it("defers speech for the grace period after a student interaction", async () => {
    const { service, player } = createService();
    service.handle({ type: "stepStarted", moduleId: "test", stepId: "step-1", messageId: "instruction" });

    await vi.advanceTimersByTimeAsync(4_000);
    service.handle({ type: "interactionPerformed", moduleId: "test" });

    await vi.advanceTimersByTimeAsync(1_000);
    expect(player.play).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it("lets a safety warning replace a pending instruction", async () => {
    const { service, player } = createService();
    service.handle({ type: "stepStarted", moduleId: "test", stepId: "step-1", messageId: "instruction" });
    service.handle({ type: "safetyWarning", moduleId: "test", messageId: "safety" });

    await vi.advanceTimersByTimeAsync(0);
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(player.play).toHaveBeenCalledWith(expect.objectContaining({ id: "safety" }), 1);
  });

  it("suppresses instructions in explore mode but still speaks safety warnings", async () => {
    const { service, player } = createService();
    service.handle({ type: "modeChanged", moduleId: "test", mode: "explore" });
    service.handle({ type: "stepStarted", moduleId: "test", stepId: "step-1", messageId: "instruction" });

    await vi.advanceTimersByTimeAsync(TEACHER_VOICE_CONFIG.initialDelayMs);
    expect(player.play).not.toHaveBeenCalled();

    service.handle({ type: "safetyWarning", moduleId: "test", messageId: "safety" });
    await vi.advanceTimersByTimeAsync(0);
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(player.play).toHaveBeenCalledWith(expect.objectContaining({ id: "safety" }), 1);
  });

  it("only plays approved messages when unapproved content is disabled", async () => {
    const { service, player } = createService({ allowUnapproved: false });
    service.handle({ type: "stepStarted", moduleId: "test", stepId: "step-1", messageId: "draft" });

    await vi.advanceTimersByTimeAsync(TEACHER_VOICE_CONFIG.initialDelayMs);
    expect(player.play).not.toHaveBeenCalled();
  });

  it("stops when the module exits", async () => {
    const { service, player } = createService();
    service.handle({ type: "stepStarted", moduleId: "test", stepId: "step-1", messageId: "instruction" });
    service.handle({ type: "modeExited", moduleId: "test" });

    await vi.advanceTimersByTimeAsync(TEACHER_VOICE_CONFIG.initialDelayMs);
    expect(player.play).not.toHaveBeenCalled();
    expect(player.stop).toHaveBeenCalled();
  });

  it("can replay the last line on demand", async () => {
    const { service, player } = createService();
    service.handle({ type: "stepStarted", moduleId: "test", stepId: "step-1", messageId: "instruction" });
    await vi.advanceTimersByTimeAsync(TEACHER_VOICE_CONFIG.initialDelayMs);
    expect(player.play).toHaveBeenCalledTimes(1);

    service.handle({ type: "replayRequested" });
    await vi.advanceTimersByTimeAsync(0);
    expect(player.play).toHaveBeenCalledTimes(2);
  });
});
