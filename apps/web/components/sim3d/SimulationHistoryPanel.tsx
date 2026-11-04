"use client";

import { useEffect, type ReactNode } from "react";

export type HistoryColumn = {
  key: string;
  header: string;
  align?: "left" | "right";
};

export type HistoryRow = {
  key: string;
  cells: Record<string, ReactNode>;
  tone?: "pending";
};

export function SimulationHistoryPanel({
  open,
  onClose,
  title,
  subtitle,
  columns,
  rows,
  emptyMessage,
  activity = [],
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  columns: HistoryColumn[];
  rows: HistoryRow[];
  emptyMessage: string;
  activity?: Array<{ id: string; message: string; at?: string }>;
  footer?: ReactNode;
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

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex max-h-[min(86vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Experiment history</p>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle ? <p className="text-xs text-slate-600">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
              {emptyMessage}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                    {columns.map((column) => (
                      <th key={column.key} scope="col" className={`px-2 py-2 font-semibold ${column.align === "right" ? "text-right" : "text-left"}`}>
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className={`border-b border-slate-100 ${row.tone === "pending" ? "bg-amber-50/70 text-amber-950" : "text-slate-800"}`}>
                      {columns.map((column) => (
                        <td key={column.key} className={`px-2 py-2 ${column.align === "right" ? "text-right tabular-nums" : "text-left"}`}>
                          {row.cells[column.key] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {footer ? <div className="mt-3 rounded-xl border bg-slate-50 p-3 text-xs text-slate-700">{footer}</div> : null}

          {activity.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Activity</p>
              <ol className="mt-1.5 grid gap-1">
                {activity.map((entry) => (
                  <li key={entry.id} className="flex gap-2 text-[11px] text-slate-600">
                    {entry.at ? <span className="shrink-0 font-mono text-[10px] text-slate-400">{entry.at}</span> : null}
                    <span>{entry.message}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
