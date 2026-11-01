"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Apparatus } from "@/lib/content/schemas";
import { ApparatusGuide } from "@/components/lab/ApparatusGuide";

const Room3D = dynamic(() => import("@/components/sim3d/ApparatusInventoryRoom3D"), {
  ssr: false,
  loading: () => <div className="flex h-[440px] items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 text-sm text-slate-600 sm:h-[560px]">Loading the 3D laboratory…</div>,
});

const Viewer3D = dynamic(() => import("@/components/sim3d/ApparatusViewer3D"), {
  ssr: false,
  loading: () => <div className="flex h-56 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-sm text-slate-400">Loading 3D model…</div>,
});

export function ApparatusInventory({ items, title, subject }: { items: Apparatus[]; title: string; subject: "physics" | "biology" }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);

  return (
    <div className="grid gap-4">
      <Room3D
        items={items}
        selectedId={selectedId}
        onSelect={setSelectedId}
        title={title}
       subject={subject}
        teacherHint={selected ? `${selected.name}: ${selected.use}` : "Click an apparatus on the shelves to see its guide."}
      />

      <section className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Apparatus list">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Choose an apparatus</h2>
          <p className="text-xs text-slate-500">The same list works without 3D.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              aria-pressed={item.id === selectedId}
              className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${item.id === selectedId ? "border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-200" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-400"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <ApparatusGuide
          item={selected}
          viewer={
            <>
              <Viewer3D id={selected.id} className="h-64 lg:h-72" />
              <p className="text-center text-[11px] text-slate-500">Live 3D model. Drag to rotate and scroll to zoom.</p>
            </>
          }
        />
      ) : null}
    </div>
  );
}
