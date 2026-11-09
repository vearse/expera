"use client";

import Link from "next/link";
import { useState } from "react";
import { openEarlyAccess } from "./earlyAccess";
import { MaterialIcon } from "./ui";

type Branch = {
  id: string;
  badge: string;
  badgeIdle: string;
  title: string;
  body: string;
  icon: string;
  items: string[];
  cta: string;
  href?: string;
};

const BRANCHES: Branch[] = [
  {
    id: "discovery",
    badge: "Foundation · Discovery STEM",
    badgeIdle: "text-amber-800",
    title: "Discovery STEM",
    body: "Play-first interactive modules igniting curiosity in primary learners through vibrant stories, animations, and foundational physical intuition.",
    icon: "smart_toy",
    items: ["Interactive seed germination and plant growth", "Snap-together safe battery and bulb circuits", "Musical soundwave physics through talking drums"],
    cta: "Join waitlist for Discovery STEM",
  },
  {
    id: "practical",
    badge: "JSS 1 – SSS 3 · Practical STEM",
    badgeIdle: "text-primary",
    title: "Practical STEM",
    body: "Full wet-lab simulations configured to NERDC, WAEC Alternative to Practical, NECO SSCE, and JAMB CBT testing criteria.",
    icon: "science",
    items: [
      "Chemistry, Biology and Physics Wave 1 practicals",
      "Guided practice aligned to national exam standards",
      "Authentic calculation guides and error analysis",
      "Food tests and biological specimen work",
    ],
    cta: "Launch chemistry hub",
    href: "/chemistry",
  },
  {
    id: "applied",
    badge: "Technical · Applied STEM",
    badgeIdle: "text-secondary",
    title: "Applied STEM",
    body: "Vocational and industrial simulations preparing polytechnic and technical college students for career-grade mechanical and electronic engineering.",
    icon: "precision_manufacturing",
    items: ["Multimeter wiring and semiconductor troubleshooting", "Solar inverter installation diagnostics", "Fluid mechanics and pump assembly simulations"],
    cta: "Join the waitlist",
  },
];

export function LandingStemBranches() {
  const [active, setActive] = useState(1);

  return (
    <section className="border-y border-outline-variant/30 bg-surface-container-lowest py-20" id="branches" onMouseLeave={() => setActive(1)}>
      <div className="vanguard-container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="rounded-full bg-surface-container px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">Comprehensive African curriculum</span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Integrated STEM learning branches</h2>
          <p className="mt-3 text-on-surface-variant">Tailored across high-school grades with syllabus mappings for WASSCE, UTME/JAMB, and SSCE/NECO requirements.</p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
          {BRANCHES.map((branch, index) => {
            const on = index === active;
            return (
              <article
                key={branch.id}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`relative flex flex-col rounded-3xl p-8 transition duration-200 ${
                  on
                    ? "z-10 border-2 border-accent bg-brand text-white shadow-2xl shadow-accent/20 lg:-translate-y-4"
                    : "border border-accent-soft bg-white text-brand shadow-sm"
                }`}
              >
                {on ? <div className="absolute -right-12 -top-12 size-44 rounded-full bg-accent/25 blur-2xl" aria-hidden /> : null}
                <div className="relative">
                  {on && branch.id === "practical" ? (
                    <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      <MaterialIcon name="star" className="text-xs" />
                      Core secondary focus
                    </div>
                  ) : (
                    <div className={`mb-6 flex size-12 items-center justify-center rounded-2xl ${on ? "bg-white/10 text-accent-muted" : "bg-accent-soft text-brand"}`}>
                      <MaterialIcon name={branch.icon} className="text-2xl" />
                    </div>
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${on ? "text-accent-muted" : branch.badgeIdle}`}>{branch.badge}</span>
                  <h3 className={`mt-1 mb-3 font-display font-bold ${on ? "text-2xl" : "text-xl"}`}>{branch.title}</h3>
                  <p className={`mb-6 text-sm leading-relaxed ${on ? "text-gray-300" : "text-on-surface-variant"}`}>{branch.body}</p>
                  <ul className={`space-y-2.5 border-t pt-4 text-xs font-medium ${on ? "border-white/10 text-gray-200" : "border-outline-variant/30 text-on-surface"}`}>
                    {branch.items.map((line) => (
                      <li key={line} className="flex items-center gap-2">
                        <MaterialIcon name={on ? "verified" : "check_circle"} className={`text-sm ${on ? "text-accent-muted" : "text-brand"}`} />
                        {line}
                      </li>
                    ))}
                  </ul>
                  {branch.href ? (
                    <Link
                      href={branch.href}
                      className={`mt-8 inline-flex items-center justify-center gap-1 rounded-full px-5 py-3 text-sm font-bold ${
                        on ? "w-full bg-accent text-white hover:bg-accent-hover" : "text-brand hover:underline"
                      }`}
                    >
                      {branch.cta}
                      {on ? null : " →"}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openEarlyAccess()}
                      className={`mt-8 inline-flex items-center justify-center gap-1 rounded-full px-5 py-3 text-sm font-bold ${
                        on ? "w-full bg-accent text-white hover:bg-accent-hover" : "text-brand hover:underline"
                      }`}
                    >
                      {branch.cta}
                      {on ? null : " →"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
