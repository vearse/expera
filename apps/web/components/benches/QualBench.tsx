"use client";

import { useMemo, useState } from "react";
import type { BenchProps } from "@/lib/runtime/types";
import { createRng } from "@/lib/engine/rng";
import { inferenceOptions, observe } from "@/lib/engine/qual";
import { Button, Feedback } from "@/components/ui";

type Row = { testId: string; observations: string; correctInferences: string[]; chosen: string };

export function QualBench({ mode, seed, data, onDone }: BenchProps) {
  const qual = data.qual;
  const salt = useMemo(() => createRng(seed).pick(qual.salts), [seed, qual.salts]);
  const options = useMemo(() => inferenceOptions(qual), [qual]);
  const [rows, setRows] = useState<Row[]>([]);
  const [cation, setCation] = useState("");
  const [anion, setAnion] = useState("");
  const [checked, setChecked] = useState(false);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const cols = data.conventions.qual.tableColumns;

  const runTest = (testId: string) => {
    const obs = observe(qual, salt.id, testId);
    setRows((r) => [...r, { testId, observations: obs.map((o) => o.observation).join(". "), correctInferences: obs.map((o) => o.inference), chosen: "" }]);
  };

  const check = () => {
    const found: string[] = [];
    rows.forEach((r) => {
      if (!r.correctInferences.includes(r.chosen)) {
        const t = qual.tests.find((x) => x.id === r.testId)!;
        found.push(`${t.name}: "${r.observations}" means "${r.correctInferences[0]}".`);
      }
    });
    if (cation !== salt.cation) found.push(`The cation was ${qual.cations.find((c) => c.id === salt.cation)!.ion}.`);
    if (anion !== salt.anion) found.push(`The anion was ${qual.anions.find((a) => a.id === salt.anion)!.ion}.`);
    if (mode === "exam" && rows.length > 8) found.push(`You used ${rows.length} tests. In the exam, plan your tests so you need fewer.`);
    setMistakes(found);
    setChecked(true);
  };

  const testButtons = (kind: "cation" | "anion") => (
    <div>
      <h3 className="text-sm font-semibold">{kind === "cation" ? "Tests for the cation" : "Tests for the anion"}</h3>
      <div className="mt-1 flex flex-wrap gap-2">
        {qual.tests
          .filter((t) => t.for === kind)
          .map((t) => (
            <Button key={t.id} variant="ghost" disabled={checked || rows.some((r) => r.testId === t.id)} onClick={() => runTest(t.id)} title={t.procedure}>
              {t.name}
            </Button>
          ))}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4">
      <div className="rounded-lg bg-slate-100 p-3 text-sm">
        <p>
          <strong>X</strong> is a simple salt containing one cation and one anion. Carry out tests on X, record your inferences and identify X.
        </p>
        {mode === "regular" && <p className="mt-1">Hint: start with NaOH(aq) in drops then in excess, and NH3(aq) in drops then in excess. Then test for the anion.</p>}
      </div>
      {testButtons("cation")}
      {testButtons("anion")}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-slate-100">
                {cols.map((c) => (
                  <th key={c} className="border p-2 text-left">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const t = qual.tests.find((x) => x.id === r.testId)!;
                const ok = r.correctInferences.includes(r.chosen);
                return (
                  <tr key={r.testId}>
                    <td className="border p-2 align-top">{t.procedure}</td>
                    <td className="border p-2 align-top">{r.observations}</td>
                    <td className={`border p-2 align-top ${checked ? (ok ? "bg-sky-50" : "bg-orange-50") : ""}`}>
                      <select
                        className="min-h-11 w-full rounded border bg-white px-2"
                        value={r.chosen}
                        disabled={checked}
                        onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, chosen: e.target.value } : x)))}
                        aria-label={`Inference for ${t.name}`}
                      >
                        <option value="">Choose inference…</option>
                        {options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2">
          Cation in X:
          <select className="min-h-11 rounded border bg-white px-2" value={cation} disabled={checked} onChange={(e) => setCation(e.target.value)}>
            <option value="">Choose…</option>
            {qual.cations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ion} ({c.name})
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Anion in X:
          <select className="min-h-11 rounded border bg-white px-2" value={anion} disabled={checked} onChange={(e) => setAnion(e.target.value)}>
            <option value="">Choose…</option>
            {qual.anions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.ion} ({a.name})
              </option>
            ))}
          </select>
        </label>
      </div>

      {!checked ? (
        <Button disabled={rows.length === 0 || rows.some((r) => !r.chosen) || !cation || !anion} onClick={check}>
          Submit identification
        </Button>
      ) : (
        <>
          <Feedback ok={mistakes.length === 0}>
            X was {salt.name}, {salt.formula}.
            {mistakes.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {mistakes.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </Feedback>
          <Button onClick={() => onDone({ correct: mistakes.length === 0, mistakes })}>Finish</Button>
        </>
      )}
    </div>
  );
}
