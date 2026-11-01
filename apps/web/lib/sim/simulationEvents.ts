import { matchSafety, type SafetyEvent, type SafetyRuleInput, type SimulationEvent } from "./simulationTypes";

export type SimTransition<T> = {
  state: T;
  events: SimulationEvent[];
  safetyEvents: SafetyEvent[];
};

export function withSafety<T>(state: T, action: string, rules: SafetyRuleInput[], events: SimulationEvent[] = []): SimTransition<T> {
  const hit = matchSafety(action, rules);
  return { state, events, safetyEvents: hit ? [hit] : [] };
}
