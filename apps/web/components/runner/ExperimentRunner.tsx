"use client";

import Link from "next/link";
import { useState } from "react";
import type { Experiment } from "@/lib/content/schemas";
import { newSeed } from "@/lib/engine/rng";
import { summarise, useProgress, type TaskOutcome } from "@/lib/runtime/progress";
import { awardMissionXp } from "@/lib/runtime/gamification";
import type { LabData, Mode } from "@/lib/runtime/types";
import { Button, Card, ReviewBadge } from "@/components/ui";
import { BENCHES } from "@/components/benches";
import { ChoiceTask, NumericTask, OrderTask } from "./TaskViews";

export function ExperimentRunner({ experiment, data }: { experiment: Experiment; data: LabData }) {
  const [mode, setMode] = useState<Mode>("regular");
  const [benchMode, setBenchMode] = useState<"guided" | "free">("guided");
  const [seed, setSeed] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<TaskOutcome[]>([]);
  const [showHint, setShowHint] = useState(false);
  const save = useProgress((s) => s.save);

  const start = () => {
    setSeed(newSeed());
    setIndex(0);
    setOutcomes([]);
  };

  if (seed === null) {
    return (
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{experiment.title}</h1>
          <ReviewBadge status={experiment.review} />
        </div>
        <p className="mt-2">
          <strong>Aim:</strong> {experiment.aim}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <InfoList title="Apparatus" items={experiment.apparatus.map((id) => data.apparatus.find((a) => a.id === id)?.name ?? id)} />
          <InfoList title="Safety" items={experiment.safety} />
          <InfoList title="Learn first" items={experiment.learnLinks} />
        </div>
        <fieldset className="mt-4">
          <legend className="font-semibold">Mode</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["regular", "exam"] as const).map((m) => (
              <label key={m} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 ${mode === m ? "border-sky-600 bg-sky-50" : ""}`}>
                <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} />
                {m === "regular" ? "Regular Practice (hints on)" : "Exam Prep (WAEC/NECO style: unknown sample, real reading error, no hints)"}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-4">
          <legend className="font-semibold">Lab exploration</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["guided", "free"] as const).map((m) => (
              <label key={m} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 ${benchMode === m ? "border-sky-600 bg-sky-50" : ""}`}>
                <input type="radio" name="benchMode" checked={benchMode === m} onChange={() => setBenchMode(m)} />
                {m === "guided" ? "Guided mission (step list)" : "Free exploration (engine still reacts)"}
              </label>
            ))}
          </div>
        </fieldset>
        <Button className="mt-4" onClick={start}>
          Start
        </Button>
      </Card>
    );
  }

  if (index >= experiment.tasks.length) {
    const s = summarise(outcomes);
    return (
      <Card>
        <h1 className="text-2xl font-bold">Summary: {experiment.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{mode === "exam" ? "Exam Prep" : "Regular Practice"} · sample seed {seed}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Steps correct" value={`${s.correct} / ${s.total}`} />
          <Stat label="Mistakes" value={String(s.mistakes.length)} />
          <Stat label="Safety errors" value={String(s.safetyErrors)} />
          <Stat label="Reading accuracy" value={s.correct === s.total ? "Good" : "Review meniscus"} />
          <Stat label="Score" value={`${Math.round((100 * s.correct) / Math.max(1, s.total))}%`} />
        </dl>
        {s.mistakes.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold">Mistakes made</h2>
            <ul className="list-disc pl-5">
              {s.mistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4">
          <strong>Key idea:</strong> {experiment.keyIdea}
        </p>
        <p className="mt-1">
          <strong>Topic to revise:</strong> {experiment.reviseTopic}
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={start}>Try again</Button>
          <Link href="/chemistry" className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-semibold">
            Back to Chemistry
          </Link>
        </div>
      </Card>
    );
  }

  const task = experiment.tasks[index];
  const finish = (correct: boolean, mistakes: string[]) => {
    const next = [...outcomes, { taskId: task.id, correct, safety: task.safety, mistakes }];
    setOutcomes(next);
    setShowHint(false);
    setIndex(index + 1);
    if (index + 1 >= experiment.tasks.length) {
      save({ experimentId: experiment.id, mode, seed, finishedAt: new Date().toISOString(), outcomes: next });
      if (experiment.id === "titration" && next.every((o) => o.correct)) {
        awardMissionXp("titration-complete", 20, "titration-star");
      }
    }
  };
  const taskSeed = seed + index * 7919;
  const Bench = task.type === "bench" ? BENCHES[task.bench] : null;

  return (
    <Card>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          {experiment.title} · Step {index + 1} of {experiment.tasks.length}
        </span>
        <span>{mode === "exam" ? "Exam Prep" : "Regular"} · {benchMode === "guided" ? "Guided" : "Free"}</span>
      </div>
      <div className="mt-1 h-2 rounded bg-slate-200" aria-hidden>
        <div className="h-2 rounded bg-sky-600" style={{ width: `${(100 * index) / experiment.tasks.length}%` }} />
      </div>
      <h2 className="mt-4 text-lg font-semibold">
        {task.safety && <span className="mr-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">Safety</span>}
        {task.prompt}
      </h2>
      {mode === "regular" && benchMode === "guided" && task.hint && (
        <div className="mt-1">
          {showHint ? (
            <p className="text-sm text-slate-700">Hint: {task.hint}</p>
          ) : (
            <button className="text-sm text-sky-700 underline" onClick={() => setShowHint(true)}>
              Show hint
            </button>
          )}
        </div>
      )}
      <div className="mt-3" key={`${seed}-${index}`}>
        {task.type === "choice" && <ChoiceTask task={task} onDone={finish} />}
        {task.type === "order" && <OrderTask task={task} seed={taskSeed} onDone={finish} />}
        {task.type === "numeric" && <NumericTask task={task} onDone={finish} />}
        {Bench && <Bench mode={mode} seed={taskSeed} data={data} prompt={task.prompt} onDone={(o) => finish(o.correct, o.mistakes)} />}
      </div>
    </Card>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="list-disc pl-5 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 p-3">
      <dt className="text-xs text-slate-600">{label}</dt>
      <dd className="text-xl font-bold">{value}</dd>
    </div>
  );
}
