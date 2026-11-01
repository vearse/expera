import Link from "next/link";
import { loadApparatus, loadConventions, loadReagents } from "@/lib/content/load";
import { loadSafetyRules } from "@/lib/engine/safety";
import { ApparatusLaboratory } from "@/components/lab/ApparatusLaboratory";
import { TitrationLaboratory } from "@/components/lab/TitrationLaboratory";
import { moduleTopicPath } from "@/lib/modules/paths";

export function ChemistryLabRun({ moduleId, mode }: { moduleId: string; mode: "guided" | "explore" }) {
  const topicHref = moduleTopicPath("chemistry", "lab", moduleId);
  const modeLabel = mode === "guided" ? "Guided" : "Explore";

  if (moduleId === "apparatus") {
    return (
      <div className="grid gap-4">
        <Link href={topicHref} className="text-sm text-primary hover:underline">
          ← Back to module overview
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{modeLabel} mode</p>
        <h1 className="text-2xl font-bold">Apparatus Laboratory</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          The whole storeroom is visible at once. Orbit the room, pick equipment off the shelves, drag it onto the workbench, and complete the identify, assemble and reading challenges.
        </p>
        <ApparatusLaboratory items={loadApparatus()} />
      </div>
    );
  }

  if (moduleId === "titration") {
    const indicator = loadReagents().indicators.find((item) => item.id === "phenolphthalein");
    if (!indicator) throw new Error("Phenolphthalein is missing from reagents.yaml");
    return (
      <div className="grid gap-4">
        <Link href={topicHref} className="text-sm text-primary hover:underline">
          ← Back to module overview
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{modeLabel} mode</p>
        <h1 className="text-2xl font-bold">Acid-base titration laboratory</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Handle the burette, pipette and flask yourself. The end point comes from the pH of the flask. Phenolphthalein starts pink in the alkali and turns colourless as the acid is run in.
        </p>
        <TitrationLaboratory rules={loadSafetyRules()} indicator={indicator} pipetteVolume={loadConventions().titration.pipetteVolume} />
      </div>
    );
  }

  return null;
}
