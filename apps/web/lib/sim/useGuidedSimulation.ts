"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  actionList,
  currentGuidedStep,
  targetKey,
  type GuidedActionValue,
  type GuidedStep,
  type GuidedStepCursor,
  type GuidedTarget,
} from "./guidedSimulation";

export type GuidedSimulationController<S, A> = {
  current: GuidedStepCursor<S, A> | null;
  step: GuidedStep<S, A> | null;
  stepNumber: number;
  totalSteps: number;
  nextTarget: GuidedTarget<A> | null;
  nextInstruction: string;
  pointerLabel: string | null;
  armedKeys: string[];
  feedback: string | null;
  hintLevel: number;
  hintText: string | null;
  progress: number;
  interact: (apparatusId: string, interactionPoint: string) => void;
  runAction: (action: GuidedActionValue<A>, message?: string | null) => void;
  requestHint: () => void;
  clearFeedback: () => void;
};

export function useGuidedSimulation<S, A>({
  steps,
  state,
  dispatch,
  onSpecialTarget,
}: {
  steps: Array<GuidedStep<S, A>>;
  state: S;
  dispatch: (action: A) => void;
  onSpecialTarget?: (target: GuidedTarget<A>, step: GuidedStep<S, A>) => void;
}): GuidedSimulationController<S, A> {
  const current = useMemo(() => currentGuidedStep(steps, state), [steps, state]);
  const [armedKeys, setArmedKeys] = useState<string[]>([]);
  const armedRef = useRef<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const stepId = current?.step.id ?? null;

  useEffect(() => {
    armedRef.current = [];
    setArmedKeys([]);
    setFeedback(null);
    setHintLevel(0);
  }, [stepId]);

  const targets = current?.step.targets ?? [];
  const nextTarget = targets.find((target) => !armedKeys.includes(targetKey(target))) ?? null;

  const interact = useCallback(
    (apparatusId: string, interactionPoint: string) => {
      if (!current) return;
      const { step } = current;
      const stepTargets = step.targets ?? [];
      const target = stepTargets.find(
        (entry) => entry.apparatusId === apparatusId && entry.interactionPoint === interactionPoint,
      );
      if (!target) {
        setFeedback(`Not that one. ${step.instruction}`);
        return;
      }

      const key = targetKey(target);
      if (armedRef.current.includes(key)) return;
      const targetIndex = stepTargets.findIndex((entry) => targetKey(entry) === key);
      const missingEarlier = stepTargets
        .slice(0, targetIndex)
        .find((entry) => !armedRef.current.includes(targetKey(entry)));
      if (missingEarlier) {
        setFeedback(`First use the ${missingEarlier.label}.`);
        return;
      }

      if (target.kind === "reading") {
        onSpecialTarget?.(target, step);
        return;
      }

      for (const action of actionList(target.action)) dispatch(action);
      setHintLevel(0);

      if (step.repeat) {
        setFeedback(null);
        return;
      }

      const next = [...armedRef.current, key];
      armedRef.current = next;
      setArmedKeys(next);
      const remaining = stepTargets.filter((entry) => !next.includes(targetKey(entry)));
      setFeedback(remaining.length ? `Now use the ${remaining[0]!.label}.` : null);
    },
    [current, dispatch, onSpecialTarget],
  );

  const runAction = useCallback(
    (action: GuidedActionValue<A>, message?: string | null) => {
      for (const entry of actionList(action)) dispatch(entry);
      setHintLevel(0);
      setFeedback(message ?? null);
    },
    [dispatch],
  );

  const requestHint = useCallback(() => {
    setHintLevel((level) => Math.min(2, level + 1));
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const hintText = !current
    ? null
    : hintLevel === 0
      ? null
      : hintLevel === 1
        ? current.step.hint ?? current.step.instruction
        : current.step.why ?? current.step.hint ?? current.step.instruction;

  const stepTargetsDone = current?.step.repeat ? 0 : armedKeys.length;
  const stepFraction = current && current.step.targets?.length ? stepTargetsDone / current.step.targets.length : 0;
  const progress = current ? (current.index + stepFraction) / Math.max(1, current.total) : 1;

  const nextInstruction = !current
    ? ""
    : armedKeys.length > 0 && nextTarget
      ? `Now use the ${nextTarget.label}.`
      : current.step.instruction;

  const pointerLabel = !current
    ? null
    : nextTarget?.pointerLabel ?? current.step.pointerLabel ?? nextTarget?.label ?? current.step.title;

  return {
    current,
    step: current?.step ?? null,
    stepNumber: current ? current.index + 1 : steps.length,
    totalSteps: steps.length,
    nextTarget,
    nextInstruction,
    pointerLabel,
    armedKeys,
    feedback,
    hintLevel,
    hintText,
    progress,
    interact,
    runAction,
    requestHint,
    clearFeedback,
  };
}
