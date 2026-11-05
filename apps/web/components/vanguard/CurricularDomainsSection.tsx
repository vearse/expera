"use client";

import Link from "next/link";
import { MaterialIcon } from "./ui";

const EXAM_NOTE = "Examination names are design context only — Expera is not officially endorsed by WAEC, NECO, JAMB, or BECE.";

const DOMAIN_CARDS = [
  {
    href: "/chemistry",
    title: "Chemistry Suite",
    icon: "science",
    badge: "Fully interactive",
    badgeClass: "bg-primary text-white",
    body: "Master volumetric analysis, qualitative inorganic analysis, gas preparation, and standard redox reactions.",
    items: ["Acid-base titration (HCl, H₂SO₄, Na₂CO₃)", "Identification of anions: SO₄²⁻, Cl⁻, NO₃⁻", "Flame tests for metal cations (Cu²⁺, Ca²⁺, Na⁺)"],
    cta: "Launch Chemistry Lab",
    card: "border-primary/20 bg-gradient-to-b from-primary/5 to-white",
    iconBg: "bg-primary",
    check: "text-primary",
    button: "bg-primary text-white hover:bg-primary-container hover:text-on-primary-container",
  },
  {
    href: "/biology",
    title: "Biology Suite",
    icon: "biotech",
    badge: "Core practicals available",
    badgeClass: "bg-amber-500/15 text-amber-800",
    body: "Cytology, food tests (Benedict’s, Biuret, iodine), osmosis in living plant tissues, and specimen drawing.",
    items: ["Onion epidermis microscopy", "Benedict, Biuret, and iodine food tests", "Specimen drawing and labelling"],
    cta: "Launch Biology Lab",
    card: "border-outline-variant/40 bg-white",
    iconBg: "bg-amber-600",
    check: "text-amber-700",
    button: "bg-surface-container text-on-surface hover:bg-surface-container-high",
  },
  {
    href: "/physics",
    title: "Physics Suite",
    icon: "straighten",
    badge: "Wave 2 development",
    badgeClass: "bg-blue-100 text-blue-900",
    body: "Mechanics measurement instruments, simple harmonic motion, Hooke's law springs, and optical ray-tracing through glass prisms.",
    items: ["Vernier calipers and micrometer", "Simple pendulum (g = 9.8 ms⁻²)", "Refraction in triangular prisms"],
    cta: "Open Physics Hub",
    card: "border-outline-variant/40 bg-white",
    iconBg: "bg-[#0053db]",
    check: "text-[#0053db]",
    button: "bg-surface-container text-on-surface hover:bg-surface-container-high",
  },
] as const;

const EXTENDED_SUBJECTS = [
  "Agricultural science",
  "Basic technology",
  "Computer studies / ICT",
  "Food & nutrition",
  "Further mathematics (support)",
  "Technical drawing (support)",
] as const;

export function CurricularDomainsSection() {
  return (
    <section id="curriculum" className="border-y border-outline-variant/20 bg-white py-20 lg:py-20">
      <div className="vanguard-container">
        <div className="mb-14 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Curricular Domains</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">Discover science, one experiment at a time.</h2>
          <p className="mt-2 text-on-surface-variant">Explore dedicated suites crafted around the exact syllabi prescribed by NERDC, WAEC, NECO, and JAMB.</p>
        </div>

        <div className="mb-10 grid items-stretch gap-8 lg:grid-cols-3">
          {DOMAIN_CARDS.map((card) => (
            <article key={card.href} className={`glass-hover flex flex-col justify-between rounded-2xl border p-8 ${card.card}`}>
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className={`grid size-12 place-items-center rounded-xl text-white shadow-md ${card.iconBg}`}>
                    <MaterialIcon name={card.icon} />
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${card.badgeClass}`}>{card.badge}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-on-surface">{card.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{card.body}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {card.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <MaterialIcon name="check_circle" className={`shrink-0 text-lg ${card.check}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={card.href} className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-bold transition ${card.button}`}>
                {card.cta}
              </Link>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-display font-semibold text-on-surface">More Nigerian curriculum on the roadmap</p>
            <p className="mt-1 text-sm text-on-surface-variant">Early access schools help prioritize the next domains we ship.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXTENDED_SUBJECTS.map((s) => (
              <span key={s} className="rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-on-surface-variant">
                {s}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-on-surface-variant">{EXAM_NOTE}</p>
      </div>
    </section>
  );
}
