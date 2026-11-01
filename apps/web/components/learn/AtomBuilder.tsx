"use client";

import { create } from "zustand";
import { selectShells, type AtomState, ATOM_MISSIONS } from "@/lib/stores/atomStore";
import type { Element } from "@/lib/content/schemas";
import { shellsUpTo20, valencyFromOuter } from "@/lib/engine/formula";
import { useAtomMissions } from "@/components/learn/useAtomMissions";
import { Button } from "@/components/ui";
import { Bohr2D } from "@/components/atoms/Bohr2D";
import dynamic from "next/dynamic";
import { useViewMode } from "@/lib/device";
import { ViewToggle } from "@/components/learn/ElementDetailPanel";

const Atom3D = dynamic(() => import("@/components/atoms/Atom3D"), { ssr: false });

type Isotopes = Record<string, { mass: number; name?: string }[]>;

const useAtom = create<AtomState & { dispatch: (a: import("@/lib/stores/atomStore").AtomActions) => void }>((set) => ({
  protons: 11,
  neutrons: 12,
  electrons: 11,
  dispatch: (a) =>
    set((s) => {
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
      switch (a.type) {
        case "setProtons":
          return { ...s, protons: clamp(a.value, 1, 20) };
        case "setNeutrons":
          return { ...s, neutrons: clamp(a.value, 0, 26) };
        case "setElectrons":
          return { ...s, electrons: clamp(a.value, 0, 20) };
        case "addParticle":
          if (a.particle === "proton") return { ...s, protons: clamp(s.protons + 1, 1, 20) };
          if (a.particle === "neutron") return { ...s, neutrons: clamp(s.neutrons + 1, 0, 26) };
          return { ...s, electrons: clamp(s.electrons + 1, 0, 20) };
        case "loadMission":
          return { protons: a.protons, neutrons: a.neutrons, electrons: a.electrons };
        default:
          return s;
      }
    }),
}));

export function AtomBuilder({ elements, isotopes }: { elements: Element[]; isotopes: Isotopes }) {
  const { protons: p, neutrons: n, electrons: e, dispatch } = useAtom();
  useAtomMissions(p, n, e);
  const el = elements.find((x) => x.atomicNumber === p);
  const shells = selectShells({ protons: p, neutrons: n, electrons: e });
  const charge = p - e;
  const mass = p + n;
  const outer = shells[shells.length - 1] ?? 0;
  const known = el ? isotopes[el.symbol]?.find((i) => i.mass === mass) : undefined;
  const usual = el ? Math.round(el.atomicMassIupac) - p : null;
  const [mode, setMode, ready] = useViewMode();

  const counter = (label: string, value: number, dec: () => void, inc: () => void, max: number, colour: string) => (
    <div className="flex items-center gap-2">
      <span className="inline-block h-4 w-4 rounded-full" style={{ background: colour }} aria-hidden />
      <span className="w-24">{label}</span>
      <Button variant="ghost" aria-label={`Remove one ${label.toLowerCase()}`} disabled={value <= (label === "Protons" ? 1 : 0)} onClick={dec}>
        −
      </Button>
      <span className="w-8 text-center text-lg font-bold" aria-live="polite">
        {value}
      </span>
      <Button variant="ghost" aria-label={`Add one ${label.toLowerCase()}`} disabled={value >= max} onClick={inc}>
        +
      </Button>
    </div>
  );

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border bg-slate-50 p-3">
        <h2 className="font-semibold">Particle tray (drag or tap +)</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["proton", "neutron", "electron"] as const).map((part) => (
            <button
              key={part}
              type="button"
              draggable
              onDragStart={(ev) => ev.dataTransfer.setData("particle", part)}
              onClick={() => dispatch({ type: "addParticle", particle: part })}
              className="min-h-11 rounded-lg border bg-white px-3 capitalize"
            >
              + {part}
            </button>
          ))}
        </div>
        <div
          className="mt-3 min-h-24 rounded-lg border border-dashed border-sky-400 bg-white p-4"
          onDragOver={(ev) => ev.preventDefault()}
          onDrop={(ev) => {
            const part = ev.dataTransfer.getData("particle") as "proton" | "neutron" | "electron";
            if (part) dispatch({ type: "addParticle", particle: part });
          }}
        >
          Drop particles on the atom mat
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-3">
          {counter("Protons", p, () => dispatch({ type: "setProtons", value: p - 1 }), () => dispatch({ type: "addParticle", particle: "proton" }), 20, "#d55e00")}
          {counter("Neutrons", n, () => dispatch({ type: "setNeutrons", value: n - 1 }), () => dispatch({ type: "addParticle", particle: "neutron" }), 26, "#999999")}
          {counter("Electrons", e, () => dispatch({ type: "setElectrons", value: e - 1 }), () => dispatch({ type: "addParticle", particle: "electron" }), 20, "#0072b2")}
          <div className="rounded-xl border bg-white p-4" aria-live="polite">
            <h2 className="text-xl font-bold">
              {el ? `${el.name} (${el.symbol})` : "Unknown"}
              {charge !== 0 && <span className="ml-2 text-base font-semibold text-sky-800">ion, charge {charge > 0 ? `+${charge}` : charge}</span>}
            </h2>
            <dl className="mt-2 grid grid-cols-2 gap-1 text-sm">
              <dt>Mass number</dt>
              <dd className="font-medium">{mass}</dd>
              <dt>Electron arrangement</dt>
              <dd className="font-medium">{shells.join(", ") || "none"}</dd>
              {charge === 0 && (
                <>
                  <dt>Valency</dt>
                  <dd className="font-medium">{valencyFromOuter(outer, shells.length)}</dd>
                </>
              )}
            </dl>
            {known && <p className="mt-2 text-sm">Known isotope{known.name ? `: ${known.name}` : ""}.</p>}
            {usual !== null && n !== usual && !known && <p className="mt-2 text-sm">Common atom has {usual} neutrons.</p>}
          </div>
          <div>
            <h3 className="font-semibold">Missions</h3>
            <ul className="mt-1 flex flex-wrap gap-2">
              {ATOM_MISSIONS.map((m) => (
                <li key={m.id}>
                  <Button variant="ghost" onClick={() => dispatch({ type: "loadMission", protons: m.protons, neutrons: m.neutrons, electrons: m.electrons })}>
                    {m.title}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          {ready && <ViewToggle mode={mode} onChange={setMode} />}
          {mode === "3d" && ready ? (
            <Atom3D protons={p} neutrons={n} shells={shellsUpTo20(e)} name={el?.name ?? "Atom"} />
          ) : (
            <Bohr2D protons={p} neutrons={n} shells={shells} />
          )}
        </div>
      </div>
    </div>
  );
}
