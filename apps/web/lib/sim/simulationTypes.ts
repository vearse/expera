export type SimulationEvent = {
  id: string;
  message: string;
  xp?: number;
  badgeId?: string;
};

export type SafetyEvent = {
  ruleId: string;
  action: string;
  severity: "error" | "warning";
  message: string;
  safeProcedure: string;
};

export type SafetyRuleInput = {
  id: string;
  pattern: string;
  message: string;
  severity: "error" | "warning";
  safeProcedure?: string;
};

export function matchSafety(action: string, rules: SafetyRuleInput[]): SafetyEvent | null {
  const rule = rules.find((r) => r.pattern === action);
  if (!rule) return null;
  return {
    ruleId: rule.id,
    action,
    severity: rule.severity,
    message: rule.message,
    safeProcedure: rule.safeProcedure ?? rule.message,
  };
}
