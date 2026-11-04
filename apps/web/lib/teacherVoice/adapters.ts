const TITRATION_MISTAKES: Array<[needle: string, messageId: string]> = [
  ["filled without rinsing", "chemistry.titration.mistake.fill-without-rinse"],
  ["Record the initial reading after filling", "chemistry.titration.mistake.initial-before-fill"],
  ["initial reading was not taken at eye level", "chemistry.titration.mistake.parallax-initial"],
  ["Pipetting by mouth", "chemistry.titration.mistake.pipette-mouth"],
  ["Too much indicator", "chemistry.titration.mistake.indicator-too-much"],
  ["Fill the burette and record the initial reading", "chemistry.titration.mistake.deliver-before-ready"],
  ["no base in the conical flask", "chemistry.titration.mistake.no-base"],
  ["air bubble left the jet", "chemistry.titration.mistake.bubble-released"],
  ["end point was overshot", "chemistry.titration.mistake.overshot"],
  ["flask was not swirled", "chemistry.titration.mistake.not-swirled"],
  ["final reading taken off eye level", "chemistry.titration.mistake.parallax-final"],
];

export function titrationMistakeMessageId(text: string): string | null {
  const found = TITRATION_MISTAKES.find(([needle]) => text.includes(needle));
  return found?.[1] ?? null;
}

export function titrationStepMessageId(stepId: string): string {
  return `chemistry.titration.${stepId}.instruction`;
}

export function apparatusStageMessageId(stageId: string): string {
  return `chemistry.apparatus.${stageId}.instruction`;
}

export function safetyMessageId(ruleId: string): string {
  return `chemistry.safety.${ruleId}`;
}
