/**
 * Reusable guided-simulation engine.
 *
 * A simulation supplies an ordered list of steps. Each step describes:
 * - the apparatus interaction point(s) the learner must use,
 * - the action(s) to dispatch when that point is used,
 * - a completion predicate over the simulation state.
 *
 * The engine itself is state-library agnostic; the React hook in
 * useGuidedSimulation.ts adds interaction tracking and hints.
 */

export type GuidedActionValue<A> = A | A[];

export type GuidedTarget<A> = {
  apparatusId: string;
  interactionPoint: string;
  label: string;
  /** Short action shown on the 3D pointer, e.g. "Clear the jet here". */
  pointerLabel?: string;
  action?: GuidedActionValue<A>;
  /** Reading targets open a contextual reading panel instead of dispatching. */
  kind?: "apparatus" | "reading";
  reading?: "initial" | "final";
};

export type GuidedContextAction<S, A> = {
  label: string;
  action: GuidedActionValue<A>;
  note?: string;
  variant?: "primary" | "ghost" | "danger";
  when?: (state: S) => boolean;
};

export type GuidedStep<S, A> = {
  id: string;
  title: string;
  instruction: string;
  why?: string;
  hint?: string;
  /** Short action shown on the 3D pointer when a target has no pointerLabel. */
  pointerLabel?: string;
  targets?: Array<GuidedTarget<A>>;
  complete: (state: S) => boolean;
  /** Actions that do not map to a physical apparatus (record, next trial, etc.). */
  contextActions?: Array<GuidedContextAction<S, A>>;
  /** Optional safe/unsafe alternatives that only matter on this step. */
  secondaryActions?: Array<GuidedContextAction<S, A>>;
  /** Repeatable steps keep the pointer on the same target until the predicate is met. */
  repeat?: boolean;
};

export type GuidedStepCursor<S, A> = {
  step: GuidedStep<S, A>;
  index: number;
  total: number;
};

export function currentGuidedStep<S, A>(steps: Array<GuidedStep<S, A>>, state: S): GuidedStepCursor<S, A> | null {
  const index = steps.findIndex((step) => !step.complete(state));
  if (index < 0) return null;
  return { step: steps[index]!, index, total: steps.length };
}

export function actionList<A>(value?: GuidedActionValue<A>): A[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function targetKey(target: Pick<GuidedTarget<unknown>, "apparatusId" | "interactionPoint">): string {
  return `${target.apparatusId}:${target.interactionPoint}`;
}

export function guidedTargetFor<A>(
  step: GuidedStep<unknown, A> | null | undefined,
  apparatusId: string,
  interactionPoint: string,
): GuidedTarget<A> | undefined {
  return step?.targets?.find((target) => target.apparatusId === apparatusId && target.interactionPoint === interactionPoint);
}

export function availableContextActions<S, A>(step: GuidedStep<S, A> | null | undefined, state: S): Array<GuidedContextAction<S, A>> {
  return (step?.contextActions ?? []).filter((action) => !action.when || action.when(state));
}

export function availableSecondaryActions<S, A>(step: GuidedStep<S, A> | null | undefined): Array<GuidedContextAction<S, A>> {
  return step?.secondaryActions ?? [];
}
