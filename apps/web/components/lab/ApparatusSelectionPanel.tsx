"use client";

import type { Apparatus } from "@/lib/content/schemas";
import { ApparatusGuideContent } from "@/components/lab/ApparatusGuideContent";
import { Button } from "@/components/ui";
import type { ApparatusPartStates } from "@/lib/sim/apparatusPartStates";
import type { ApparatusAction } from "@/lib/sim/apparatusStore";

type TogglePart = "bunsen-lit" | "bunsen-air";

export type InRoomPanelView = "selection" | "guide";

export function ApparatusSelectionPanel({
  item,
  onBench,
  view,
  onViewChange,
  onCancel,
  onDispatch,
  partStates,
}: {
  item: Apparatus;
  onBench: boolean;
  view: InRoomPanelView;
  onViewChange: (view: InRoomPanelView) => void;
  onCancel: () => void;
  onDispatch: (action: ApparatusAction) => void;
  partStates: ApparatusPartStates;
}) {
  const toggles: { id: TogglePart; label: string; show: boolean; on: boolean }[] = [
    { id: "bunsen-lit", label: "Gas tap / flame", show: item.id === "bunsen-burner", on: partStates.bunsen.lit },
    { id: "bunsen-air", label: "Air hole (blue flame)", show: item.id === "bunsen-burner", on: partStates.bunsen.airOpen },
  ];

  return (
    <aside
      className="pointer-events-auto flex max-h-[min(420px,55vh)] w-full max-w-[18rem] flex-col overflow-hidden rounded-xl border border-sky-200/90 bg-white/95 shadow-xl backdrop-blur-md"
      aria-label={view === "guide" ? `Apparatus guide: ${item.name}` : `Selected: ${item.name}`}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex gap-1">
            <button
              type="button"
              onClick={() => onViewChange("selection")}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${view === "selection" ? "bg-sky-700 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Selected
            </button>
            <button
              type="button"
              onClick={() => onViewChange("guide")}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${view === "guide" ? "bg-sky-700 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Guide
            </button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
            {view === "guide" ? "Apparatus guide" : "Selected apparatus"}
          </p>
          <h2 className="truncate text-base font-bold text-slate-900">{item.name}</h2>
          {view === "selection" ? (
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${onBench ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
              {onBench ? "On the bench" : "On the shelf"}
            </span>
          ) : null}
        </div>
        <button type="button" onClick={onCancel} className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2.5">
        {view === "selection" ? (
          <div className="grid gap-2.5">
            <p className="text-sm leading-relaxed text-slate-700">{item.use}</p>
            <p className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Move:</span> click a green bench slot to place, or{" "}
              <span className="font-semibold">Shift+drag</span> in the room. Double-click toggles shelf/bench.
            </p>
            <div className="flex flex-wrap gap-2">
              {onBench ? (
                <Button variant="ghost" className="text-xs" onClick={() => onDispatch({ type: "toShelf" })}>
                  Return to shelf
                </Button>
              ) : (
                <Button className="text-xs" onClick={() => onDispatch({ type: "toBench" })}>
                  Move to bench
                </Button>
              )}
              <Button variant="ghost" className="text-xs" onClick={() => onViewChange("guide")}>
                Full guide
              </Button>
            </div>
            {onBench && toggles.some((t) => t.show) ? (
              <div className="grid gap-1 border-t border-slate-100 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Parts</p>
                {toggles
                  .filter((t) => t.show)
                  .map((t) => (
                    <Button
                      key={t.id}
                      variant={t.on ? "primary" : "ghost"}
                      className="justify-start text-xs"
                      onClick={() => onDispatch({ type: "togglePart", part: t.id === "bunsen-lit" ? "bunsen-lit" : "bunsen-air" })}
                    >
                      {t.label}
                    </Button>
                  ))}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <ApparatusGuideContent item={item} variant="compact" />
            <button type="button" className="text-left text-[11px] font-bold text-sky-700 underline" onClick={() => onViewChange("selection")}>
              ← Back to selected
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
