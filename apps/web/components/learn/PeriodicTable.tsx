"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Element } from "@/lib/content/schemas";
import { normaliseState, trendColour, trendScale, TREND_LABELS, type TrendKey } from "@/lib/engine/trends";
import { ElementDetailPanel } from "@/components/learn/ElementDetailPanel";
import { Button } from "@/components/ui";

const TYPE_STYLE: Record<Element["type"], { bg: string; label: string }> = {
  metal: { bg: "#cfe6f5", label: "M" },
  "non-metal": { bg: "#fde3b8", label: "N" },
  metalloid: { bg: "#d5eed9", label: "Md" },
};

type TableMode = "standard" | "trends" | "compare";

export function PeriodicTable({ elements, source }: { elements: Element[]; source: { dataset: string; licence: string } }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [period, setPeriod] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [tableMode, setTableMode] = useState<TableMode>("standard");
  const [trendKey, setTrendKey] = useState<TrendKey>("atomicRadius");
  const [selected, setSelected] = useState<Element>(elements[0]);
  const [compareA, setCompareA] = useState<Element | null>(null);
  const [compareB, setCompareB] = useState<Element | null>(null);

  const scale = useMemo(() => trendScale(elements, trendKey), [elements, trendKey]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return new Set(
      elements
        .filter((e) => {
          if (q && !e.name.toLowerCase().includes(q) && e.symbol.toLowerCase() !== q && String(e.atomicNumber) !== q) return false;
          if (group && String(e.group) !== group) return false;
          if (period && String(e.period) !== period) return false;
          if (type && e.type !== type) return false;
          if (state && normaliseState(e.stateAtRTP) !== state) return false;
          return true;
        })
        .map((e) => e.atomicNumber),
    );
  }, [elements, query, group, period, type, state]);

  const fRow = (z: number) => (z >= 58 && z <= 71 ? 9 : z >= 90 && z <= 103 ? 10 : null);
  const select = "min-h-11 rounded-lg border bg-white px-2";

  const pick = (e: Element) => {
    setSelected(e);
    if (tableMode === "compare") {
      if (!compareA || (compareA && compareB)) {
        setCompareA(e);
        setCompareB(null);
      } else setCompareB(e);
    }
  };

  const moveSelection = useCallback(
    (dz: number, dGroup: number) => {
      const idx = elements.findIndex((x) => x.atomicNumber === selected.atomicNumber);
      const next = elements[Math.max(0, Math.min(elements.length - 1, idx + dz + dGroup * 18))];
      if (next && matches.has(next.atomicNumber)) pick(next);
    },
    [elements, selected.atomicNumber, matches],
  );

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLSelectElement) return;
      if (ev.key === "ArrowRight") moveSelection(0, 1);
      if (ev.key === "ArrowLeft") moveSelection(0, -1);
      if (ev.key === "ArrowDown") moveSelection(1, 0);
      if (ev.key === "ArrowUp") moveSelection(-1, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveSelection]);

  const cellBg = (e: Element) => {
    if (tableMode !== "trends") return TYPE_STYLE[e.type].bg;
    const v = e[trendKey];
    return trendColour(v, scale);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={tableMode === "standard" ? "primary" : "ghost"} onClick={() => setTableMode("standard")}>
          Table
        </Button>
        <Button variant={tableMode === "trends" ? "primary" : "ghost"} onClick={() => setTableMode("trends")}>
          Trends
        </Button>
        <Button variant={tableMode === "compare" ? "primary" : "ghost"} onClick={() => setTableMode("compare")}>
          Compare
        </Button>
        {tableMode === "trends" && (
          <select className={select} value={trendKey} onChange={(e) => setTrendKey(e.target.value as TrendKey)} aria-label="Trend property">
            {(Object.keys(TREND_LABELS) as TrendKey[]).map((k) => (
              <option key={k} value={k}>
                {TREND_LABELS[k]}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="min-h-11 flex-1 rounded-lg border px-3" placeholder="Search name, symbol or atomic number" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search elements" />
        <select className={select} value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Filter by group">
          <option value="">All groups</option>
          {Array.from({ length: 18 }, (_, i) => (
            <option key={i} value={i + 1}>
              Group {i + 1}
            </option>
          ))}
        </select>
        <select className={select} value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Filter by period">
          <option value="">All periods</option>
          {Array.from({ length: 7 }, (_, i) => (
            <option key={i} value={i + 1}>
              Period {i + 1}
            </option>
          ))}
        </select>
        <select className={select} value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
          <option value="">All types</option>
          <option value="metal">Metals</option>
          <option value="non-metal">Non-metals</option>
          <option value="metalloid">Metalloids</option>
        </select>
        <select className={select} value={state} onChange={(e) => setState(e.target.value)} aria-label="Filter by state at room temperature">
          <option value="">All states</option>
          <option value="solid">Solid</option>
          <option value="liquid">Liquid</option>
          <option value="gas">Gas</option>
        </select>
      </div>
      <p className="text-sm text-slate-600" aria-live="polite">
        {matches.size} element{matches.size === 1 ? "" : "s"} match. Use arrow keys to move selection.
        {tableMode === "trends" && scale && ` Scale: ${TREND_LABELS[trendKey]}. Missing values are grey.`}
        {tableMode === "compare" && " Tap two elements to compare."}
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[760px] gap-0.5" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}>
          {elements.map((e) => {
            const row = fRow(e.atomicNumber);
            const col = row ? e.atomicNumber - (row === 9 ? 58 : 90) + 4 : (e.group ?? 3);
            const on = matches.has(e.atomicNumber);
            const pinned = compareA?.atomicNumber === e.atomicNumber || compareB?.atomicNumber === e.atomicNumber;
            return (
              <button
                key={e.atomicNumber}
                onClick={() => pick(e)}
                aria-label={`${e.name}, atomic number ${e.atomicNumber}, ${e.type}`}
                aria-pressed={selected.atomicNumber === e.atomicNumber}
                className={`relative aspect-square rounded border text-left leading-none ${selected.atomicNumber === e.atomicNumber ? "ring-2 ring-sky-700" : ""} ${pinned ? "ring-2 ring-amber-500" : ""} ${on ? "" : "opacity-20"}`}
                style={{
                  gridColumn: col,
                  gridRow: row ?? e.period,
                  background: on ? cellBg(e) : "#f1f5f9",
                  marginTop: row === 9 ? 8 : 0,
                  backgroundImage: tableMode === "trends" && e[trendKey] === null ? "repeating-linear-gradient(45deg, transparent, transparent 4px, #cbd5e1 4px, #cbd5e1 8px)" : undefined,
                }}
              >
                <span className="absolute left-0.5 top-0.5 text-[9px]">{e.atomicNumber}</span>
                {tableMode === "standard" && <span className="absolute right-0.5 top-0.5 text-[8px] text-slate-600">{TYPE_STYLE[e.type].label}</span>}
                <span className="flex h-full items-center justify-center text-sm font-bold">{e.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tableMode === "compare" && compareA && (
        <ComparePanel a={compareA} b={compareB} onClear={() => { setCompareA(null); setCompareB(null); }} />
      )}
      {tableMode !== "compare" && selected && <ElementDetailPanel e={selected} />}
      <p className="text-xs text-slate-500">
        Data: {source.dataset}. Licence: {source.licence}.
      </p>
    </div>
  );
}

function ComparePanel({ a, b, onClear }: { a: Element; b: Element | null; onClear: () => void }) {
  const fields: { key: TrendKey | "mass"; label: string; va: number | null; vb: number | null }[] = [
    { key: "mass", label: "Atomic mass (IUPAC)", va: a.atomicMassIupac, vb: b?.atomicMassIupac ?? null },
    { key: "atomicRadius", label: TREND_LABELS.atomicRadius, va: a.atomicRadius, vb: b?.atomicRadius ?? null },
    { key: "electronegativity", label: TREND_LABELS.electronegativity, va: a.electronegativity, vb: b?.electronegativity ?? null },
    { key: "ionisationEnergy", label: TREND_LABELS.ionisationEnergy, va: a.ionisationEnergy, vb: b?.ionisationEnergy ?? null },
  ];
  return (
    <section className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Compare: {a.symbol}
          {b ? ` and ${b.symbol}` : " (pick a second element)"}
        </h2>
        <Button variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </div>
      {b && (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-1 text-left">Property</th>
              <th>{a.symbol}</th>
              <th>{b.symbol}</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.label} className="border-b">
                <td className="py-1">{f.label}</td>
                <td className="text-center">{f.va ?? "—"}</td>
                <td className="text-center">{f.vb ?? "—"}</td>
              </tr>
            ))}
            <tr>
              <td>State</td>
              <td className="text-center">{a.stateAtRTP}</td>
              <td className="text-center">{b.stateAtRTP}</td>
            </tr>
            <tr>
              <td>Type</td>
              <td className="text-center">{a.type}</td>
              <td className="text-center">{b.type}</td>
            </tr>
          </tbody>
        </table>
      )}
    </section>
  );
}
