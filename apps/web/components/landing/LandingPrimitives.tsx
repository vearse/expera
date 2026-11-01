import type { FeatureStatus } from "./landing-data";
import { STATUS_LABEL } from "./landing-data";

export function StatusPill({ status }: { status: FeatureStatus }) {
  const styles: Record<FeatureStatus, string> = {
    available: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    "in-development": "bg-amber-100 text-amber-950 ring-amber-200",
    "coming-soon": "bg-slate-200 text-slate-800 ring-slate-300",
    planned: "bg-violet-100 text-violet-950 ring-violet-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function SectionIntro({
  id,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  id?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const titleClass = tone === "dark" ? "text-white" : "text-expera-navy";
  const bodyClass = tone === "dark" ? "text-white/80" : "text-expera-ink-soft";
  return (
    <header id={id} className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <h2 className={`text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.12] tracking-tight ${titleClass}`}>{title}</h2>
      {description ? <p className={`mt-4 text-lg leading-relaxed ${bodyClass}`}>{description}</p> : null}
    </header>
  );
}

export function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-expera-primary px-6 text-sm font-semibold text-white shadow-[0_12px_30px_var(--expera-shadow)] transition hover:bg-expera-primary-deep ${className}`}
    >
      {children}
    </a>
  );
}

export function GhostButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full border border-expera-border bg-expera-surface/80 px-6 text-sm font-semibold text-expera-navy transition hover:border-expera-primary/40 hover:text-expera-primary-deep ${className}`}
    >
      {children}
    </a>
  );
}
