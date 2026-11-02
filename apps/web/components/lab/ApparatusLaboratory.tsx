"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createStore } from "zustand/vanilla";
import type { Apparatus, Task } from "@/lib/content/schemas";
import { ApparatusGuideContent } from "@/components/lab/ApparatusGuideContent";
import { ApparatusSelectionPanel, type InRoomPanelView } from "@/components/lab/ApparatusSelectionPanel";
import { ApparatusSummaryCard } from "@/components/lab/ApparatusSummaryCard";
import { BenchNotePanel } from "@/components/lab/BenchNotePanel";
import { Button, ReviewBadge } from "@/components/ui";
import { devToolsEnabled } from "@/lib/dev";
import { awardMissionXp } from "@/lib/runtime/gamification";
import {
  APPARATUS_SETUPS,
  createApparatusState,
  GUIDED_STAGES,
  highlightIdsForStep,
  guidedTeacherMessage,
  reduceApparatus,
  resolveGuidedStep,
  stageByIndex,
  type ApparatusAction,
  type ApparatusState,
} from "@/lib/sim/apparatusStore";

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

const IDENTIFY_PROMPTS = [
  { id: "burette", text: "Which apparatus delivers a variable volume, read to 0.05 cm3?" },
  { id: "pipette", text: "Which apparatus delivers one fixed volume, such as 25.0 cm3?" },
  { id: "conical-flask", text: "Which flask holds the solution being titrated?" },
  { id: "filter-funnel", text: "Which apparatus holds filter paper during filtration?" },
  { id: "retort-stand", text: "Which apparatus clamps a burette firmly in place?" },
] as const;

function exploreTeacherHint(state: ApparatusState): string {
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

export function ApparatusLaboratory({
  items,
  mode = "explore",
  guidedTasks = [],
  safetyBriefing = [],
}: {
  items: Apparatus[];
  mode?: "guided" | "explore";
  guidedTasks?: Task[];
  safetyBriefing?: string[];
}) {
  const [snap, setSnap] = useState<ApparatusState>(() => createApparatusState(items, mode, guidedTasks));
  const [guidedDetailsOpen, setGuidedDetailsOpen] = useState(false);
  const [viewLocked, setViewLocked] = useState(false);
  const [labFullscreen, setLabFullscreen] = useState(false);
  const [inRoomPanelView, setInRoomPanelView] = useState<InRoomPanelView>("selection");
  const studentGuideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!labFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLabFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [labFullscreen]);

  const store = useMemo(() => {
    const initial = createApparatusState(items, mode, guidedTasks);
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
  }, [items, mode, guidedTasks]);

  const dispatch = useCallback((action: ApparatusAction) => store.getState().dispatch(action), [store]);
  const select = useCallback(
    (id: string) => {
      setInRoomPanelView("selection");
      dispatch({ type: "select", id });
      if (snap.mode !== "guided") return;
      const stage = stageByIndex(snap.guidedStageIndex);
      const step = resolveGuidedStep(stage, snap);
      if (stage.id === "identify" && snap.identifyPromptId && step?.primaryAction.kind === "identify" && id === step.primaryAction.apparatusId) {
        dispatch({ type: "guess", id });
      }
    },
    [dispatch, snap],
  );
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
  const scrollToStudentGuide = useCallback(() => {
    studentGuideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (snap.mode !== "guided" || snap.stageComplete) return;
    const currentStage = stageByIndex(snap.guidedStageIndex);
    if (currentStage.id !== "identify") return;
    const step = resolveGuidedStep(currentStage, snap);
    if (step?.primaryAction.kind !== "identify") return;
    const targetId = step.primaryAction.apparatusId;
    if (snap.identifyPromptId !== targetId) {
      dispatch({ type: "startIdentify", id: targetId });
    }
  }, [snap.mode, snap.stageComplete, snap.guidedStageIndex, snap.guidedStepIndex, snap.identifyPromptId, dispatch]);

  const stage = stageByIndex(snap.guidedStageIndex);
  const guidedStep = snap.mode === "guided" && !snap.stageComplete ? resolveGuidedStep(stage, snap) : null;
  const hint = snap.mode === "guided" ? guidedTeacherMessage(snap) : exploreTeacherHint(snap);
  const highlightIds =
    snap.mode === "guided" && guidedStep ? highlightIdsForStep(guidedStep, snap.hintLevel, { identifyPromptId: snap.identifyPromptId }) : [];

  const selected = snap.items.find((item) => item.id === snap.selectedId) ?? null;
  const activePrompt = IDENTIFY_PROMPTS.find((prompt) => prompt.id === snap.identifyPromptId) ?? null;
  const setup = snap.setupId ? APPARATUS_SETUPS[snap.setupId] : null;
  const required = setup?.map((id) => snap.items.find((item) => item.id === id)?.name ?? id) ?? [];

  const readingChoices = useMemo(() => {
    if (snap.trueReading === null) return [];
    const values = [snap.trueReading, snap.trueReading + 0.1, snap.trueReading - 0.1, snap.trueReading + 0.05];
    return Array.from(new Set(values.map((value) => Math.round(value * 100) / 100))).sort(() => 0.5 - Math.random());
  }, [snap.trueReading]);

  const benchNote = useMemo(() => {
    const safetyLines = safetyBriefing.length
      ? safetyBriefing
      : [
          "Wear a laboratory coat and eye protection.",
          "Never eat or drink in the laboratory.",
          "Report every accident or breakage to your teacher at once.",
        ];

    if (snap.mode === "guided" && stage.id === "safety") {
      return {
        eyebrow: "Safety briefing",
        title: "Read before you start",
        accent: "#b45309",
        lines: safetyLines,
        footer: "Answer the safety check on the bench note to continue.",
      };
    }
    if (snap.mode === "guided" && stage.id === "identify") {
      return {
        eyebrow: "Apparatus note",
        title: selected?.name ?? "Identify the apparatus",
        accent: "#0369a1",
        lines: selected
          ? [
              selected.use,
              selected.safety ? `Safety: ${selected.safety}` : "",
              ...(selected.howTo ?? []).slice(0, 2),
            ].filter(Boolean)
          : [guidedStep?.hint0 ?? "Select an apparatus on the shelves."],
        footer: selected ? "Click the apparatus in the room, then submit." : "Click an apparatus to read its note.",
      };
    }
    if (snap.mode === "explore") {
      return selected
        ? {
            eyebrow: "Apparatus note",
            title: selected.name,
            accent: "#0369a1",
            lines: [selected.use, selected.safety ? `Safety: ${selected.safety}` : ""].filter(Boolean),
            footer: "Drag it to the bench or double-click it.",
          }
        : {
            eyebrow: "Apparatus note",
            title: "Apparatus laboratory",
            accent: "#0369a1",
            lines: ["Choose an apparatus from the shelves, then read its note here.", "Read the meniscus at eye level."],
            footer: "Ask Ms. Ada if you are unsure.",
          };
    }
    return {
      eyebrow: "Guided note",
      title: stage.title,
      accent: "#0f766e",
      lines: [stage.theory, guidedStep?.hint0 ?? ""].filter(Boolean),
      footer: "Follow the bench note. Click Ms. Ada's speech bubble if you need a hint.",
    };
  }, [snap.mode, stage.id, stage.title, stage.theory, guidedStep?.hint0, selected, safetyBriefing]);

  const noteContent = (
    <BenchNotePanel
      note={benchNote}
      guided={snap.mode === "guided"}
      step={guidedStep}
      state={snap}
      stageTitle={stage.title}
      onDispatch={dispatch}
      readingChoices={readingChoices}
    />
  );

  const selectionPanel = selected ? (
    <ApparatusSelectionPanel
      item={selected}
      onBench={snap.bench.includes(selected.id)}
      view={inRoomPanelView}
      onViewChange={setInRoomPanelView}
      onCancel={() => {
        setInRoomPanelView("selection");
        dispatch({ type: "deselect" });
      }}
      onDispatch={dispatch}
      partStates={snap.partStates}
    />
  ) : null;

  return (
    <div className="grid gap-4">
      {snap.mode === "guided" ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Guided laboratory</p>
            <p className="text-sm font-medium text-slate-900">
              Stage {snap.guidedStageIndex + 1}/{GUIDED_STAGES.length}: {stage.title}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {devToolsEnabled() ? (
              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold text-amber-800">Test:</span>
                <select
                  className="min-h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800"
                  value={snap.guidedStageIndex}
                  onChange={(e) => dispatch({ type: "jumpToGuidedStage", index: Number(e.target.value) })}
                  aria-label="Jump to guided stage for testing"
                >
                  {GUIDED_STAGES.map((entry, index) => (
                    <option key={entry.id} value={index}>
                      {index + 1}. {entry.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {!snap.stageComplete ? (
              <Button variant="ghost" className="text-xs" onClick={() => dispatch({ type: "requestHint" })}>
                Ask Ms. Ada ({snap.hintLevel}/2)
              </Button>
            ) : null}
            <Button className="text-xs" disabled={!snap.stageComplete} onClick={() => dispatch({ type: "advanceGuided" })}>
              Next stage
            </Button>
            <Button variant="ghost" className="text-xs" onClick={() => setGuidedDetailsOpen((v) => !v)}>
              {guidedDetailsOpen ? "Hide details below" : "Expand details below"}
            </Button>
          </div>
        </div>
      ) : null}

      <Room3D
        items={snap.items}
        selectedId={snap.selectedId}
        bench={snap.bench}
        onSelect={select}
        onMoveToBench={moveToBench}
        onReturnToShelf={returnToShelf}
        onReorderBench={reorderBench}
        onClearBench={clearBench}
        highlightIds={highlightIds}
        viewLocked={viewLocked}
        onViewLockedChange={setViewLocked}
        fullscreen={labFullscreen}
        onFullscreenChange={setLabFullscreen}
        teacherHint={hint}
        benchNote={benchNote}
        noteContent={noteContent}
        onTeacherClick={
          snap.mode === "guided"
            ? () => dispatch({ type: snap.stageComplete ? "advanceGuided" : "requestHint" })
            : undefined
        }
        selectionPanel={selectionPanel}
      />

      <section
        id="apparatus-student-guide"
        ref={studentGuideRef}
        className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm lg:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Apparatus guide</p>
            <h2 className="text-2xl font-bold text-slate-900">{selected?.name ?? "Select apparatus in the laboratory"}</h2>
            <p className="mt-1 text-sm text-slate-600">Full reference — use while the 3D room stays open above.</p>
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
              <p className="text-center text-[11px] text-slate-500">Drag to rotate · scroll to zoom</p>
              {snap.bench.includes(selected.id) ? (
                <Button className="text-xs" onClick={() => returnToShelf(selected.id)}>Return to shelf</Button>
              ) : (
                <Button className="text-xs" onClick={() => moveToBench(selected.id)}>Move to bench</Button>
              )}
            </div>
            <ApparatusGuideContent item={selected} variant="full" />
          </div>
        ) : (
          <p className="text-sm text-slate-600">Click any apparatus in the room to open its guide here.</p>
        )}
      </section>

      {snap.mode === "guided" && guidedDetailsOpen ? (
        <section className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4 text-sm text-slate-700">
          <p className="font-semibold text-violet-900">Stage reference</p>
          <p className="mt-1">{stage.theory}</p>
        </section>
      ) : null}

      {snap.mode === "explore" ? (
        <>
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
                ) : null}
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
                      <button key={id} type="button" onClick={() => select(id)} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${snap.selectedId === id ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-300 bg-white text-slate-700"}`}>
                        {item?.name ?? id}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Nothing on the bench yet.</p>
              )}
              <Button variant="ghost" className="text-xs" disabled={!snap.bench.length} onClick={clearBench}>
                Clear the bench
              </Button>
            </section>
          </div>
        </>
      ) : null}

      {snap.showSummary ? (
        <ApparatusSummaryCard state={snap} onClose={() => dispatch({ type: "closeSummary" })} />
      ) : null}
    </div>
  );
}
