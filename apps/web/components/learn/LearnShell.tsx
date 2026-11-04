"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useProgress } from "@/lib/runtime/progress";
import { GuideTip } from "@/components/gamification/GuideTip";
import { TeacherVoiceDock } from "@/components/teacher/TeacherVoiceDock";
import { useTeacherVoiceModule } from "@/lib/teacherVoice/useTeacherVoiceModule";

export function LearnShell({
  title,
  practiceHref,
  children,
  learnId,
  exploredCount,
  exploredTotal,
  topicBack,
}: {
  title: string;
  practiceHref?: string;
  learnId: string;
  exploredCount?: number;
  exploredTotal?: number;
  topicBack?: boolean;
  children: ReactNode;
}) {
  const visit = useProgress((s) => s.visit);
  const teacher = useTeacherVoiceModule({
    moduleId: `learn/${learnId}`,
    mode: "learn",
    welcomeMessageId: `learn.${learnId}.welcome`,
  });

  useEffect(() => {
    visit(learnId);
  }, [learnId, visit]);

  const complete = exploredTotal !== undefined && (exploredCount ?? 0) >= exploredTotal;
  useEffect(() => {
    if (complete) teacher.message(`learn.${learnId}.complete`);
  }, [complete, learnId, teacher]);

  const backHref = topicBack ? `/chemistry/learn/${learnId}` : "/chemistry?tab=learn";
  const backLabel = topicBack ? "← Module overview" : "← Chemistry Learn";

  return (
    <div className="grid gap-4" onPointerDown={teacher.notifyInteraction}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={backHref} className="text-sm text-sky-700">
            {backLabel}
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          {exploredTotal !== undefined && (
            <p className="text-sm text-slate-600">
              Explored {exploredCount ?? 0} / {exploredTotal} features
            </p>
          )}
        </div>
        {practiceHref && (
          <Link href={practiceHref} className="min-h-11 rounded-lg border border-sky-600 px-4 py-2 text-sm font-semibold text-sky-800">
            Prepares you for practice →
          </Link>
        )}
      </div>
      <TeacherVoiceDock />
      <GuideTip context={`learn:${learnId}`} />
      {children}
    </div>
  );
}
