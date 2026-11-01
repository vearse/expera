"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Molecule } from "@/lib/content/schemas";
import { Button, ReviewBadge } from "@/components/ui";
import { Molecule2D } from "./Molecule2D";

const Molecule3D = dynamic(() => import("./Molecule3D"), {
  ssr: false,
  loading: () => <p className="text-sm text-slate-600">Loading 3D view…</p>,
});

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function MoleculeViewer({ molecules }: { molecules: Molecule[] }) {
  const [selected, setSelected] = useState(molecules[0]);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [showBondLengths, setShowBondLengths] = useState(false);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const ok = supportsWebGL();
    setWebgl(ok);
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (ok && (memory === undefined || memory > 2)) setView("3d");
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a molecule">
        {molecules.map((m) => (
          <button key={m.id} onClick={() => setSelected(m)} aria-pressed={selected.id === m.id} className={`min-h-11 rounded-lg border px-3 ${selected.id === m.id ? "border-sky-600 bg-sky-50" : "bg-white"}`}>
            {m.formula} <span className="text-sm text-slate-600">{m.name}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant={view === "2d" ? "primary" : "ghost"} onClick={() => setView("2d")}>
          2D
        </Button>
        <Button variant={view === "3d" ? "primary" : "ghost"} disabled={!webgl} onClick={() => setView("3d")}>
          3D
        </Button>
        {!webgl && <span className="text-sm text-slate-600">3D is not available on this device; showing 2D.</span>}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showBondLengths} onChange={(e) => setShowBondLengths(e.target.checked)} />
          Show bond lengths (pm)
        </label>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        {view === "3d" ? <Molecule3D m={selected} /> : <Molecule2D m={selected} />}
        <div className="rounded-xl border bg-white p-4" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">
              {selected.name} ({selected.formula})
            </h2>
            <ReviewBadge status={selected.review} />
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-1 text-sm">
            <dt>Bond type</dt>
            <dd className="capitalize">{selected.bondType}</dd>
            <dt>Shape</dt>
            <dd>{selected.shape}</dd>
            <dt>Bond angle</dt>
            <dd>{selected.bondAngle}</dd>
            <dt>Lone pairs on central atom</dt>
            <dd>{selected.lonePairs}</dd>
            {showBondLengths && selected.bondLengths.length > 0 && (
              <>
                <dt>Bond lengths</dt>
                <dd>
                  {selected.bondLengths.map((b) => (
                    <span key={b.bond} className="mr-2">
                      {b.bond}: {b.pm} pm
                    </span>
                  ))}
                </dd>
              </>
            )}
          </dl>
          {showBondLengths && selected.bondLengths.length === 0 && <p className="text-sm text-slate-500">Bond lengths not yet authored for this molecule.</p>}
          <p className="mt-2 text-sm text-slate-600">Lone pairs repel bonding pairs more strongly, which is why water and ammonia have smaller bond angles than methane.</p>
          {view === "3d" && <p className="mt-2 text-xs text-slate-600">Drag to rotate. Scroll or pinch to zoom.</p>}
        </div>
      </div>
    </div>
  );
}
