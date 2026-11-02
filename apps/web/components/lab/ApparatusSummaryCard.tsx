"use client";

import { Button } from "@/components/ui";
import type { ApparatusState } from "@/lib/sim/apparatusStore";

export function ApparatusSummaryCard({ state, onClose }: { state: ApparatusState; onClose: () => void }) {
  return (
    <section className="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm" aria-label="Session summary">
      <h2 className="text-lg font-semibold text-emerald-950">Guided laboratory complete</h2>
      <p className="text-sm text-emerald-900">You finished all stages. Identified {state.identified.length} items · {state.mistakes.length} notes recorded for review.</p>
      <Button className="w-fit text-xs" onClick={onClose}>
        Close summary
      </Button>
    </section>
  );
}
