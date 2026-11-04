"use client";

import { useEffect } from "react";
import { buretteReading, recordedLevel, type TitrationState, type ViewAngle } from "@/lib/sim/titrationStore";

const VIEWS: Array<{ id: ViewAngle; label: string }> = [
  { id: "eye", label: "Eye level" },
  { id: "above", label: "From above" },
  { id: "below", label: "From below" },
];

export function TitrationReadingPanel({
  open,
  kind,
  state,
  onSetView,
  onRecord,
  onClose,
}: {
  open: boolean;
  kind: "initial" | "final";
  state: TitrationState;
  onSetView: (view: ViewAngle) => void;
  onRecord: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  if (!open) return null;

  const reading = recordedLevel(buretteReading(state), state.view);
  const disabled = kind === "initial" ? !state.filled : state.initialRecorded === null;

  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-slate-950/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Burette reading">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Burette scale</p>
        <h2 className="text-lg font-bold text-slate-900">{kind === "initial" ? "Record the initial reading" : "Record the final reading"}</h2>
        <p className="mt-1 text-xs leading-snug text-slate-600">Read the bottom of the meniscus with your eye level with the scale. Then record the value.</p>

        <div className="mt-3 rounded-xl bg-slate-900 px-3 py-4 text-center text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
            Scale reading from {state.view === "eye" ? "eye level" : state.view === "above" ? "above" : "below"}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {reading.toFixed(2)} <span className="text-sm font-semibold text-slate-300">cm³</span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => onSetView(view.id)}
              aria-pressed={state.view === view.id}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${
                state.view === view.id ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {state.view !== "eye" ? (
          <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-[11px] leading-snug text-amber-900 ring-1 ring-amber-200">
            Parallax error: your eye is not level with the meniscus. Move to eye level before you record.
          </p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onRecord}
            disabled={disabled}
            className="min-h-10 rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-40"
          >
            Record {kind === "initial" ? "initial" : "final"} reading
          </button>
        </div>
      </div>
    </div>
  );
}
