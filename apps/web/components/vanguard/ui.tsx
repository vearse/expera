import Link from "next/link";
import type { FeatureStatus } from "@/components/landing/landing-data";
import { STATUS_LABEL } from "@/components/landing/landing-data";

export function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export function StatusChip({ status }: { status: FeatureStatus }) {
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

export function BtnPrimary({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-container px-6 text-sm font-bold text-on-primary-container shadow-emerald custom-emerald-shadow transition hover:opacity-95 active:scale-[0.98] ${className}`}
    >
      {children}
    </Link>
  );
}

export function BtnSecondary({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-6 text-sm font-semibold text-on-surface transition hover:bg-surface-container ${className}`}
    >
      {children}
    </Link>
  );
}

export function SectionShell({
  id,
  children,
  className = "bg-background",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 lg:py-24 ${className}`}>
      <div className="vanguard-container">{children}</div>
    </section>
  );
}
