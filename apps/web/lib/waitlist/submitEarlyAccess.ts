import { EARLY_ACCESS_ROLES } from "@expera/shared";
import { z } from "zod";

export const earlyAccessBodySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  role: z.enum(EARLY_ACCESS_ROLES as unknown as [string, ...string[]]),
  institution: z.string().trim().max(200).optional(),
});

export type EarlyAccessBody = z.infer<typeof earlyAccessBodySchema>;

export function getEarlyAccessApiBase(): string | undefined {
  const dedicated = process.env.EARLY_ACCESS_API_BASE_URL?.trim();
  if (dedicated) return dedicated.replace(/\/$/, "");
  const modules = process.env.MODULES_API_BASE_URL?.trim();
  if (modules) return modules.replace(/\/$/, "");
  return undefined;
}
