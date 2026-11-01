"use client";

import { useMemo, useState } from "react";
import type { Task } from "@/lib/content/schemas";
import { createRng } from "@/lib/engine/rng";
import { Button, Feedback } from "@/components/ui";
import { ApparatusIcon } from "@/components/apparatus/ApparatusIcon";

type Done = (correct: boolean, mistakes: string[]) => void;

export function ChoiceTask({ task, onDone }: { task: Extract<Task, { type: "choice" }>; onDone: Done }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const ok = picked === task.answer;
  return (
    <div>
      {task.image && (
        <div className="mb-3 flex justify-center">
          <ApparatusIcon id={task.image} size={140} />
        </div>
      )}
      <fieldset disabled={checked} className="grid gap-2">
        <legend className="sr-only">{task.prompt}</legend>
        {task.options.map((o) => (
          <label key={o.id} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 ${picked === o.id ? "border-sky-600 bg-sky-50" : "bg-white"}`}>
            <input type="radio" name={task.id} value={o.id} checked={picked === o.id} onChange={() => setPicked(o.id)} />
            {o.text}
          </label>
        ))}
      </fieldset>
      {!checked ? (
        <Button className="mt-3" disabled={!picked} onClick={() => setChecked(true)}>
          Check
        </Button>
      ) : (
        <>
          <Feedback ok={ok}>{task.explain}</Feedback>
          <Button className="mt-3" onClick={() => onDone(ok, ok ? [] : [task.prompt])}>
            Next
          </Button>
        </>
      )}
    </div>
  );
}

export function OrderTask({ task, seed, onDone }: { task: Extract<Task, { type: "order" }>; seed: number; onDone: Done }) {
  const initial = useMemo(() => {
    const rng = createRng(seed);
    let s = rng.shuffle(task.items);
    if (s.every((v, i) => v === task.items[i])) s = [...s.slice(1), s[0]];
    return s;
  }, [seed, task.items]);
  const [items, setItems] = useState(initial);
  const [checked, setChecked] = useState(false);
  const ok = items.every((v, i) => v === task.items[i]);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };
  return (
    <div>
      <ol className="grid gap-2">
        {items.map((item, i) => (
          <li key={item} className={`flex items-center gap-2 rounded-lg border bg-white p-2 ${checked && item !== task.items[i] ? "border-orange-400" : ""}`}>
            <span className="w-6 text-center font-bold">{i + 1}</span>
            <span className="flex-1">{item}</span>
            <Button variant="ghost" aria-label={`Move "${item}" up`} disabled={checked || i === 0} onClick={() => move(i, -1)}>
              ↑
            </Button>
            <Button variant="ghost" aria-label={`Move "${item}" down`} disabled={checked || i === items.length - 1} onClick={() => move(i, 1)}>
              ↓
            </Button>
          </li>
        ))}
      </ol>
      {!checked ? (
        <Button className="mt-3" onClick={() => setChecked(true)}>
          Check order
        </Button>
      ) : (
        <>
          <Feedback ok={ok}>
            {task.explain}
            {!ok && (
              <ol className="mt-2 list-decimal pl-5">
                {task.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            )}
          </Feedback>
          <Button className="mt-3" onClick={() => onDone(ok, ok ? [] : [`Wrong order: ${task.prompt}`])}>
            Next
          </Button>
        </>
      )}
    </div>
  );
}

export function NumericTask({ task, onDone }: { task: Extract<Task, { type: "numeric" }>; onDone: Done }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const ok = Math.abs(Number(value) - task.answer) <= task.tolerance;
  return (
    <div>
      <label className="flex items-center gap-2">
        <input
          inputMode="decimal"
          className="min-h-11 w-40 rounded-lg border px-3"
          value={value}
          disabled={checked}
          onChange={(e) => setValue(e.target.value)}
          aria-label={task.prompt}
        />
        <span>{task.unit}</span>
      </label>
      {!checked ? (
        <Button className="mt-3" disabled={value.trim() === "" || Number.isNaN(Number(value))} onClick={() => setChecked(true)}>
          Check
        </Button>
      ) : (
        <>
          <Feedback ok={ok}>
            {task.explain} (Answer: {task.answer} {task.unit})
          </Feedback>
          <Button className="mt-3" onClick={() => onDone(ok, ok ? [] : [task.prompt])}>
            Next
          </Button>
        </>
      )}
    </div>
  );
}
