"use client";

import { useCallback, useEffect, useMemo } from "react";
import { emitTeacherEvent } from "./events";
import type { TeacherVoiceMode } from "./types";

type TeacherVoiceModuleOptions = {
  moduleId: string;
  mode?: TeacherVoiceMode | string;
  welcomeMessageId?: string;
};

export function useTeacherVoiceModule({ moduleId, mode = "guided", welcomeMessageId }: TeacherVoiceModuleOptions) {
  useEffect(() => {
    emitTeacherEvent({ type: "sceneReady", moduleId });
    if (welcomeMessageId) emitTeacherEvent({ type: "moduleStarted", moduleId, messageId: welcomeMessageId });
    return () => emitTeacherEvent({ type: "modeExited", moduleId });
  }, [moduleId, welcomeMessageId]);

  useEffect(() => {
    emitTeacherEvent({ type: "modeChanged", moduleId, mode });
  }, [mode, moduleId]);

  const notifyInteraction = useCallback(() => {
    emitTeacherEvent({ type: "interactionPerformed", moduleId });
  }, [moduleId]);

  const stepStarted = useCallback(
    (stepId: string, messageId: string) => {
      emitTeacherEvent({ type: "stepStarted", moduleId, stepId, messageId });
    },
    [moduleId],
  );

  const stepCompleted = useCallback(
    (stepId?: string) => {
      emitTeacherEvent({ type: "stepCompleted", moduleId, stepId });
    },
    [moduleId],
  );

  const message = useCallback(
    (messageId: string) => {
      emitTeacherEvent({ type: "teacherMessage", moduleId, messageId });
    },
    [moduleId],
  );

  const mistake = useCallback(
    (messageId: string, stepId?: string) => {
      emitTeacherEvent({ type: "mistakeDetected", moduleId, messageId, stepId });
    },
    [moduleId],
  );

  const safety = useCallback(
    (messageId: string) => {
      emitTeacherEvent({ type: "safetyWarning", moduleId, messageId });
    },
    [moduleId],
  );

  return useMemo(
    () => ({ notifyInteraction, stepStarted, stepCompleted, message, mistake, safety }),
    [message, mistake, notifyInteraction, safety, stepCompleted, stepStarted],
  );
}
