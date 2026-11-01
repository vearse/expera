"use client";

import { useMemo, useState } from "react";
import type { BenchProps } from "@/lib/runtime/types";
import { createRng, roundTo } from "@/lib/engine/rng";
import { isValidReading, readingIsAccurate } from "@/lib/engine/titration";
import { Button, Feedback } from "@/components/ui";
import { BuretteScale } from "./Burette";

type Check = { ok: boolean; message: string };

function ReadingRound({ levels, render, unit, check, onDone, hint, mode }: {
  levels: number[];
  render: (level: number) => React.ReactNode;
  unit: string;
  check: (text: string, level: number) => Check;
  onDone: BenchProps["onDone"];
  hint: string;
  mode: BenchProps["mode"];
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [result, setResult] = useState<Check | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const level = levels[i];
  const submit = () => {
    const r = check(text, level);
    setResult(r);
    if (!r.ok) setMistakes((m) => [...m, r.message]);
  };
  const next = () => {
    if (i + 1 >= levels.length) {
      onDone({ correct: mistakes.length === 0, mistakes });
      return;
    }
    setI(i + 1);
    setText("");
    setResult(null);
  };
  return (
    <div className="grid gap-3">
      <p className="text-sm">
        Reading {i + 1} of {levels.length}
      </p>
      {render(level)}
      <label className="flex flex-wrap items-center gap-2">
        Reading:
        <input inputMode="decimal" className="min-h-11 w-32 rounded-lg border px-3" value={text} disabled={!!result} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !result && submit()} aria-label={`Reading in ${unit}`} />
        {unit}
      </label>
      {mode === "regular" && <p className="text-xs text-slate-600">Hint: {hint}</p>}
      {!result ? (
        <Button disabled={!text} onClick={submit}>
          Check
        </Button>
      ) : (
        <>
          <Feedback ok={result.ok}>{result.message}</Feedback>
          <Button onClick={next}>{i + 1 >= levels.length ? "Finish" : "Next reading"}</Button>
        </>
      )}
    </div>
  );
}

export function BuretteReadingBench({ mode, seed, data, onDone }: BenchProps) {
  const t = data.conventions.titration;
  const levels = useMemo(() => {
    const rng = createRng(seed);
    return [0, 1, 2].map(() => roundTo(rng.range(1, 48), mode === "exam" ? 0.01 : 0.05));
  }, [seed, mode]);
  return (
    <ReadingRound
      levels={levels}
      mode={mode}
      unit="cm3"
      onDone={onDone}
      hint="Numbers increase downwards. Read the bottom of the meniscus at eye level and record to 2 decimal places."
      render={(level) => <BuretteScale level={level} />}
      check={(text, level) => {
        if (!isValidReading(text, t.readingDecimalPlaces)) return { ok: false, message: `Record burette readings to ${t.readingDecimalPlaces} decimal places (the reading was about ${level.toFixed(2)} cm3).` };
        const ok = readingIsAccurate(Number(text), level, t.readingResolution);
        return { ok, message: ok ? `Good: the meniscus was at about ${level.toFixed(2)} cm3.` : `The meniscus was at about ${level.toFixed(2)} cm3.` };
      }}
    />
  );
}

/** 100 cm3 measuring cylinder graduated in 1 cm3; numbers increase upwards. */
function CylinderScale({ level }: { level: number }) {
  const span = 10;
  const bottom = level - span / 2;
  const h = 260;
  const px = h / span;
  const y = (v: number) => h - (v - bottom) * px;
  const ticks: number[] = [];
  for (let v = Math.ceil(bottom); v <= bottom + span; v++) ticks.push(v);
  const my = y(level);
  return (
    <svg width={170} height={h} viewBox={`0 0 170 ${h}`} role="img" aria-label="Close-up of a measuring cylinder scale. Read the bottom of the meniscus.">
      <rect x={50} y={0} width={60} height={h} fill="#fff" stroke="#334155" strokeWidth={2} />
      <path d={`M51 ${my - 8} Q80 ${my + 8} 109 ${my - 8} L109 ${h} L51 ${h} Z`} fill="#e8f1fb" stroke="#64748b" />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={50} x2={50 + (v % 5 === 0 ? 26 : 12)} y1={y(v)} y2={y(v)} stroke="#0f172a" strokeWidth={v % 5 === 0 ? 2 : 1} />
          {v % 5 === 0 && (
            <text x={44} y={y(v) + 5} textAnchor="end" fontSize={15} fontWeight={600}>
              {v}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function CylinderReadingBench({ mode, seed, onDone }: BenchProps) {
  const levels = useMemo(() => {
    const rng = createRng(seed);
    return [0, 1].map(() => roundTo(rng.range(12, 92), mode === "exam" ? 0.5 : 1));
  }, [seed, mode]);
  return (
    <ReadingRound
      levels={levels}
      mode={mode}
      unit="cm3"
      onDone={onDone}
      hint="Numbers increase upwards. Each small division is 1 cm3. Read the bottom of the meniscus."
      render={(level) => <CylinderScale level={level} />}
      check={(text, level) => {
        const ok = Math.abs(Number(text) - level) <= 0.5 + 1e-9;
        return { ok, message: ok ? `Good: about ${level} cm3.` : `The bottom of the meniscus was at about ${level} cm3.` };
      }}
    />
  );
}

/** Paper chromatography: measure distances and calculate Rf = distance moved by spot ÷ distance moved by solvent. */
export function RfBench({ mode, seed, onDone }: BenchProps) {
  const { front, spots } = useMemo(() => {
    const rng = createRng(seed);
    const front = mode === "exam" ? roundTo(rng.range(7, 9.5), 0.1) : 8;
    const spots = [roundTo(rng.range(1.5, front / 2), 0.1), roundTo(rng.range(front / 2 + 0.5, front - 0.8), 0.1)];
    return { front, spots };
  }, [seed, mode]);
  const [answers, setAnswers] = useState(["", ""]);
  const [checked, setChecked] = useState(false);
  const rf = spots.map((s) => s / front);
  const ok = answers.map((a, i) => Math.abs(Number(a) - rf[i]) <= 0.02);
  const H = 300;
  const px = 28;
  const base = H - 20;
  return (
    <div className="grid gap-3">
      <p className="text-sm">Black ink was spotted on the baseline and the paper was stood in water. Two dyes separated.</p>
      <svg width={260} height={H} viewBox={`0 0 260 ${H}`} role="img" aria-label="Chromatogram with a ruler. Distances are measured from the baseline.">
        <rect x={60} y={10} width={90} height={H - 20} fill="#fff" stroke="#334155" />
        <line x1={60} x2={150} y1={base - 0.6 * px} y2={base - 0.6 * px} stroke="#94a3b8" />
        <line x1={60} x2={150} y1={base - front * px} y2={base - front * px} stroke="#0072b2" strokeDasharray="5 3" />
        <text x={155} y={base - front * px + 4} fontSize={11} fill="#0072b2">
          solvent front
        </text>
        <text x={155} y={base + 4} fontSize={11}>
          baseline
        </text>
        <line x1={60} x2={150} y1={base} y2={base} stroke="#0f172a" />
        <circle cx={105} cy={base - spots[0] * px} r={7} fill="#e69f00" />
        <circle cx={105} cy={base - spots[1] * px} r={7} fill="#56b4e9" />
        <text x={118} y={base - spots[0] * px + 4} fontSize={12}>
          A
        </text>
        <text x={118} y={base - spots[1] * px + 4} fontSize={12}>
          B
        </text>
        {Array.from({ length: 101 }, (_, i) => i / 10).map((cm) => (
          <line key={cm} x1={40} x2={40 + (Number.isInteger(cm) ? 14 : Math.round(cm * 10) % 5 === 0 ? 10 : 6)} y1={base - cm * px} y2={base - cm * px} stroke="#0f172a" strokeWidth={Number.isInteger(cm) ? 1.5 : 0.7} />
        ))}
        {Array.from({ length: 11 }, (_, i) => i).map((cm) => (
          <text key={cm} x={34} y={base - cm * px + 4} fontSize={11} textAnchor="end">
            {cm}
          </text>
        ))}
      </svg>
      {mode === "regular" && (
        <p className="text-sm">
          Solvent front: {front.toFixed(1)} cm. Spot A: {spots[0].toFixed(1)} cm. Spot B: {spots[1].toFixed(1)} cm (from the baseline).
        </p>
      )}
      {["A", "B"].map((n, i) => (
        <label key={n} className="flex items-center gap-2">
          Rf of dye {n}:
          <input inputMode="decimal" className="min-h-11 w-28 rounded-lg border px-3" value={answers[i]} disabled={checked} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))} aria-label={`Rf of dye ${n}`} />
        </label>
      ))}
      {!checked ? (
        <Button disabled={answers.some((a) => !a)} onClick={() => setChecked(true)}>
          Check
        </Button>
      ) : (
        <>
          <Feedback ok={ok.every(Boolean)}>
            Rf = distance moved by the dye ÷ distance moved by the solvent. A: {spots[0].toFixed(1)} ÷ {front.toFixed(1)} = {rf[0].toFixed(2)}. B: {spots[1].toFixed(1)} ÷ {front.toFixed(1)} = {rf[1].toFixed(2)}.
          </Feedback>
          <Button onClick={() => onDone({ correct: ok.every(Boolean), mistakes: ok.flatMap((o, i) => (o ? [] : [`Rf of dye ${"AB"[i]} should be ${rf[i].toFixed(2)}.`])) })}>Next</Button>
        </>
      )}
    </div>
  );
}
