"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "./ui";

const SUBJECTS = [
  { href: "/chemistry", label: "Chemistry", icon: "science", live: true },
  { href: "/biology", label: "Biology", icon: "psychology", live: true },
  { href: "/physics", label: "Physics", icon: "motion_sensor_active", live: true },
] as const;

export function SubjectSwitcher({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  if (compact) {
    return (
      <nav className="hidden items-center gap-1 rounded-full border border-outline-variant/40 bg-surface-container-low p-1 lg:flex" aria-label="Subjects">
        {SUBJECTS.map((s) => {
          const active = pathname.startsWith(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-on-surface"
              }`}
            >
              <MaterialIcon name={s.icon} className="text-base" />
              {s.label}
              <span className={`size-1.5 rounded-full ${s.live ? (active ? "bg-primary-container" : "bg-outline-variant") : "bg-outline-variant"}`} />
            </Link>
          );
        })}
      </nav>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {SUBJECTS.map((s) => (
        <Link key={s.href} href={s.href} className="rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface hover:border-primary/40">
          {s.label}
        </Link>
      ))}
    </div>
  );
}
