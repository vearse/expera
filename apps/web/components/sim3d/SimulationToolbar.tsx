"use client";

import { LabMenu } from "@/components/lab/LabMenu";

export type SimulationViewOption = {
  id: string;
  label: string;
};

export function SimulationToolbar({
  views = [],
  activeView,
  onViewChange,
  onHistory,
  historyActive = false,
  locked,
  onLockChange,
  fullView,
  onFullViewChange,
}: {
  views?: SimulationViewOption[];
  activeView?: string;
  onViewChange?: (id: string) => void;
  onHistory?: () => void;
  historyActive?: boolean;
  locked?: boolean;
  onLockChange?: (locked: boolean) => void;
  fullView?: boolean;
  onFullViewChange?: (full: boolean) => void;
}) {
  const base =
    "min-h-10 w-full justify-center rounded-lg px-3 text-xs font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:min-h-9 sm:w-auto";
  const idle = "bg-white/90 text-slate-700 hover:bg-white";
  const active = "bg-teal-700 text-white";

  return (
    <LabMenu label="Laboratory controls">
      <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:rounded-xl sm:border sm:border-white/70 sm:bg-white/90 sm:p-1.5 sm:shadow-lg sm:backdrop-blur">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onViewChange?.(view.id)}
            aria-pressed={activeView === view.id}
            className={`${base} ${activeView === view.id ? active : idle}`}
          >
            {view.label}
          </button>
        ))}
        {onHistory ? (
          <button type="button" onClick={onHistory} aria-pressed={historyActive} className={`${base} ${historyActive ? "bg-amber-600 text-white" : idle}`}>
            History
          </button>
        ) : null}
        {onFullViewChange ? (
          <button type="button" onClick={() => onFullViewChange(!fullView)} className={`${base} ${idle}`}>
            {fullView ? "Exit full view" : "Full view"}
          </button>
        ) : null}
        {onLockChange ? (
          <button
            type="button"
            onClick={() => onLockChange(!locked)}
            aria-pressed={locked}
            className={`${base} ${locked ? "bg-amber-600 text-white" : idle}`}
          >
            {locked ? "Unlock view" : "Lock view"}
          </button>
        ) : null}
      </div>
    </LabMenu>
  );
}
