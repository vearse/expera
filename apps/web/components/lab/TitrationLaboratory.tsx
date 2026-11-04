"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Indicator } from "@/lib/content/schemas";
import { indicatorColour } from "@/lib/engine/ph";
import { awardMissionXp } from "@/lib/runtime/gamification";
import { TeacherVoiceDock } from "@/components/teacher/TeacherVoiceDock";
import { TitrationReadingPanel } from "@/components/lab/TitrationReadingPanel";
import { SimulationHistoryPanel, type HistoryColumn, type HistoryRow } from "@/components/sim3d/SimulationHistoryPanel";
import {
  createTitrationState,
  currentPH,
  reduceTitration,
  titrationSummary,
  type TitrationAction,
  type TitrationState,
} from "@/lib/sim/titrationStore";
import { TITRATION_GUIDED_STEPS } from "@/lib/sim/titrationGuide";
import { useGuidedSimulation } from "@/lib/sim/useGuidedSimulation";
import { safetyMessageId, titrationMistakeMessageId, titrationStepMessageId } from "@/lib/teacherVoice/adapters";
import { emitTeacherEvent } from "@/lib/teacherVoice/events";
import { useTeacherVoiceModule } from "@/lib/teacherVoice/useTeacherVoiceModule";
import type { SafetyRuleInput } from "@/lib/sim/simulationTypes";
import { Button } from "@/components/ui";

const Bench3D = dynamic(() => import("@/components/sim3d/TitrationBench3D"), {
  ssr: false,
  loading: () => <p className="text-sm">Loading 3D bench…</p>,
});

type TimedActivity = { id: string; message: string; at: string };

export function TitrationLaboratory({ rules, indicator, pipetteVolume }: { rules: SafetyRuleInput[]; indicator: Indicator; pipetteVolume: number }) {
  const [practice, setPractice] = useState<"regular" | "exam">("regular");
  const teacher = useTeacherVoiceModule({ moduleId: "chemistry/titration", mode: practice === "regular" ? "guided" : "exam" });
  const [notice, setNotice] = useState<string | null>(null);
  const [activity, setActivity] = useState<TimedActivity[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reading, setReading] = useState<null | "initial" | "final">(null);
  const [snap, setSnap] = useState<TitrationState>(() => createTitrationState("regular", 1, pipetteVolume));
  const snapRef = useRef(snap);

  const dispatch = useCallback(
    (action: TitrationAction) => {
      const current = snapRef.current;
      const next = reduceTitration(current, action, rules);
      for (const event of next.safetyEvents) {
        emitTeacherEvent({ type: "safetyWarning", moduleId: "chemistry/titration", messageId: safetyMessageId(event.ruleId) });
      }
      if (next.state.mistakes.length > current.mistakes.length) {
        for (const mistake of next.state.mistakes.slice(current.mistakes.length)) {
          const messageId = titrationMistakeMessageId(mistake);
          if (messageId) emitTeacherEvent({ type: "mistakeDetected", moduleId: "chemistry/titration", messageId });
        }
      }
      if (!current.criticalSafetyOpen) {
        for (const event of next.events) {
          if (event.xp) awardMissionXp(`${event.id}-${current.seed}-${current.rows.length}`, event.xp, event.badgeId);
        }
      }
      snapRef.current = next.state;
      setSnap(next.state);
      const lines = [...next.events.map((event) => event.message), ...next.safetyEvents.map((event) => `${event.message} ${event.safeProcedure}`)];
      if (lines.length) {
        setNotice(lines[0]!);
        const at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const stamped = lines.map((message, index) => ({ id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`, message, at }));
        setActivity((previous) => [...stamped.reverse(), ...previous].slice(0, 14));
      }
    },
    [rules],
  );

  const guided = useGuidedSimulation<TitrationState, TitrationAction>({
    steps: TITRATION_GUIDED_STEPS,
    state: snap,
    dispatch,
    onSpecialTarget: (target) => {
      if (target.kind === "reading") setReading(target.reading ?? "initial");
    },
  });

  const guidedStepId = guided.step?.id ?? null;
  useEffect(() => {
    if (guidedStepId) {
      teacher.stepStarted(guidedStepId, titrationStepMessageId(guidedStepId));
      return;
    }
    if (snap.finished) teacher.message("chemistry.titration.complete");
  }, [guidedStepId, practice, snap.finished, snap.seed, teacher]);

  const ph = currentPH(snap);
  const colour = ph === null || snap.indicatorDrops === 0 ? { name: "no indicator colour yet", hex: "#e2e8f0" } : indicatorColour(indicator, ph);
  const summary = titrationSummary(snap);

  const restart = (nextMode: "regular" | "exam", seed: number) => {
    dispatch({ type: "restart", seed, mode: nextMode });
    setActivity([]);
    setNotice(null);
    setReading(null);
  };

  const pendingRow =
    snap.initialRecorded !== null && snap.rows.length === snap.trialIndex
      ? { label: snap.labels[snap.trialIndex] ?? "Trial", initial: snap.initialRecorded }
      : null;

  const historyColumns: HistoryColumn[] = [
    { key: "trial", header: "Trial" },
    { key: "initial", header: "Initial (cm³)", align: "right" },
    { key: "final", header: "Final (cm³)", align: "right" },
    { key: "titre", header: "Titre (cm³)", align: "right" },
    { key: "status", header: "Status" },
  ];

  const historyRows: HistoryRow[] = [
    ...snap.rows.map((row) => ({
      key: `recorded-${row.label}`,
      cells: {
        trial: row.label,
        initial: row.initial.toFixed(2),
        final: row.final.toFixed(2),
        titre: row.titre.toFixed(2),
        status: "Recorded",
      },
    })),
    ...(pendingRow
      ? [
          {
            key: "pending-reading",
            tone: "pending" as const,
            cells: {
              trial: pendingRow.label,
              initial: pendingRow.initial.toFixed(2),
              final: "—",
              titre: "—",
              status: "Pending final reading",
            },
          },
        ]
      : []),
  ];

  const historyFooter =
    summary.average !== null && summary.calculation ? (
      <div className="grid gap-1">
        <p>
          Concordant titres: {summary.concordant.map((n) => n.toFixed(2)).join(", ")} cm³. Average {summary.average.toFixed(2)} cm³.
        </p>
        <p>
          mol of acid = {snap.problem.acidConc} × {summary.average.toFixed(2)} / 1000 = {summary.calculation.molAcid.toFixed(5)} mol.
        </p>
        <p>
          Base concentration = {summary.calculation.baseConc.toFixed(4)} mol dm⁻³ ({summary.calculation.baseMassConc.toFixed(2)} g dm⁻³).
        </p>
      </div>
    ) : undefined;

  return (
    <div className="grid gap-4" onPointerDown={teacher.notifyInteraction}>
      <TeacherVoiceDock />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {snap.problem.reaction.equation}. Acid in the burette ({snap.problem.acidConc} mol dm-3 {snap.problem.reaction.acid.name}).
          {practice === "exam" ? " The base concentration is hidden." : ` Base is ${snap.problem.baseConc} mol dm-3 ${snap.problem.reaction.base.name}.`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={practice === "regular" ? "primary" : "ghost"}
            onClick={() => {
              setPractice("regular");
              restart("regular", 1);
            }}
          >
            Regular Practice
          </Button>
          <Button
            variant={practice === "exam" ? "primary" : "ghost"}
            onClick={() => {
              setPractice("exam");
              restart("exam", 2);
            }}
          >
            Exam Preparation
          </Button>
          <Button variant="ghost" onClick={() => restart(practice, Math.floor(Math.random() * 1e6))}>
            New sample
          </Button>
        </div>
      </div>

      <Bench3D state={snap} colour={colour.hex} guided={guided} onHistory={() => setHistoryOpen(true)} notice={notice} />

      <TitrationReadingPanel
        open={reading !== null}
        kind={reading ?? "initial"}
        state={snap}
        onSetView={(view) => dispatch({ type: "setView", view })}
        onRecord={() => {
          if (!reading) return;
          dispatch(reading === "initial" ? { type: "recordInitial" } : { type: "recordFinal" });
          setReading(null);
        }}
        onClose={() => setReading(null)}
      />

      <SimulationHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Acid-base titration"
        subtitle="Every trial, reading and titre recorded in this simulation."
        columns={historyColumns}
        rows={historyRows}
        emptyMessage="No readings yet. Use the burette scale to record the start of the first titre."
        activity={activity}
        footer={historyFooter}
      />

      {summary.average !== null && summary.calculation && (
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p>
            Concordant titres: {summary.concordant.map((n) => n.toFixed(2)).join(", ")} cm3. Average {summary.average.toFixed(2)} cm3.
          </p>
          <p>
            mol of acid = {snap.problem.acidConc} × {summary.average.toFixed(2)} / 1000 = {summary.calculation.molAcid.toFixed(5)} mol.
          </p>
          <p>
            Base concentration = {summary.calculation.baseConc.toFixed(4)} mol dm-3 ({summary.calculation.baseMassConc.toFixed(2)} g dm-3).
          </p>
          {snap.mistakes.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {snap.mistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
