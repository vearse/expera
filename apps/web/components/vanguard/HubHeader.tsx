import Link from "next/link";
import { ExperaLogo } from "./ExperaLogo";
import { BtnPrimary } from "./ui";
import { SubjectSwitcher } from "./SubjectSwitcher";

export function HubHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface-container-lowest/95 shadow-sm backdrop-blur-md">
      <div className="vanguard-container flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 p-1.5 transition group-hover:scale-105">
              <ExperaLogo className="size-full text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-on-surface">Expera</span>
            <span className="hidden rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-secondary-container sm:inline">
              STEM Labs
            </span>
          </Link>
          <SubjectSwitcher compact />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="hidden text-sm font-medium text-secondary hover:text-primary sm:inline">
            Home
          </Link>
          <BtnPrimary href="/#early-access" className="min-h-10 px-4 text-sm">
            Early access
          </BtnPrimary>
        </div>
      </div>
    </header>
  );
}
