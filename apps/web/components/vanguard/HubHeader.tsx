import Link from "next/link";
import { BrandLogo, BrandMark } from "./BrandLogo";
import { BtnPrimary } from "./ui";
import { SubjectSwitcher } from "./SubjectSwitcher";

export function HubHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface-container-lowest/95 shadow-sm backdrop-blur-md">
      <div className="vanguard-container flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" aria-label="Expera home" className="shrink-0">
            <BrandMark className="h-10 w-10 sm:hidden" />
            <BrandLogo className="hidden h-14 sm:block" />
          </Link>
          <SubjectSwitcher compact />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="hidden text-sm font-medium text-secondary hover:text-primary sm:inline">
            Home
          </Link>
          <BtnPrimary href="/#waitlist" className="min-h-10 px-4 text-sm">
            Early access
          </BtnPrimary>
        </div>
      </div>
    </header>
  );
}
