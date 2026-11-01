"use client";

import { tipForContext } from "@/lib/content/guide";

export function GuideTip({ context }: { context: string }) {
  const tip = tipForContext(context);
  if (!tip) return null;
  return (
    <aside className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm" aria-label="Lab Guide tip">
      <strong className="text-amber-900">Lab Guide:</strong> {tip.text}
    </aside>
  );
}
