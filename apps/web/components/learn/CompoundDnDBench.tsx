"use client";

import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import type { IonInfo } from "@/lib/content/schemas";
import { combinePair } from "@/lib/engine/combine";
import { ionicFormula, molarMass } from "@/lib/engine/formula";
import { Button } from "@/components/ui";

function DraggableIon({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;
  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes} className="min-h-11 rounded-lg border bg-white px-3 font-mono">
      {label}
    </button>
  );
}

function Mat() {
  const { setNodeRef, isOver } = useDroppable({ id: "mat" });
  return (
    <div ref={setNodeRef} className={`min-h-32 rounded-xl border-2 border-dashed p-4 ${isOver ? "border-sky-600 bg-sky-50" : "border-slate-300"}`}>
      Drop cation and anion tokens here
    </div>
  );
}

export function CompoundDnDBench({
  cations,
  anions,
  masses,
  moleculeIds,
}: {
  cations: IonInfo[];
  anions: IonInfo[];
  masses: Record<string, number>;
  moleculeIds: string[];
}) {
  const [onMat, setOnMat] = useState<{ kind: "cation" | "anion"; ion: IonInfo }[]>([]);

  const onDragEnd = (ev: DragEndEvent) => {
    if (ev.over?.id !== "mat") return;
    const id = String(ev.active.id);
    const cat = cations.find((c) => c.id === id);
    const an = anions.find((a) => a.id === id);
    if (cat) setOnMat((m) => [...m.filter((x) => x.kind !== "cation"), { kind: "cation", ion: cat }]);
    if (an) setOnMat((m) => [...m.filter((x) => x.kind !== "anion"), { kind: "anion", ion: an }]);
  };

  const cat = onMat.find((x) => x.kind === "cation")?.ion;
  const an = onMat.find((x) => x.kind === "anion")?.ion;
  const combine =
    cat && an
      ? combinePair(
          { kind: "cation", id: cat.id, symbol: cat.symbol },
          { kind: "anion", id: an.id, symbol: an.symbol },
          cations,
          anions,
          new Set(moleculeIds),
        )
      : null;
  const ionic = cat && an ? ionicFormula(cat, an) : null;

  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">Drag-and-drop combine bench</h2>
      <DndContext onDragEnd={onDragEnd}>
        <div className="flex flex-wrap gap-2">
          {cations.map((c) => (
            <DraggableIon key={c.id} id={c.id} label={`${c.symbol}+`} />
          ))}
          {anions.map((a) => (
            <DraggableIon key={a.id} id={a.id} label={`${a.symbol}−`} />
          ))}
        </div>
        <Mat />
      </DndContext>
      {combine && !combine.ok && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">Why can&apos;t these combine? {combine.reason}</p>}
      {ionic && combine?.ok && (
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{ionic.formula}</p>
          <p className="text-sm">Molar mass: {molarMass(ionic.formula, masses)} g mol-1</p>
        </div>
      )}
      <Button variant="ghost" onClick={() => setOnMat([])}>
        Clear mat
      </Button>
    </section>
  );
}
