"use client";

import { useState } from "react";
import type { EquationExercise, IonInfo, Molecule } from "@/lib/content/schemas";
import { ionicFormula, isBalanced, molarMass, sideTotals } from "@/lib/engine/formula";
import { CompoundDnDBench } from "@/components/learn/CompoundDnDBench";
import { Button, Feedback } from "@/components/ui";

const chargeLabel = (c: number) => `${Math.abs(c) === 1 ? "" : Math.abs(c)}${c > 0 ? "+" : "−"}`;

export function CompoundBench({ cations, anions, molecules, equations, masses }: { cations: IonInfo[]; anions: IonInfo[]; molecules: Molecule[]; equations: EquationExercise[]; masses: Record<string, number> }) {
  const [cat, setCat] = useState<IonInfo>(cations[0]);
  const [an, setAn] = useState<IonInfo>(anions[0]);
  const result = ionicFormula(cat, an);
  const name = `${cat.name} ${an.name}`;
  const mr = molarMass(result.formula, masses);

  return (
    <div className="grid gap-8">
      <CompoundDnDBench cations={cations} anions={anions} masses={masses} moleculeIds={molecules.map((m) => m.id)} />
      <section>
        <h2 className="text-lg font-semibold">Combine a cation and an anion</h2>
        <p className="text-sm text-slate-600">The charges must add up to zero.</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <IonPicker title="Cation (positive ion)" ions={cations} selected={cat} onSelect={setCat} />
          <IonPicker title="Anion (negative ion)" ions={anions} selected={an} onSelect={setAn} />
        </div>
        <div className="mt-4 rounded-xl border bg-white p-4" aria-live="polite">
          <p className="text-3xl font-bold">{result.formula}</p>
          <p className="mt-1 capitalize">{name}</p>
          <dl className="mt-2 grid grid-cols-2 gap-1 text-sm">
            <dt>Ions in one formula unit</dt>
            <dd>
              {result.nCation} × {cat.symbol}
              {chargeLabel(cat.charge)} and {result.nAnion} × {an.symbol}
              {chargeLabel(an.charge)}
            </dd>
            <dt>Charge check</dt>
            <dd>
              {result.nCation} × ({cat.charge > 0 ? "+" : ""}
              {cat.charge}) + {result.nAnion} × ({an.charge}) = 0
            </dd>
            <dt>Type of bond</dt>
            <dd>Ionic (electrovalent)</dd>
            <dt>Molar mass (WAEC masses)</dt>
            <dd>{mr} g mol-1</dd>
          </dl>
          <MoleCalculator formula={result.formula} mr={mr} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Covalent molecules</h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {molecules.map((m) => (
            <li key={m.id} className="rounded-lg border bg-white p-3 text-sm">
              <strong>{m.formula}</strong> – {m.name}: {m.bondType} bonds, {m.shape.toLowerCase()}, M = {molarMass(m.formula, masses)} g mol-1
            </li>
          ))}
        </ul>
        <p className="mt-1 text-sm">
          See them in 3D in the <a className="text-sky-700 underline" href="/chemistry/learn/molecules">Molecules and bonding viewer</a>.
        </p>
      </section>

      <EquationBalancer equations={equations} />
    </div>
  );
}

function IonPicker({ title, ions, selected, onSelect }: { title: string; ions: IonInfo[]; selected: IonInfo; onSelect: (i: IonInfo) => void }) {
  return (
    <fieldset>
      <legend className="font-medium">{title}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {ions.map((i) => (
          <button
            key={i.id}
            onClick={() => onSelect(i)}
            aria-pressed={selected.id === i.id}
            className={`min-h-11 rounded-lg border px-3 font-mono ${selected.id === i.id ? "border-sky-600 bg-sky-50" : "bg-white"}`}
            title={i.name}
          >
            {i.symbol}
            <sup>{chargeLabel(i.charge)}</sup>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function MoleCalculator({ formula, mr }: { formula: string; mr: number }) {
  const [mass, setMass] = useState("10");
  const m = Number(mass);
  return (
    <label className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      Mass of {formula}:
      <input inputMode="decimal" className="min-h-11 w-24 rounded-lg border px-2" value={mass} onChange={(e) => setMass(e.target.value)} aria-label={`Mass of ${formula} in grams`} />g →
      <span aria-live="polite">{Number.isFinite(m) && m >= 0 ? `amount = ${m} ÷ ${mr} = ${(m / mr).toPrecision(3)} mol` : "enter a mass"}</span>
    </label>
  );
}

function EquationBalancer({ equations }: { equations: EquationExercise[] }) {
  const [idx, setIdx] = useState(0);
  const eq = equations[idx];
  const species = [...eq.left, ...eq.right];
  const [coef, setCoef] = useState<number[]>(species.map(() => 1));
  const [checked, setChecked] = useState(false);
  const left = eq.left.map((f, i) => ({ formula: f, coefficient: coef[i] }));
  const right = eq.right.map((f, i) => ({ formula: f, coefficient: coef[eq.left.length + i] }));
  const ok = isBalanced(left, right);
  const lt = sideTotals(left);
  const rt = sideTotals(right);
  const go = (i: number) => {
    setIdx(i);
    setCoef([...equations[i].left, ...equations[i].right].map(() => 1));
    setChecked(false);
  };

  const term = (f: string, i: number) => (
    <span key={f + i} className="inline-flex items-center gap-1">
      <select className="min-h-11 rounded border bg-white px-1" value={coef[i]} onChange={(e) => setCoef(coef.map((c, j) => (j === i ? Number(e.target.value) : c)))} aria-label={`Coefficient for ${f}`}>
        {[1, 2, 3, 4, 5, 6].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
      <span className="font-mono">
        {f}
        {eq.states[i]}
      </span>
    </span>
  );

  return (
    <section>
      <h2 className="text-lg font-semibold">Balance the equation</h2>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-lg">
        {eq.left.map((f, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            {i > 0 && "+"}
            {term(f, i)}
          </span>
        ))}
        <span>→</span>
        {eq.right.map((f, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            {i > 0 && "+"}
            {term(f, eq.left.length + i)}
          </span>
        ))}
      </div>
      <table className="mt-3 text-sm">
        <thead>
          <tr>
            <th className="pr-4 text-left">Atom</th>
            <th className="pr-4">Left</th>
            <th>Right</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys({ ...lt, ...rt }).map((k) => (
            <tr key={k} className={lt[k] === rt[k] ? "" : "text-orange-700"}>
              <td className="pr-4">{k}</td>
              <td className="pr-4 text-center">{lt[k] ?? 0}</td>
              <td className="text-center">{rt[k] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => setChecked(true)}>Check</Button>
        <Button variant="ghost" onClick={() => go((idx + 1) % equations.length)}>
          Next equation
        </Button>
      </div>
      {checked && <Feedback ok={ok}>{ok ? "The same number of each atom appears on both sides." : "Some atoms are not balanced yet. Change only the numbers in front of formulae, never the formulae themselves."}</Feedback>}
    </section>
  );
}
