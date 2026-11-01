"use client";

import { useMemo, useState } from "react";
import type { BenchProps } from "@/lib/runtime/types";
import { indicatorColour } from "@/lib/engine/ph";
import { createRng, roundTo } from "@/lib/engine/rng";
import { REACTIONS, equivalenceVolume, flaskPH } from "@/lib/engine/titration";
import { Button, Feedback, Swatch } from "@/components/ui";
import { Flask } from "./Burette";

/** Neutralise NaOH with HCl using phenolphthalein: the first stage of preparing NaCl by the titration method. */
export function NeutraliseBench({ mode, seed, data, onDone }: BenchProps) {
  const problem = useMemo(() => {
    const baseConc = mode === "exam" ? roundTo(createRng(seed).range(0.08, 0.12), 0.001) : 0.1;
    return { reaction: REACTIONS["hcl-naoh"], acidConc: 0.1, baseConc, pipetteVolume: 25 };
  }, [mode, seed]);
  const [added, setAdded] = useState(0);
  const [stopped, setStopped] = useState(false);
  const phen = data.indicators.find((i) => i.id === "phenolphthalein")!;
  const pH = flaskPH(problem, 25, added);
  const c = indicatorColour(phen, pH);
  const eq = equivalenceVolume(problem);
  const over = added - eq;
  const ok = c.name === "colourless" && over <= 0.15;

  return (
    <div className="grid gap-3">
      <p className="text-sm">
        25.0 cm3 of sodium hydroxide solution with phenolphthalein is in the flask. Add 0.100 mol dm-3 hydrochloric acid until the pink colour <em>just</em> disappears.
      </p>
      <div className="flex items-center gap-4">
        <Flask colour={c.hex} label={c.name} />
        <div aria-live="polite">
          <p>Acid added: {added.toFixed(2)} cm3</p>
          <p>
            Colour: <Swatch hex={c.hex} name={c.name} />
          </p>
        </div>
      </div>
      {!stopped ? (
        <div className="flex flex-wrap gap-2">
          {[5, 1, 0.1, 0.05].map((v) => (
            <Button key={v} variant="ghost" onClick={() => setAdded((a) => roundTo(a + v, 0.01))}>
              + {v.toFixed(2)} cm3
            </Button>
          ))}
          <Button onClick={() => setStopped(true)}>Stop</Button>
        </div>
      ) : (
        <>
          <Feedback ok={ok}>
            {c.name !== "colourless"
              ? "The solution is still alkaline (pink). Neutralisation is not complete."
              : over > 0.15
                ? `You overshot by about ${over.toFixed(2)} cm3, so the solution now contains excess acid.`
                : `Neutralised at about ${eq.toFixed(2)} cm3. Repeat with the same volumes but no indicator, then evaporate to obtain pure sodium chloride crystals.`}
          </Feedback>
          <Button onClick={() => onDone({ correct: ok, mistakes: ok ? [] : ["Neutralisation end point not reached exactly."] })}>Next</Button>
        </>
      )}
    </div>
  );
}
