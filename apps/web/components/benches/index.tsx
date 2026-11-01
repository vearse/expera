import type { ComponentType } from "react";
import type { BenchProps } from "@/lib/runtime/types";
import { TitrationBench } from "./TitrationBench";
import { QualBench } from "./QualBench";
import { IndicatorBench } from "./IndicatorBench";
import { NeutraliseBench } from "./NeutraliseBench";
import { BuretteReadingBench, CylinderReadingBench, RfBench } from "./ReadingBenches";

export const BENCHES: Partial<Record<string, ComponentType<BenchProps>>> = {
  titration: TitrationBench,
  qual: QualBench,
  indicator: IndicatorBench,
  neutralise: NeutraliseBench,
  "burette-reading": BuretteReadingBench,
  "cylinder-reading": CylinderReadingBench,
  rf: RfBench,
};
