"use client";

import { useEffect, useState } from "react";
import { summarise, useProgress } from "@/lib/runtime/progress";

export function ProgressBadge({ experimentId, learnId }: { experimentId?: string; learnId?: string }) {
  const [mounted, setMounted] = useState(false);
  const result = useProgress((s) => (experimentId ? s.results[experimentId] : undefined));
  const visited = useProgress((s) => (learnId ? s.visited[learnId] : undefined));
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (result) {
    const s = summarise(result.outcomes);
    return <span className="mt-1 block text-xs text-sky-800">Last attempt: {s.correct}/{s.total} steps correct</span>;
  }
  if (visited) return <span className="mt-1 block text-xs text-sky-800">Explored</span>;
  return null;
}

export function MarkVisited({ id }: { id: string }) {
  const visit = useProgress((s) => s.visit);
  useEffect(() => visit(id), [id, visit]);
  return null;
}
