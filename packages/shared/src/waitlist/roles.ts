export const EARLY_ACCESS_ROLES = [
  "Student",
  "Parent or guardian",
  "Teacher or educator",
  "School representative",
  "University or tertiary student",
  "Professional",
  "Other",
] as const;

export type EarlyAccessRole = (typeof EARLY_ACCESS_ROLES)[number];
