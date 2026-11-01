import Link from "next/link";
import { ExperaLogo } from "./ExperaLogo";

export function HubFooter() {
  return (
    <footer className="mt-12 border-t border-outline-variant/30 bg-surface-container-low">
      <div className="vanguard-container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ExperaLogo className="size-5 text-primary" />
            <span className="font-display font-bold text-primary">Expera</span>
            <span className="text-sm text-secondary">· Made for Nigerian schools 🇳🇬</span>
          </div>
          <p className="mt-2 max-w-xl text-sm text-secondary">
            Interactive STEM virtual laboratories. Content mapped toward WAEC, NECO, JAMB and BECE contexts — not official endorsement.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/chemistry" className="hover:text-primary">
            Chemistry
          </Link>
          <Link href="/biology" className="hover:text-primary">
            Biology
          </Link>
          <Link href="/physics" className="hover:text-primary">
            Physics
          </Link>
          <Link href="/contact" className="hover:text-primary">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
