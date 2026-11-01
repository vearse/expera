"use client";

import { useState } from "react";
import type { Indicator, Substance } from "@/lib/content/schemas";
import { classify, indicatorColour, strongMixPH } from "@/lib/engine/ph";
import { ReviewBadge, Swatch } from "@/components/ui";
import { Beaker3DPreview, ParticleCanvas } from "@/components/learn/PhParticles";

/** Approximate universal indicator colours; labels are always printed beside them. */
const UNIVERSAL = ["#c8323c", "#d8452f", "#e5602c", "#ee7f2a", "#f3a32b", "#f2c63a", "#d8d43c", "#7fbf4d", "#3fa66b", "#2c8f86", "#2f74b5", "#3b5cb0", "#4a46a3", "#5a3496", "#5b2a85"];

export function PHExplorer({ substances, indicators }: { substances: Substance[]; indicators: Indicator[] }) {
  const [selected, setSelected] = useState<Substance>(substances[0]);
  const [ph, setPh] = useState(substances[0].pH);
  const nearest = substances.reduce((a, b) => (Math.abs(b.pH - ph) < Math.abs(a.pH - ph) ? b : a), substances[0]);
  const uni = UNIVERSAL[Math.min(14, Math.max(0, Math.round(ph)))];
  return (
    <div className="grid gap-6">
      <section>
        <h2 className="text-lg font-semibold">pH slider</h2>
        <label className="mt-2 block text-sm">
          pH {ph.toFixed(1)}
          <input type="range" min={0} max={14} step={0.1} value={ph} onChange={(e) => setPh(Number(e.target.value))} className="mt-1 w-full" aria-valuemin={0} aria-valuemax={14} />
        </label>
        <p className="text-sm text-slate-600">
          Universal indicator colour: <Swatch hex={uni} name={`pH ${Math.round(ph)}`} /> · Nearest example: {nearest.name} (pH ≈ {nearest.pH})
        </p>
        <ParticleCanvas ph={ph} />
        <Beaker3DPreview ph={ph} colour={uni} />
      </section>
      <section>
        <h2 className="text-lg font-semibold">The pH scale</h2>
        <div className="mt-2 flex" role="img" aria-label="pH scale from 0, strongly acidic, to 14, strongly alkaline">
          {UNIVERSAL.map((c, i) => (
            <div key={i} className="flex-1 py-1 text-center text-xs font-bold text-white" style={{ background: c }}>
              {i}
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-600">
          <span>Strongly acidic</span>
          <span>Neutral (7)</span>
          <span>Strongly alkaline</span>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {substances.map((s) => (
            <li key={s.id}>
              <button
                className={`flex min-h-11 w-full items-center justify-between rounded-lg border px-3 text-left text-sm ${selected.id === s.id ? "border-sky-600 bg-sky-50" : "bg-white"}`}
                aria-pressed={selected.id === s.id}
                onClick={() => setSelected(s)}
              >
                <span>
                  {s.name}
                  {s.nigerian && <span className="ml-1 text-xs text-emerald-800">(Nigerian example)</span>}
                </span>
                <span className="font-semibold">pH ≈ {s.pH}</span>
              </button>
            </li>
          ))}
        </ul>
        <SubstanceCard s={selected} indicators={indicators} />
      </section>
      <Neutralisation indicators={indicators} />
    </div>
  );
}

function SubstanceCard({ s, indicators }: { s: Substance; indicators: Indicator[] }) {
  const kind = classify(s.pH);
  const hExp = -s.pH;
  return (
    <div className="mt-3 rounded-xl border bg-white p-4" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{s.name}</h3>
        <ReviewBadge status={s.review} />
      </div>
      <p className="mt-1">
        pH about <strong>{s.pH}</strong>: <strong>{kind}</strong>. {kind === "acidic" ? "There are more H+ ions than OH- ions." : kind === "alkaline" ? "There are more OH- ions than H+ ions." : "H+ and OH- ions are equal."}
      </p>
      <p className="text-sm text-slate-600">
        [H+] ≈ 10<sup>{hExp}</sup> mol dm-3. Each step of 1 on the pH scale is a 10-fold change in [H+].
      </p>
      {s.note && <p className="text-sm text-slate-600">{s.note}</p>}
      <h4 className="mt-2 text-sm font-semibold">Indicator colours</h4>
      <ul className="text-sm">
        {indicators.map((ind) => {
          const c = indicatorColour(ind, s.pH);
          return (
            <li key={ind.id}>
              {ind.name}: <Swatch hex={c.hex} name={c.name} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Neutralisation({ indicators }: { indicators: Indicator[] }) {
  const [acid, setAcid] = useState(0);
  const base = 10;
  const pH = strongMixPH(acid * 0.0001, base * 0.0001, 10 + acid);
  const phen = indicators.find((i) => i.id === "phenolphthalein")!;
  const c = indicatorColour(phen, pH);
  const water = Math.min(acid, base);
  const leftH = Math.max(0, acid - base);
  const leftOH = Math.max(0, base - acid);
  const dots = [
    ...Array.from({ length: leftH }, () => ({ k: "H+", fill: "#d55e00" })),
    ...Array.from({ length: leftOH }, () => ({ k: "OH-", fill: "#0072b2" })),
    ...Array.from({ length: water }, () => ({ k: "H2O", fill: "#cbd5e1" })),
  ];
  return (
    <section>
      <h2 className="text-lg font-semibold">Particle view of neutralisation</h2>
      <p className="text-sm text-slate-600">The flask holds sodium hydroxide (10 OH- shown). Add hydrochloric acid one portion at a time. Each H+ joins an OH- to make H2O.</p>
      <p className="mt-1 font-mono text-sm">H+(aq) + OH-(aq) → H2O(l)</p>
      <label className="mt-2 flex items-center gap-3">
        Portions of acid added: <strong>{acid}</strong>
        <input type="range" min={0} max={20} value={acid} onChange={(e) => setAcid(Number(e.target.value))} className="flex-1" aria-label="Portions of acid added" />
      </label>
      <div className="mt-2 flex flex-wrap gap-1 rounded-lg border bg-white p-3" aria-hidden>
        {dots.map((d, i) => (
          <span key={i} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: d.fill, color: d.k === "H2O" ? "#0f172a" : "#fff" }}>
            {d.k}
          </span>
        ))}
      </div>
      <p className="mt-2" aria-live="polite">
        H+ left: {leftH}, OH- left: {leftOH}, water formed: {water}. pH ≈ {pH.toFixed(1)} ({classify(pH)}). Phenolphthalein: <Swatch hex={c.hex} name={c.name} />
      </p>
    </section>
  );
}
