import type { ButtonHTMLAttributes, ReactNode } from "react";
import { devToolsEnabled } from "@/lib/dev";

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base = "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold disabled:opacity-40";
  const look = variant === "primary" ? "bg-sky-700 text-white hover:bg-sky-800" : "border border-slate-300 bg-white hover:bg-slate-100";
  return <button className={`${base} ${look} ${className}`} {...props} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}

export function ReviewBadge({ status }: { status: string }) {
  if (!devToolsEnabled() || status !== "NEEDS_TEACHER_REVIEW") return null;
  return (
    <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900" title="This content has not yet been checked by a subject teacher.">
      Needs teacher review
    </span>
  );
}

export function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div role="status" className={`mt-3 rounded-lg border p-3 text-sm ${ok ? "border-sky-300 bg-sky-50" : "border-orange-300 bg-orange-50"}`}>
      <strong>{ok ? "Correct. " : "Not quite. "}</strong>
      {children}
    </div>
  );
}

/** Colour swatch that always shows its colour name, so colour is never the only cue. */
export function Swatch({ hex, name }: { hex: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-4 w-4 rounded-full border border-slate-400" style={{ background: hex }} aria-hidden />
      <span>{name}</span>
    </span>
  );
}
