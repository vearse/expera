import type { Apparatus, Conventions, Indicator, Substance } from "@/lib/content/schemas";
import type { QualFile } from "@/lib/content/schemas";
import type { z } from "zod";
import type { TaskOutcome } from "./progress";

export type Mode = "regular" | "exam";

export type LabData = {
  conventions: Conventions;
  indicators: Indicator[];
  substances: Substance[];
  apparatus: Apparatus[];
  qual: z.infer<typeof QualFile>;
};

export type BenchProps = {
  mode: Mode;
  seed: number;
  data: LabData;
  prompt: string;
  onDone: (outcome: Omit<TaskOutcome, "taskId" | "safety">) => void;
};
