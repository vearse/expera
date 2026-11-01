"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { createStore } from "zustand/vanilla";
import type { Apparatus } from "@/lib/content/schemas";
import { awardMissionXp } from "@/lib/runtime/gamification";
import {
  APPARATUS_SETUPS,
  createApparatusState,
  reduceApparatus,
  type ApparatusAction,
  type ApparatusState,
} from "@/lib/sim/apparatusStore";
import { Button, ReviewBadge } from "@/components/ui";

const Room3D = dynamic(() => import("@/components/sim3d/ApparatusRoom3D"), {
  ssr: false,
  loading: () => <div className="flex h-[560px] items-center justify-center rounded-2xl border bg-slate-200 text-sm text-slate-600">Loading the 3D laboratory…</div>,
});

const Viewer3D = dynamic(() => import("@/components/sim3d/ApparatusViewer3D"), {
  ssr: false,
  loading: () => <div className="flex h-56 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-sm text-slate-400">Loading 3D model…</div>,
});

const READINGS = { burette: 23.45, pipette: 25, "measuring-cylinder": 48.5 } as const;
type ReadingTarget = keyof typeof READINGS;

function teacherHint(state: ApparatusState): string {
  const selected = state.items.find((item) => item.id === state.selectedId) ?? null;
  if (!selected) return "Choose an apparatus on the shelves to begin.";

  if (state.setupId) {
    const need = APPARATUS_SETUPS[state.setupId];
    const missing = need.find((id) => !state.bench.includes(id));
    if (missing) {
      const name = state.items.find((item) => item.id === missing)?.name ?? missing;
      return `For the ${state.setupId} setup, add the ${name} to the bench next.`;
    }
    if (state.setupFeedback?.startsWith("The apparatus")) return "The setup looks complete. Read the guide, then check the bench.";
  }

  if (state.identifyPromptId) {
    const target = state.items.find((item) => item.id === state.identifyPromptId);
    if (target && !state.identified.includes(target.id)) {
      return `For this challenge, look for the ${target.name}. ${target.use}`;
    }
  }

  if (state.trueReading !== null) {
    return "Sit so your eye is level with the bottom of the meniscus. Read the scale, not the top of the liquid.";
  }

  if (state.bench.length === 0) {
    return `Start with the ${selected.name}. Drag it onto the workbench, then read its guide.`;
  }

  if (selected.howTo?.[0]) return `${selected.name}: ${selected.howTo[0]}`;
  if (selected.tip) return selected.tip;
  return "Open another apparatus guide, then try one of the workbench challenges.";
}

type LabStore = ApparatusState & { dispatch: (action: ApparatusAction) => void };

const IDENTIFY_PROMPTS = [
  { id: "burette", text: "Which apparatus delivers a variable volume, read to 0.05 cm3?" },
  { id: "pipette", text: "Which apparatus delivers one fixed volume, such as 25.0 cm3?" },
  { id: "conical-flask", text: "Which flask holds the solution being titrated?" },
  { id: "filter-funnel", text: "Which apparatus holds filter paper during filtration?" },
  { id: "retort-stand", text: "Which apparatus clamps a burette firmly in place?" },
] as const;

export function ApparatusLaboratory({ items }: { items: Apparatus[] }) {
  const [snap, setSnap] = useState<ApparatusState>(() => createApparatusState(items));
  const store = useMemo(() => {
    const initial = createApparatusState(items);
    return createStore<LabStore>((set, get) => ({
      ...initial,
      dispatch: (action: ApparatusAction) => {
        const next = reduceApparatus(get(), action);
        for (const event of next.events) {
          if (event.xp) awardMissionXp(`apparatus-${event.id}-${event.message}`, event.xp, event.badgeId);
        }
        set({ ...next.state, dispatch: get().dispatch });
        setSnap(next.state);
      },
    }));
  }, [items]);

  const dispatch = useCallback((action: ApparatusAction) => store.getState().dispatch(action), [store]);
  const select = useCallback((id: string) => dispatch({ type: "select", id }), [dispatch]);
  const moveToBench = useCallback(
    (id: string) => {
      dispatch({ type: "select", id });
      dispatch({ type: "toBench" });
    },
    [dispatch],
  );
  const returnToShelf = useCallback(
    (id: string) => {
      dispatch({ type: "select", id });
      dispatch({ type: "toShelf" });
    },
    [dispatch],
  );
  const reorderBench = useCallback((ids: string[]) => dispatch({ type: "reorderBench", ids }), [dispatch]);
  const clearBench = useCallback(() => dispatch({ type: "clearBench" }), [dispatch]);

  const selected = snap.items.find((item) => item.id === snap.selectedId) ?? null;
  const activePrompt = IDENTIFY_PROMPTS.find((prompt) => prompt.id === snap.identifyPromptId) ?? null;
  const setup = snap.setupId ? APPARATUS_SETUPS[snap.setupId] : null;
  const required = setup?.map((id) => snap.items.find((item) => item.id === id)?.name ?? id) ?? [];
  const hint = teacherHint(snap);

  const readingChoices = useMemo(() => {
    if (snap.trueReading === null) return [];
    const values = [snap.trueReading, snap.trueReading + 0.1, snap.trueReading - 0.1, snap.trueReading + 0.05];
    return Array.from(new Set(values.map((value) => Math.round(value * 100) / 100))).sort(() => 0.5 - Math.random());
  }, [snap.trueReading]);

  return (
    <div className="grid gap-4">
      <Room3D
        items={snap.items}
        selectedId={snap.selectedId}
        bench={snap.bench}
        onSelect={select}
        onMoveToBench={moveToBench}
        onReturnToShelf={returnToShelf}
        onReorderBench={reorderBench}
        onClearBench={clearBench}
        teacherHint={hint}
      />

      <div className="flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-teal-950 shadow-sm" aria-live="polite">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">MA</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">Ms. Ada suggests</p>
          <p className="mt-0.5 text-sm">{hint}</p>
        </div>
      </div>

      <section className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm lg:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Apparatus guide</p>
            <h2 className="text-2xl font-bold text-slate-900">{selected?.name ?? "Select apparatus"}</h2>
          </div>
          {selected ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${snap.bench.includes(selected.id) ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-slate-50 text-slate-600"}`}>
                {snap.bench.includes(selected.id) ? "On the bench" : "On the shelf"}
              </span>
              <ReviewBadge status={selected.review} />
            </div>
          ) : null}
        </div>

        {selected ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
            <div className="grid content-start gap-2">
              <Viewer3D id={selected.id} className="h-64 lg:h-72" />
              <p className="text-center text-[11px] text-slate-500">Live 3D model. Drag to rotate and scroll to zoom.</p>
              {snap.bench.includes(selected.id) ? (
                <Button className="text-xs" onClick={() => returnToShelf(selected.id)}>Return to shelf</Button>
              ) : (
                <Button className="text-xs" onClick={() => moveToBench(selected.id)}>Move to bench</Button>
              )}
            </div>

            <div className="grid content-start gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">What it is used for</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{selected.use}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">How to use it</h3>
                  <ol className="mt-2 grid gap-2 text-sm text-slate-700">
                    {(selected.howTo ?? []).map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-sky-700 text-[11px] font-bold text-white">{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {selected.tip ? (
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-950">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Key point</h3>
                    <p className="mt-1 text-sm">{selected.tip}</p>
                  </div>
                ) : null}
                {selected.safety ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Safety</h3>
                    <p className="mt-1 text-sm">{selected.safety}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Click any apparatus on the shelves or the bench to open its guide.</p>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Workbench challenges</h2>
          <p className="text-xs text-slate-500">Select an item, then answer. Examples give hints.</p>
        </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <article className="grid content-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-slate-900">1. Identify apparatus</h3>
              <p className="text-xs text-slate-600">{activePrompt?.text ?? "Choose a question to start."}</p>
              <div className="flex flex-wrap gap-1">
                {IDENTIFY_PROMPTS.map((prompt, index) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => dispatch({ type: "startIdentify", id: prompt.id })}
                    className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${snap.identifyPromptId === prompt.id ? "border-sky-600 bg-sky-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-sky-500"}`}
                  >
                    Q{index + 1}
                  </button>
                ))}
              </div>
              <Button variant="ghost" className="justify-start text-xs" disabled={!activePrompt || !selected} onClick={() => selected && dispatch({ type: "guess", id: selected.id })}>
                Submit {selected ? `"${selected.name}"` : "selected item"}
              </Button>
              {snap.identifyFeedback ? <p className="rounded-md bg-white p-2 text-xs text-slate-700 ring-1 ring-slate-200">{snap.identifyFeedback}</p> : null}
              <p className="text-[11px] text-slate-500">Identified so far: {snap.identified.length}</p>
            </article>

            <article className="grid content-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-slate-900">2. Assemble a setup</h3>
              <div className="flex flex-wrap gap-1.5">
                <Button variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => dispatch({ type: "startSetup", id: "titration" })}>Titration</Button>
                <Button variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => dispatch({ type: "startSetup", id: "filtration" })}>Filtration</Button>
              </div>
              {setup ? (
                <ul className="grid gap-1 text-[11px] text-slate-700">
                  {required.map((name, index) => {
                    const id = setup[index];
                    const have = snap.bench.includes(id);
                    return (
                      <li key={id} className={have ? "font-semibold text-emerald-700" : ""}>
                        {have ? "On bench: " : "Needed: "}
                        {name}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-slate-600">Choose a setup, then drag each required item onto the bench.</p>
              )}
              <Button variant="ghost" className="min-h-9 justify-start px-2 text-xs" disabled={!setup} onClick={() => dispatch({ type: "checkSetup" })}>
                Check the bench
              </Button>
              {snap.setupFeedback ? <p className="rounded-md bg-white p-2 text-xs text-slate-700 ring-1 ring-slate-200">{snap.setupFeedback}</p> : null}
            </article>

            <article className="grid content-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-slate-900">3. Read the meniscus</h3>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(READINGS) as ReadingTarget[]).map((target) => (
                  <Button key={target} variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => dispatch({ type: "startReading", target, trueReading: READINGS[target] })}>
                    {snap.items.find((item) => item.id === target)?.name ?? target}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button variant={snap.view === "eye" ? "primary" : "ghost"} className="min-h-8 px-2 text-[11px]" onClick={() => dispatch({ type: "setView", view: "eye" })}>Eye level</Button>
                <Button variant={snap.view === "above" ? "primary" : "ghost"} className="min-h-8 px-2 text-[11px]" onClick={() => dispatch({ type: "setView", view: "above" })}>From above</Button>
                <Button variant={snap.view === "below" ? "primary" : "ghost"} className="min-h-8 px-2 text-[11px]" onClick={() => dispatch({ type: "setView", view: "below" })}>From below</Button>
              </div>
              {snap.trueReading !== null ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {readingChoices.map((value) => (
                    <Button key={value} variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => dispatch({ type: "submitReading", value })}>
                      {value.toFixed(2)} cm3
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600">Choose apparatus to take a reading at eye level.</p>
              )}
              {snap.readingFeedback ? <p className="rounded-md bg-white p-2 text-xs text-slate-700 ring-1 ring-slate-200">{snap.readingFeedback}</p> : null}
            </article>
          </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="grid content-start gap-2 rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">On the bench</h2>
          {snap.bench.length ? (
            <div className="flex flex-wrap gap-1.5">
              {snap.bench.map((id) => {
                const item = snap.items.find((entry) => entry.id === id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => select(id)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${snap.selectedId === id ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-300 bg-white text-slate-700 hover:border-sky-500"}`}
                  >
                    {item?.name ?? id}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Nothing yet. Drag an item from the shelves onto the workbench, or double-click it.</p>
          )}
          <Button variant="ghost" className="min-h-9 justify-start px-2 text-xs" disabled={!snap.bench.length} onClick={clearBench}>
            Clear the bench
          </Button>
        </section>

        <section className="grid content-start gap-2 rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Apparatus shelves</h2>
          <p className="text-[11px] text-slate-500">Keyboard and touch alternative: choose an item here, then inspect or move it.</p>
          <div className="grid max-h-64 gap-1 overflow-auto pr-1">
            {snap.items.map((item) => {
              const onBench = snap.bench.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={snap.selectedId === item.id}
                  onClick={() => select(item.id)}
                  className={`flex min-h-8 items-center justify-between gap-2 rounded-md px-2 text-left text-xs ${snap.selectedId === item.id ? "bg-sky-700 text-white" : "hover:bg-slate-100"}`}
                >
                  <span>{item.name}</span>
                  <span className={`text-[10px] uppercase tracking-wide ${snap.selectedId === item.id ? "text-sky-100" : onBench ? "text-emerald-600" : "text-slate-400"}`}>
                    {onBench ? "bench" : "shelf"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid content-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm md:col-span-2 xl:col-span-1">
          <h2 className="text-sm font-semibold">Safety first</h2>
          <ul className="list-disc space-y-1 pl-4 text-xs">
            <li>Wear goggles and tie back long hair before lighting a burner.</li>
            <li>Never pipette by mouth — always use a pipette filler.</li>
            <li>Read the bottom of the meniscus at eye level.</li>
            <li>Remove the funnel before titrating and never leave a flame unattended.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
