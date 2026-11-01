"use client";

import dynamic from "next/dynamic";
import type { Element } from "@/lib/content/schemas";
import { useViewMode, type ViewMode } from "@/lib/device";
import { Bohr2D, neutronsFromElement } from "@/components/atoms/Bohr2D";
import { Button, ReviewBadge } from "@/components/ui";

const Atom3D = dynamic(() => import("@/components/atoms/Atom3D"), { ssr: false, loading: () => <p className="text-sm text-slate-600">Loading 3D…</p> });

export function ViewToggle({ mode, onChange, webgl }: { mode: ViewMode; onChange: (m: ViewMode) => void; webgl?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant={mode === "2d" ? "primary" : "ghost"} onClick={() => onChange("2d")}>
        2D
      </Button>
      <Button variant={mode === "3d" ? "primary" : "ghost"} disabled={webgl === false} onClick={() => onChange("3d")}>
        3D
      </Button>
    </div>
  );
}

export function ElementAtomViews({ e }: { e: Element }) {
  const [mode, setMode, ready] = useViewMode();
  const n = neutronsFromElement(e.atomicNumber, e.atomicMassIupac);
  const label = `${e.name}: ${e.atomicNumber} protons, ${n} neutrons, shells ${e.shells.join(", ")}`;
  if (!ready) return null;
  return (
    <div className="grid gap-2">
      <ViewToggle mode={mode} onChange={setMode} />
      {mode === "3d" ? (
        <Atom3D protons={e.atomicNumber} neutrons={n} shells={e.shells} name={e.name} />
      ) : (
        <Bohr2D protons={e.atomicNumber} neutrons={n} shells={e.shells} label={label} />
      )}
      {e.atomicNumber > 20 && <p className="text-xs text-slate-600">Shell diagram uses the simplified SS arrangement taught up to calcium; inner f-electrons are grouped.</p>}
    </div>
  );
}

export function ElementDetailPanel({ e }: { e: Element }) {
  const rows: [string, string][] = [
    ["Atomic number", String(e.atomicNumber)],
    ["Relative atomic mass (IUPAC)", String(e.atomicMassIupac)],
    ["Relative atomic mass (WAEC calculations)", e.atomicMassExam === null ? "Not on the WAEC list" : String(e.atomicMassExam)],
    ["Group", e.group === null ? (e.atomicNumber < 90 ? "Lanthanide" : "Actinide") : String(e.group)],
    ["Period", String(e.period)],
    ["Block", e.block],
    ["Metal or non-metal", e.type],
    ["State at room temperature", e.stateAtRTP],
    ["Electron arrangement", e.shells.join(", ")],
    ["Electron configuration", e.electronConfiguration],
  ];
  if (e.atomicRadius != null) rows.push(["Atomic radius (pm)", String(e.atomicRadius)]);
  if (e.electronegativity != null) rows.push(["Electronegativity", String(e.electronegativity)]);
  if (e.ionisationEnergy != null) rows.push(["First ionisation energy (eV)", String(e.ionisationEnergy)]);

  return (
    <section className="rounded-xl border bg-white p-4" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-bold">
          {e.name} ({e.symbol})
        </h2>
        <ReviewBadge status={e.review} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ElementAtomViews e={e} />
        <dl className="grid gap-x-6 gap-y-1 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 border-b py-1">
              <dt className="text-slate-600">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <ListBlock title="Common uses" items={e.uses} empty="Not yet written." />
        <ListBlock title="Where found or used" items={e.occurrence} empty="Not yet written." />
        <ListBlock title="In Nigeria" items={e.nigerianExamples} empty="No Nigerian example yet." />
      </div>
    </section>
  );
}

function ListBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      {items.length ? (
        <ul className="list-disc pl-5 text-sm">
          {items.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{empty}</p>
      )}
    </div>
  );
}
