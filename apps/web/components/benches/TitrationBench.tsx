"use client";

import { useMemo, useState } from "react";
import type { BenchProps } from "@/lib/runtime/types";
import { indicatorColour } from "@/lib/engine/ph";
import { roundTo } from "@/lib/engine/rng";
import { average, calculate, closeTo, concordantSet, equivalenceVolume, flaskPH, isValidReading, makeProblem, readingIsAccurate } from "@/lib/engine/titration";
import { Button, Feedback, Swatch } from "@/components/ui";
import { BuretteScale, Flask } from "./Burette";

type Recorded = { initial: number; final: number; trueInitial: number; trueFinal: number; overshoot: number };

const PREP = [
  {
    id: "burette",
    q: "What do you rinse the burette with before filling it with the acid?",
    options: ["Distilled water only", "The acid (solution A)", "The base (solution B)"],
    answer: 1,
    why: "Rinse with the solution it will hold, so water left inside does not dilute the acid.",
  },
  {
    id: "pipette",
    q: "What do you rinse the pipette with?",
    options: ["Distilled water only", "The base (solution B)", "The acid (solution A)"],
    answer: 1,
    why: "Rinse the pipette with the solution it will measure.",
  },
  {
    id: "flask",
    q: "What do you rinse the conical flask with?",
    options: ["Distilled water", "The base (solution B)", "The acid (solution A)"],
    answer: 0,
    why: "Only distilled water: extra base left in the flask would change the number of moles you titrate.",
  },
  {
    id: "filler",
    q: "How do you draw solution B into the pipette?",
    options: ["By mouth", "With a pipette filler"],
    answer: 1,
    why: "Safety: never pipette by mouth.",
    safety: true,
  },
  {
    id: "indicator",
    q: "Which indicator do you add (2 or 3 drops)?",
    options: ["Methyl orange", "Phenolphthalein", "Litmus"],
    answer: -1,
    why: "For a strong acid and a strong base, methyl orange or phenolphthalein gives a sharp end point. Litmus changes too gradually.",
  },
];
const INDICATOR_IDS = ["methyl-orange", "phenolphthalein", "litmus"];

export function TitrationBench({ mode, seed, data, onDone }: BenchProps) {
  const conv = data.conventions.titration;
  const { problem, trials } = useMemo(() => makeProblem(mode, seed, conv.pipetteVolume), [mode, seed, conv.pipetteVolume]);
  const [phase, setPhase] = useState<"prep" | "trials" | "table" | "calc" | "done">("prep");
  const [mistakes, setMistakes] = useState<string[]>([]);
  const addMistake = (m: string) => setMistakes((ms) => [...ms, m]);

  // Prep
  const [prep, setPrep] = useState<Record<string, number>>({});
  const [prepChecked, setPrepChecked] = useState(false);
  const indicator = data.indicators.find((i) => i.id === INDICATOR_IDS[prep.indicator ?? 0])!;

  // Trials
  const [trialIdx, setTrialIdx] = useState(0);
  const [added, setAdded] = useState(0);
  const [step, setStep] = useState<"initial" | "titrate" | "final">("initial");
  const [reading, setReading] = useState("");
  const [readingError, setReadingError] = useState<string | null>(null);
  const [records, setRecords] = useState<Recorded[]>([]);
  const [pendingInitial, setPendingInitial] = useState(0);

  const trial = trials[trialIdx];
  const level = trial ? trial.initialLevel + added : 0;
  const eq = trial ? equivalenceVolume(problem, trial.pipetteActual) : 0;
  const pH = trial ? flaskPH(problem, trial.pipetteActual, added) : 14;
  const colour = indicatorColour(indicator, pH);
  const startColour = indicatorColour(indicator, 14);
  const changed = colour.name !== startColour.name;

  const submitReading = () => {
    const decimals = conv.readingDecimalPlaces;
    if (!isValidReading(reading, decimals)) {
      setReadingError(`Record the reading to ${decimals} decimal places, for example 0.00 or 23.45.`);
      return;
    }
    const value = Number(reading);
    const accurate = readingIsAccurate(value, level, conv.readingResolution);
    const what = step === "initial" ? "initial" : "final";
    if (!accurate) addMistake(`${trial.label} titration: ${what} reading ${reading} was not the meniscus level (about ${level.toFixed(2)}).`);
    setReading("");
    setReadingError(null);
    if (step === "initial") {
      setPendingInitial(value);
      setStep("titrate");
      return;
    }
    const overshoot = added - eq;
    if (trialIdx > 0 && overshoot > 0.15) addMistake(`${trial.label} titration: overshot the end point by about ${overshoot.toFixed(2)} cm3. Add drop by drop near the end point.`);
    setRecords((r) => [...r, { initial: pendingInitial, final: value, trueInitial: trial.initialLevel, trueFinal: level, overshoot }]);
    setAdded(0);
    setStep("initial");
    if (trialIdx + 1 >= trials.length) setPhase("table");
    else setTrialIdx(trialIdx + 1);
  };

  // Table
  const [volumes, setVolumes] = useState<string[]>(["", "", "", ""]);
  const [chosen, setChosen] = useState<boolean[]>([false, false, false]);
  const [avgText, setAvgText] = useState("");
  const [tableChecked, setTableChecked] = useState(false);
  const titres = records.map((r) => roundTo(r.final - r.initial, 0.01));
  const accurateTitres = titres.slice(1);
  const concordant = concordantSet(accurateTitres, conv.concordanceTolerance);
  const expectedAvg = concordant.length ? average(concordant.map((i) => accurateTitres[i])) : average(accurateTitres);

  const [sectionOk, setSectionOk] = useState(true);
  const commit = (found: string[]) => {
    setMistakes((ms) => [...ms, ...found]);
    setSectionOk(found.length === 0);
  };

  const checkTable = () => {
    const found: string[] = [];
    titres.forEach((t, i) => {
      if (Math.abs(Number(volumes[i]) - t) > 0.005) found.push(`Volume of acid used (${trials[i].label}) should be final − initial = ${t.toFixed(2)} cm3.`);
    });
    const picked = chosen.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
    const same = picked.length === concordant.length && picked.every((i) => concordant.includes(i));
    if (!same) found.push(`Average only the concordant titres (within ${conv.concordanceTolerance.toFixed(2)} cm3 of each other); never include the rough titre.`);
    if (!closeTo(Number(avgText), expectedAvg, 0.2)) found.push(`Average titre should be about ${expectedAvg.toFixed(2)} cm3.`);
    commit(found);
    setTableChecked(true);
  };

  // Calculation
  const calc = calculate(problem, expectedAvg);
  const [answers, setAnswers] = useState({ molAcid: "", molBase: "", baseConc: "", baseMassConc: "" });
  const [calcChecked, setCalcChecked] = useState(false);
  const checkCalc = () => {
    const labels: Record<keyof typeof answers, string> = {
      molAcid: "Amount of acid in the average titre",
      molBase: "Amount of base in 25.0 cm3",
      baseConc: "Concentration of B in mol dm-3",
      baseMassConc: "Concentration of B in g dm-3",
    };
    const found: string[] = [];
    (Object.keys(answers) as (keyof typeof answers)[]).forEach((k) => {
      if (!closeTo(Number(answers[k]), calc[k], 1.5)) found.push(`${labels[k]}: expected about ${calc[k].toPrecision(3)}.`);
    });
    commit(found);
    setCalcChecked(true);
  };

  if (phase === "prep") {
    return (
      <div className="grid gap-4">
        <Brief mode={mode} problem={problem} pipette={conv.pipetteVolume} />
        {PREP.map((p) => (
          <fieldset key={p.id} disabled={prepChecked} className="rounded-lg border p-3">
            <legend className="px-1 font-medium">
              {p.safety && <span className="mr-1 rounded bg-red-100 px-1 text-xs text-red-800">Safety</span>}
              {p.q}
            </legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {p.options.map((o, i) => (
                <label key={o} className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 ${prep[p.id] === i ? "border-sky-600 bg-sky-50" : ""}`}>
                  <input type="radio" name={`prep-${p.id}`} checked={prep[p.id] === i} onChange={() => setPrep({ ...prep, [p.id]: i })} />
                  {o}
                </label>
              ))}
            </div>
            {prepChecked && (
              <Feedback ok={p.answer === -1 ? prep[p.id] !== 2 : prep[p.id] === p.answer}>{p.why}</Feedback>
            )}
          </fieldset>
        ))}
        {!prepChecked ? (
          <Button
            disabled={PREP.some((p) => prep[p.id] === undefined)}
            onClick={() => {
              PREP.forEach((p) => {
                const ok = p.answer === -1 ? prep[p.id] !== 2 : prep[p.id] === p.answer;
                if (!ok) addMistake(`${p.safety ? "Safety: " : ""}${p.q} ${p.why}`);
              });
              setPrepChecked(true);
            }}
          >
            Check set-up
          </Button>
        ) : (
          <Button onClick={() => setPhase("trials")}>Go to the bench</Button>
        )}
      </div>
    );
  }

  if (phase === "trials") {
    return (
      <div className="grid gap-4">
        <p className="font-semibold">
          {trial.label} titration ({trialIdx + 1} of {trials.length}){trialIdx === 0 && " – a quick titration to find the approximate end point."}
        </p>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="mb-1 text-sm font-medium">Burette (acid A)</p>
            <BuretteScale level={level} />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Conical flask on a white tile</p>
            <Flask colour={colour.hex} label={colour.name} />
            <p className="mt-1 text-sm" aria-live="polite">
              Colour: <Swatch hex={colour.hex} name={colour.name} />
            </p>
            {mode === "regular" && <p className="text-xs text-slate-600">End point: {indicator.name} turns from {startColour.name} to {indicator.transitionColour.name}.</p>}
          </div>
        </div>

        {step === "titrate" ? (
          <div className="grid gap-2">
            <p className="text-sm">Run acid into the flask while swirling. Slow down near the end point.</p>
            <div className="flex flex-wrap gap-2">
              {[5, 1, 0.5, 0.1].map((v) => (
                <Button key={v} variant="ghost" onClick={() => setAdded((a) => roundTo(a + v, 0.01))}>
                  + {v.toFixed(2)} cm3
                </Button>
              ))}
              <Button variant="ghost" onClick={() => setAdded((a) => roundTo(a + 0.05, 0.01))}>
                + 1 drop (0.05 cm3)
              </Button>
            </div>
            <Button onClick={() => setStep("final")}>{changed ? "Stop: end point reached" : "Stop titrating"}</Button>
          </div>
        ) : (
          <div className="grid gap-2">
            <label className="flex flex-wrap items-center gap-2">
              <span>{step === "initial" ? "Initial" : "Final"} burette reading:</span>
              <input
                inputMode="decimal"
                className="min-h-11 w-32 rounded-lg border px-3"
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReading()}
                aria-label={`${step} burette reading in cm3`}
              />
              <span>cm3</span>
              <Button onClick={submitReading}>Record</Button>
            </label>
            {readingError && <p className="text-sm text-orange-700">{readingError}</p>}
            {mode === "regular" && <p className="text-xs text-slate-600">Hint: read the bottom of the meniscus at eye level, to the nearest 0.05 cm3.</p>}
          </div>
        )}
      </div>
    );
  }

  if (phase === "table") {
    return (
      <div className="grid gap-3">
        <p>Complete the titre table using your readings.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2 text-left">Burette reading</th>
                {trials.map((t) => (
                  <th key={t.label} className="border p-2">
                    {t.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="border p-2 text-left font-normal">{conv.tableRows[0]}</th>
                {records.map((r, i) => (
                  <td key={i} className="border p-2 text-center">
                    {r.final.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="border p-2 text-left font-normal">{conv.tableRows[1]}</th>
                {records.map((r, i) => (
                  <td key={i} className="border p-2 text-center">
                    {r.initial.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="border p-2 text-left font-normal">{conv.tableRows[2]}</th>
                {records.map((_, i) => (
                  <td key={i} className="border p-1 text-center">
                    <input
                      inputMode="decimal"
                      className="min-h-10 w-20 rounded border px-2 text-center"
                      value={volumes[i]}
                      disabled={tableChecked}
                      onChange={(e) => setVolumes(volumes.map((v, j) => (j === i ? e.target.value : v)))}
                      aria-label={`Volume of acid used, ${trials[i].label}`}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <fieldset disabled={tableChecked}>
          <legend className="font-medium">Tick the concordant titres to average</legend>
          <div className="mt-1 flex gap-3">
            {trials.slice(1).map((t, i) => (
              <label key={t.label} className="flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={chosen[i]} onChange={() => setChosen(chosen.map((c, j) => (j === i ? !c : c)))} />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-wrap items-center gap-2">
          Average titre:
          <input inputMode="decimal" className="min-h-11 w-28 rounded-lg border px-3" value={avgText} disabled={tableChecked} onChange={(e) => setAvgText(e.target.value)} aria-label="Average titre in cm3" />
          cm3
        </label>
        {!tableChecked ? (
          <Button disabled={volumes.some((v) => v === "") || avgText === ""} onClick={checkTable}>
            Check table
          </Button>
        ) : (
          <>
            <Feedback ok={sectionOk}>
              Titres: {titres.map((t) => t.toFixed(2)).join(", ")} cm3. Concordant: {concordant.map((i) => trials[i + 1].label).join(", ") || "none, so use all accurate titres"}. Average = {expectedAvg.toFixed(2)} cm3.
            </Feedback>
            <Button onClick={() => setPhase("calc")}>Go to calculation</Button>
          </>
        )}
      </div>
    );
  }

  if (phase === "calc") {
    const field = (k: keyof typeof answers, label: string, unit: string) => (
      <label className="grid gap-1 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-2">
        <span>{label}</span>
        <input inputMode="decimal" className="min-h-11 w-40 rounded-lg border px-3" value={answers[k]} disabled={calcChecked} onChange={(e) => setAnswers({ ...answers, [k]: e.target.value })} aria-label={label} />
        <span className="text-sm">{unit}</span>
      </label>
    );
    return (
      <div className="grid gap-3">
        <p>
          Equation: <strong>{problem.reaction.equation}</strong>
        </p>
        <p>
          Concentration of A ({problem.reaction.acid.formula}) = {problem.acidConc.toFixed(3)} mol dm-3. Average titre = {expectedAvg.toFixed(2)} cm3. Volume of B = {problem.pipetteVolume.toFixed(1)} cm3. Molar mass of {problem.reaction.base.formula} = {problem.reaction.base.molarMass} g mol-1.
        </p>
        {field("molAcid", `(i) Amount of ${problem.reaction.acid.formula} in the average titre`, "mol")}
        {field("molBase", `(ii) Amount of ${problem.reaction.base.formula} in ${problem.pipetteVolume.toFixed(1)} cm3 of B`, "mol")}
        {field("baseConc", "(iii) Concentration of B", "mol dm-3")}
        {field("baseMassConc", "(iv) Concentration of B", "g dm-3")}
        {!calcChecked ? (
          <Button disabled={Object.values(answers).some((v) => v === "")} onClick={checkCalc}>
            Check calculation
          </Button>
        ) : (
          <>
            <Feedback ok={sectionOk}>
              (i) {problem.acidConc} × {expectedAvg.toFixed(2)} ÷ 1000 = {calc.molAcid.toPrecision(3)} mol. (ii) Mole ratio {problem.reaction.a}:{problem.reaction.b} gives {calc.molBase.toPrecision(3)} mol. (iii) {calc.molBase.toPrecision(3)} × 1000 ÷ {problem.pipetteVolume} = {calc.baseConc.toPrecision(3)} mol dm-3. (iv) × {problem.reaction.base.molarMass} = {calc.baseMassConc.toPrecision(3)} g dm-3.
              {mode === "exam" && ` The true concentration of B was ${problem.baseConc.toFixed(3)} mol dm-3.`}
            </Feedback>
            <Button onClick={() => onDone({ correct: mistakes.length === 0, mistakes })}>Finish</Button>
          </>
        )}
      </div>
    );
  }
  return null;
}

function Brief({ mode, problem, pipette }: { mode: string; problem: ReturnType<typeof makeProblem>["problem"]; pipette: number }) {
  return (
    <div className="rounded-lg bg-slate-100 p-3 text-sm">
      <p>
        <strong>A</strong> is {problem.reaction.acid.name}, {problem.reaction.acid.formula}, containing {problem.acidConc.toFixed(3)} mol dm-3.
      </p>
      <p>
        <strong>B</strong> is a solution of {problem.reaction.base.name}, {problem.reaction.base.formula}
        {mode === "exam" ? " of unknown concentration." : `, containing ${problem.baseConc.toFixed(3)} mol dm-3 (you will confirm this).`}
      </p>
      <p>
        Put A in the burette. Titrate {pipette.toFixed(1)} cm3 portions of B with A. Do one rough and three accurate titrations.
      </p>
    </div>
  );
}
