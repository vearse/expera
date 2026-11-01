"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Indicator } from "@/lib/content/schemas";
import { indicatorColour } from "@/lib/engine/ph";
import { awardMissionXp } from "@/lib/runtime/gamification";
import { useViewMode } from "@/lib/device";
import { PhaserHost } from "@/components/phaser/PhaserHost";
import { buildTitrationLabScene, type TitrationViewState } from "@/lib/scenes/titrationLabScene";
import {
  buretteReading,
  createTitrationState,
  currentPH,
  reduceTitration,
  titrationSummary,
  type TitrationAction,
  type TitrationState,
} from "@/lib/sim/titrationStore";
import type { SafetyRuleInput } from "@/lib/sim/simulationTypes";
import { Button } from "@/components/ui";
import { createStore } from "zustand/vanilla";

const Bench3D = dynamic(() => import("@/components/sim3d/TitrationBench3D"), { ssr: false, loading: () => <p className="text-sm">Loading 3D bench…</p> });

export function TitrationLaboratory({ rules, indicator, pipetteVolume }: { rules: SafetyRuleInput[]; indicator: Indicator; pipetteVolume: number }) {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [preferred, , ready] = useViewMode();
  useEffect(() => {
    if (ready) setMode(preferred);
  }, [ready, preferred]);
  const [practice, setPractice] = useState<"regular" | "exam">("regular");
  const [log, setLog] = useState<string[]>([]);
  const [snap, setSnap] = useState<TitrationState>(() => createTitrationState("regular", 1, pipetteVolume));

  const store = useMemo(() => {
    const initial = createTitrationState("regular", 1, pipetteVolume);
    return createStore<TitrationViewState>((set, get) => ({
      ...initial,
      dispatch: (action: TitrationAction) => {
        const current = get();
        const next = reduceTitration(current, action, rules);
        if (!current.criticalSafetyOpen) {
          for (const event of next.events) {
            if (event.xp) awardMissionXp(`${event.id}-${current.seed}-${current.rows.length}`, event.xp, event.badgeId);
          }
        }
        set({ ...next.state, dispatch: get().dispatch });
        setSnap(next.state);
        const lines = [...next.events.map((e) => e.message), ...next.safetyEvents.map((s) => `${s.message} ${s.safeProcedure}`)];
        if (lines.length) setLog((prev) => [...lines, ...prev].slice(0, 8));
      },
    }));
  }, [pipetteVolume, rules]);

  const createScene = useCallback((Phaser: typeof import("phaser"), s: typeof store) => buildTitrationLabScene(Phaser, s), []);
  const dispatch = (action: TitrationAction) => store.getState().dispatch(action);
  const ph = currentPH(snap);
  const colour = ph === null || snap.indicatorDrops === 0 ? { name: "no indicator colour yet", hex: "#e2e8f0" } : indicatorColour(indicator, ph);
  const summary = titrationSummary(snap);
  const showHints = practice === "regular";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={practice === "regular" ? "primary" : "ghost"} onClick={() => { setPractice("regular"); dispatch({ type: "restart", seed: 1, mode: "regular" }); }}>Regular Practice</Button>
        <Button variant={practice === "exam" ? "primary" : "ghost"} onClick={() => { setPractice("exam"); dispatch({ type: "restart", seed: 2, mode: "exam" }); }}>Exam Preparation</Button>
        <Button variant={mode === "2d" ? "primary" : "ghost"} onClick={() => setMode("2d")}>2D</Button>
        <Button variant={mode === "3d" ? "primary" : "ghost"} onClick={() => setMode("3d")}>3D</Button>
        <Button variant="ghost" onClick={() => dispatch({ type: "restart", seed: Math.floor(Math.random() * 1e6), mode: practice })}>New sample</Button>
      </div>
      <p className="text-sm text-slate-600">
        {snap.problem.reaction.equation}. Acid in the burette ({snap.problem.acidConc} mol dm-3 {snap.problem.reaction.acid.name}).
        {practice === "exam" ? " The base concentration is hidden." : ` Base is ${snap.problem.baseConc} mol dm-3 ${snap.problem.reaction.base.name}.`}
      </p>
      {mode === "3d" ? <Bench3D state={snap} colour={colour.hex} /> : <PhaserHost store={store} createScene={createScene} />}
      <div className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-2" aria-live="polite">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => dispatch({ type: "rinse" })}>Rinse burette</Button>
          <Button onClick={() => dispatch({ type: "fill" })}>Fill burette</Button>
          <Button onClick={() => dispatch({ type: "removeBubble" })}>Remove air bubble</Button>
          <Button onClick={() => dispatch({ type: "setView", view: "eye" })}>Eye level</Button>
          <Button onClick={() => dispatch({ type: "setView", view: "above" })}>Look from above</Button>
          <Button onClick={() => dispatch({ type: "recordInitial" })}>Record initial</Button>
          <Button onClick={() => dispatch({ type: "pipette", method: "filler" })}>Pipette with filler</Button>
          <Button onClick={() => dispatch({ type: "pipette", method: "mouth" })}>Pipette by mouth</Button>
          <Button onClick={() => dispatch({ type: "addIndicator" })}>Add indicator drop</Button>
          <Button onClick={() => dispatch({ type: "setTile", on: true })}>Flask on white tile</Button>
          <Button onClick={() => dispatch({ type: "swirl" })}>Swirl flask</Button>
          <Button onClick={() => dispatch({ type: "deliver", cm3: 1 })}>Run in 1 cm3</Button>
          <Button onClick={() => dispatch({ type: "deliver", cm3: 0.05 })}>One drop</Button>
          <Button onClick={() => dispatch({ type: "recordFinal" })}>Record final</Button>
          <Button onClick={() => dispatch({ type: "nextTrial" })}>Next titre</Button>
        </div>
        <div className="text-sm">
          <p>Trial: {snap.labels[snap.trialIndex]} · view: {snap.view}</p>
          <p>Burette reading: {buretteReading(snap).toFixed(2)} cm3</p>
          <p>Indicator drops: {snap.indicatorDrops}. Colour: {colour.name}.</p>
          {ph !== null && <p>Flask pH about {ph.toFixed(1)}.</p>}
          {showHints && <p className="mt-2 text-slate-600">Hint: rinse, fill, clear the jet, read at eye level, pipette with a filler, add 2 drops, swirl, then add acid drop by drop near the end point.</p>}
          <ul className="mt-2 list-disc pl-5">
            {log.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left"><th>Trial</th><th>Initial</th><th>Final</th><th>Titre</th></tr>
        </thead>
        <tbody>
          {snap.rows.map((row) => (
            <tr key={row.label} className="border-b">
              <td>{row.label}</td><td>{row.initial.toFixed(2)}</td><td>{row.final.toFixed(2)}</td><td>{row.titre.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {summary.average !== null && summary.calculation && (
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p>Concordant titres: {summary.concordant.map((n) => n.toFixed(2)).join(", ")} cm3. Average {summary.average.toFixed(2)} cm3.</p>
          <p>mol of acid = {snap.problem.acidConc} × {summary.average.toFixed(2)} / 1000 = {summary.calculation.molAcid.toFixed(5)} mol.</p>
          <p>Base concentration = {summary.calculation.baseConc.toFixed(4)} mol dm-3 ({summary.calculation.baseMassConc.toFixed(2)} g dm-3).</p>
          {snap.mistakes.length > 0 && (
            <ul className="mt-2 list-disc pl-5">{snap.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
          )}
        </div>
      )}
    </div>
  );
}
