import Link from "next/link";
import { BtnPrimary, MaterialIcon } from "./ui";

export function LandingStemBranches() {
  return (
    <section className="border-y border-outline-variant/30 bg-surface-container-lowest py-20" id="branches">
      <div className="vanguard-container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="rounded-full bg-surface-container px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Comprehensive African curriculum
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Integrated STEM learning branches</h2>
          <p className="mt-3 text-on-surface-variant">
            Tailored across high-school grades with syllabus mappings for WASSCE, UTME/JAMB, and SSCE/NECO requirements.
          </p>
        </div>

        <div className="mb-20 grid grid-cols-1 items-center gap-8 lg:grid-cols-3">
          <article className="rounded-3xl border border-brand-mint bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
              <MaterialIcon name="smart_toy" className="text-2xl" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Foundation · Discovery STEM</span>
            <h3 className="mt-1 mb-3 font-display text-xl font-bold text-brand-ink">Discovery STEM</h3>
            <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
              Play-first interactive modules igniting curiosity in primary learners through vibrant stories, animations, and foundational physical intuition.
            </p>
            <ul className="space-y-2.5 border-t border-outline-variant/30 pt-4 text-xs font-medium text-on-surface">
              {[
                "Interactive seed germination and plant growth",
                "Snap-together safe battery and bulb circuits",
                "Musical soundwave physics through talking drums",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <MaterialIcon name="check_circle" className="text-sm text-primary" />
                  {line}
                </li>
              ))}
            </ul>
            <Link href="#waitlist" className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
              Join waitlist for Discovery STEM →
            </Link>
          </article>

          <article className="relative overflow-hidden rounded-3xl border-2 border-emerald-500 bg-brand-ink p-9 text-white shadow-2xl shadow-emerald-950/20 lg:-translate-y-4">
            <div className="absolute -right-12 -top-12 size-44 rounded-full bg-emerald-500/20 blur-2xl" aria-hidden />
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-ink">
              <MaterialIcon name="star" className="text-xs" />
              Core secondary focus
            </div>
            <span className="block font-mono text-xs uppercase tracking-wider text-emerald-400">JSS 1 – SSS 3 · Practical STEM</span>
            <h3 className="mt-1 mb-3 font-display text-2xl font-bold">Practical STEM</h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-300">
              Full wet-lab simulations configured to NERDC, WAEC Alternative to Practical, NECO SSCE, and JAMB CBT testing criteria.
            </p>
            <ul className="mb-8 space-y-3 border-t border-white/10 pt-5 text-xs font-medium text-gray-200">
              {[
                "Chemistry, Biology and Physics Wave 1 practicals",
                "Guided practice aligned to national exam standards",
                "Authentic calculation guides and error analysis",
                "Food tests and biological specimen work",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <MaterialIcon name="verified" className="text-sm text-emerald-400" />
                  {line}
                </li>
              ))}
            </ul>
            <BtnPrimary href="/chemistry" className="w-full justify-center bg-emerald-500 text-brand-ink hover:bg-emerald-600">
              Launch chemistry hub
            </BtnPrimary>
          </article>

          <article className="rounded-3xl border border-brand-mint bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary-container/40 text-secondary">
                <MaterialIcon name="precision_manufacturing" className="text-2xl" />
              </div>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-bold uppercase text-secondary">Coming soon</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Technical · Applied STEM</span>
            <h3 className="mt-1 mb-3 font-display text-xl font-bold text-brand-ink">Applied STEM</h3>
            <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
              Vocational and industrial simulations preparing polytechnic and technical college students for career-grade mechanical and electronic engineering.
            </p>
            <ul className="space-y-2.5 border-t border-outline-variant/30 pt-4 text-xs font-medium text-on-surface">
              {[
                "Multimeter wiring and semiconductor troubleshooting",
                "Solar inverter installation diagnostics",
                "Fluid mechanics and pump assembly simulations",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <MaterialIcon name="check_circle" className="text-sm text-secondary" />
                  {line}
                </li>
              ))}
            </ul>
            <Link href="#waitlist" className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-secondary hover:underline">
              Join the waitlist →
            </Link>
          </article>
        </div>

        <h3 className="mb-6 text-center font-display text-xl font-bold text-brand-ink">Featured specimen and apparatus modules</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SpecimenTile
            badge="Chemistry practical"
            badgeClass="text-emerald-600 bg-emerald-50"
            icon="science"
            title="Volumetric and salt analysis"
            body="Titration, apparatus handling, and qualitative analysis scopes from Wave 1 chemistry."
            href="/chemistry"
            footer="7 Wave 1 scopes · 2 live labs"
          />
          <SpecimenTile
            badge="Physics practical"
            badgeClass="text-blue-600 bg-blue-50"
            icon="bolt"
            title="Electricity and ray optics"
            body="Measurement, circuits, and optics practicals planned for Wave 1 physics."
            href="/physics"
            footer="Hub in development"
          />
          <SpecimenTile
            badge="Biology practical"
            badgeClass="text-emerald-700 bg-emerald-50"
            icon="biotech"
            title="Microscopy and ecology"
            body="Cells and microscopy bench live; food tests, osmosis, and specimen work on the Wave 1 roadmap."
            href="/biology"
            footer="6 Wave 1 scopes · microscopy live"
          />
        </div>
      </div>
    </section>
  );
}

function SpecimenTile({
  badge,
  badgeClass,
  icon,
  title,
  body,
  href,
  footer,
}: {
  badge: string;
  badgeClass: string;
  icon: string;
  title: string;
  body: string;
  href: string;
  footer: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-[#cfe7df] bg-white p-6 shadow-sm transition-all hover:border-emerald-500 hover:shadow-lg"
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className={`rounded px-2.5 py-1 font-mono text-xs font-bold ${badgeClass}`}>{badge}</span>
          <MaterialIcon name={icon} className="text-gray-400 transition-colors group-hover:text-primary" />
        </div>
        <div className="mb-4 flex h-32 items-center justify-center rounded-xl border border-brand-mint bg-lab-bg p-4">
          <MaterialIcon name={icon} className="text-5xl text-primary/70" />
        </div>
        <h4 className="mb-1 font-display text-base font-bold text-brand-ink">{title}</h4>
        <p className="text-xs text-on-surface-variant">{body}</p>
      </div>
      <span className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
        {footer}
        <MaterialIcon name="arrow_forward" className="text-xs" />
      </span>
    </Link>
  );
}
