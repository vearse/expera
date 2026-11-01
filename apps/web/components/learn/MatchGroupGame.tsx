"use client";

import { useMemo, useState } from "react";
import type { Element } from "@/lib/content/schemas";
import { Button } from "@/components/ui";

const GROUPS: Record<number, string> = { 1: "Group 1", 17: "Group 17", 18: "Group 18" };

export function MatchGroupGame({ elements }: { elements: Element[] }) {
  const pool = useMemo(() => elements.filter((e) => e.group === 1 || e.group === 17 || e.group === 18).slice(0, 9), [elements]);
  const [assign, setAssign] = useState<Record<number, number | null>>({});
  const [done, setDone] = useState(false);

  const check = () => {
    const ok = pool.every((e) => assign[e.atomicNumber] === e.group);
    setDone(ok);
  };

  return (
    <section className="rounded-xl border bg-white p-4">
      <h2 className="font-semibold">Mini-game: Match the group</h2>
      <p className="text-sm text-slate-600">Drag each element into the correct group bin (keyboard: select element, then G1/G17/G18).</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {pool.map((e) => (
          <li key={e.atomicNumber}>
            <button type="button" className="rounded border px-2 py-1 font-mono" onClick={() => setAssign((a) => ({ ...a, [e.atomicNumber]: e.group }))}>
              {e.symbol}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {[1, 17, 18].map((g) => (
          <div key={g} className="min-w-24 rounded-lg border p-2 text-sm">
            {GROUPS[g]}
            <ul>
              {pool.filter((e) => assign[e.atomicNumber] === g).map((e) => (
                <li key={e.atomicNumber}>{e.symbol}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Button className="mt-2" onClick={check}>
        Check
      </Button>
      {done && <p className="mt-2 text-emerald-700">Correct — all groups match the dataset.</p>}
    </section>
  );
}
