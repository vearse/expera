"use client";

import { useMemo, useState } from "react";
import type { BenchProps } from "@/lib/runtime/types";
import { classify, indicatorColour } from "@/lib/engine/ph";
import { createRng } from "@/lib/engine/rng";
import { Button, Feedback, Swatch } from "@/components/ui";

const KINDS = ["acidic", "neutral", "alkaline"] as const;

/** Test household substances with three indicators and classify them. */
export function IndicatorBench({ mode, seed, data, onDone }: BenchProps) {
  const samples = useMemo(() => {
    const clear = data.substances.filter((s) => s.pH <= 4 || s.pH >= 9 || s.pH === 7);
    const picked = createRng(seed).shuffle(clear).slice(0, 5);
    return picked.map((s, i) => ({ ...s, label: mode === "exam" ? `Sample ${String.fromCharCode(80 + i)}` : s.name }));
  }, [seed, data.substances, mode]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const wrong = samples.filter((s) => answers[s.id] !== classify(s.pH));

  return (
    <div className="grid gap-3">
      <p className="text-sm">A few drops of each indicator were added to separate portions of each sample. Use the colours to classify each sample.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">Sample</th>
              {data.indicators.map((i) => (
                <th key={i.id} className="border p-2 text-left">
                  {i.name}
                </th>
              ))}
              <th className="border p-2 text-left">Acidic, neutral or alkaline?</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id}>
                <td className="border p-2">{s.label}</td>
                {data.indicators.map((i) => {
                  const c = indicatorColour(i, s.pH);
                  return (
                    <td key={i.id} className="border p-2">
                      <Swatch hex={c.hex} name={c.name} />
                    </td>
                  );
                })}
                <td className={`border p-1 ${checked ? (answers[s.id] === classify(s.pH) ? "bg-sky-50" : "bg-orange-50") : ""}`}>
                  <select className="min-h-11 w-full rounded border bg-white px-2" value={answers[s.id] ?? ""} disabled={checked} onChange={(e) => setAnswers({ ...answers, [s.id]: e.target.value })} aria-label={`Classify ${s.label}`}>
                    <option value="">Choose…</option>
                    {KINDS.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mode === "regular" && <p className="text-xs text-slate-600">Hint: methyl orange is red below about pH 3.1; phenolphthalein turns pink above about pH 8.2 (approximate ranges); litmus is red in acid and blue in alkali.</p>}
      {!checked ? (
        <Button disabled={samples.some((s) => !answers[s.id])} onClick={() => setChecked(true)}>
          Check
        </Button>
      ) : (
        <>
          <Feedback ok={wrong.length === 0}>
            {samples.map((s) => `${s.label}: pH about ${s.pH}, ${classify(s.pH)}`).join("; ")}.
          </Feedback>
          <Button onClick={() => onDone({ correct: wrong.length === 0, mistakes: wrong.map((s) => `${s.label} is ${classify(s.pH)} (pH about ${s.pH}).`) })}>Next</Button>
        </>
      )}
    </div>
  );
}
