import { Suspense } from "react";
import { listExperimentIds, loadExperiment } from "@/lib/content/load";
import { PRACTICE_ORDER } from "@/lib/content/catalogue";
import { ChemistryHubTabs } from "@/components/chemistry/ChemistryHubTabs";

export default function ChemistryHubPage() {
  const available = new Set(listExperimentIds());
  const benches = PRACTICE_ORDER.filter((id) => available.has(id)).map((id) => {
    const e = loadExperiment(id);
    return { id: e.id, title: e.title, scope: e.scope, review: e.review };
  });

  return (
    <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
      <ChemistryHubTabs benches={benches} />
    </Suspense>
  );
}
