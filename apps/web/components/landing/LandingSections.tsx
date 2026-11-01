"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BENEFITS,
  CHEMISTRY_LABS,
  ENVIRONMENTS,
  EXAMS,
  FAQS,
  FUTURE_SUBJECTS,
  PLANNED_LABS,
  STAGES,
  WAVE1_SUBJECTS,
} from "./landing-data";
import { EarlyAccessForm } from "./EarlyAccessForm";
import { GhostButton, PrimaryButton, SectionIntro, StatusPill } from "./LandingPrimitives";

const accentClass = {
  chemistry: "border-expera-chemistry/30 bg-[oklch(0.96_0.02_195)]",
  physics: "border-expera-physics/30 bg-[oklch(0.96_0.02_245)]",
  biology: "border-expera-biology/30 bg-[oklch(0.96_0.03_145)]",
} as const;

export function ExperienceSection() {
  return (
    <section id="experience" className="expera-section border-t border-expera-border/60 bg-expera-bg-warm/50">
      <div className="expera-container grid gap-12">
        <SectionIntro
          title="One platform. Multiple ways to experience science."
          description="Learn is where students understand. Lab is where they experiment. Practice is where they reinforce. Exam is where they prepare."
        />
        <div className="relative grid gap-4 lg:grid-cols-4">
          {ENVIRONMENTS.map((env, index) => (
            <article
              key={env.id}
              className={`relative flex flex-col rounded-[var(--expera-radius-lg)] border bg-expera-surface p-5 shadow-sm ${
                "featured" in env && env.featured
                  ? "lg:-translate-y-2 lg:shadow-[0_20px_45px_var(--expera-shadow)] ring-2 ring-expera-primary/25"
                  : "border-expera-border"
              }`}
            >
              {index < ENVIRONMENTS.length - 1 ? (
                <span className="pointer-events-none absolute -right-3 top-1/2 hidden text-expera-ink-soft lg:block" aria-hidden>
                  →
                </span>
              ) : null}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-expera-navy">{env.title}</h3>
                <StatusPill status={env.status} />
              </div>
              <p className="mt-1 text-sm font-medium text-expera-primary-deep">{env.tagline}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-expera-ink-soft">{env.description}</p>
              <p className="mt-4 text-xs leading-relaxed text-expera-navy-muted">{env.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LabSection() {
  return (
    <section id="lab" className="expera-section">
      <div className="expera-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionIntro
          title="Your next science laboratory could be anywhere."
          description="Expera turns scientific experiments into interactive digital experiences. Students can handle virtual equipment, assemble laboratory setups, change experimental conditions and observe what happens."
        />
        <div className="grid gap-4">
          <ul className="grid gap-2 text-sm text-expera-ink-soft sm:grid-cols-2">
            {[
              "Select and manipulate apparatus",
              "Assemble laboratory setups",
              "Perform experiments",
              "Adjust variables",
              "Observe scientific changes",
              "Record measurements",
              "Understand experimental results",
            ].map((item) => (
              <li key={item} className="flex gap-2 rounded-lg bg-expera-surface px-3 py-2 ring-1 ring-expera-border">
                <span className="text-expera-primary" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="expera-container mt-12 grid gap-6 lg:grid-cols-2">
        {CHEMISTRY_LABS.map((lab) => (
          <Link
            key={lab.href}
            href={lab.href}
            className="group grid gap-3 rounded-[var(--expera-radius-xl)] border border-expera-border bg-gradient-to-br from-expera-surface to-[oklch(0.95_0.025_195)] p-6 transition hover:border-expera-chemistry/50 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-expera-navy group-hover:text-expera-chemistry">{lab.title}</h3>
              <StatusPill status={lab.status} />
            </div>
            <p className="text-sm leading-relaxed text-expera-ink-soft">{lab.description}</p>
            <span className="text-sm font-semibold text-expera-primary-deep">Open laboratory</span>
          </Link>
        ))}
        <Link
          href="/biology/lab/microscopy"
          className="group grid gap-3 rounded-[var(--expera-radius-xl)] border border-expera-border bg-gradient-to-br from-expera-surface to-[oklch(0.95_0.03_145)] p-6 transition hover:border-expera-biology/50 hover:shadow-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-expera-navy group-hover:text-expera-biology">Cells and microscopy</h3>
            <StatusPill status="available" />
          </div>
          <p className="text-sm leading-relaxed text-expera-ink-soft">
            Operate a compound microscope, prepare specimens and record observations in the Biology virtual laboratory.
          </p>
          <span className="text-sm font-semibold text-expera-primary-deep">Open laboratory</span>
        </Link>
        <div className="rounded-[var(--expera-radius-xl)] border border-dashed border-expera-border bg-expera-bg p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-expera-navy">More laboratories in development</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {PLANNED_LABS.map((lab) => (
              <li key={lab.title} className="rounded-xl bg-expera-surface p-4 ring-1 ring-expera-border">
                <p className="text-xs font-semibold text-expera-navy-muted">{lab.subject}</p>
                <p className="mt-1 text-sm font-semibold text-expera-navy">{lab.title}</p>
                <div className="mt-2">
                  <StatusPill status={lab.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function SubjectsSection() {
  const [expanded, setExpanded] = useState(false);
  return (
    <section id="subjects" className="expera-section bg-expera-navy text-white">
      <div className="expera-container grid gap-10">
        <SectionIntro
          title="Science has many worlds. Explore them all."
          description="Wave 1 centres on core science subjects. Expera is architected to grow across disciplines and educational levels."
          align="center"
          tone="dark"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {WAVE1_SUBJECTS.map((subject) => {
            const inner = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold">{subject.name}</h3>
                  <StatusPill status={subject.status} />
                </div>
                <p className="mt-2 text-sm text-white/75">{subject.statusNote}</p>
                <ul className="mt-4 grid gap-1.5 text-sm text-white/85">
                  {subject.topics.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
              </>
            );
            return subject.href ? (
              <Link
                key={subject.id}
                href={subject.href}
                className={`rounded-[var(--expera-radius-lg)] border p-5 transition hover:scale-[1.01] ${accentClass[subject.accent]} text-expera-navy`}
              >
                {inner}
              </Link>
            ) : (
              <div key={subject.id} className={`rounded-[var(--expera-radius-lg)] border p-5 ${accentClass[subject.accent]} text-expera-navy`}>
                {inner}
              </div>
            );
          })}
        </div>
        <div className="rounded-[var(--expera-radius-xl)] border border-white/15 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Planned subject expansion</h3>
            <button
              type="button"
              className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? "Hide subjects" : "View all planned subjects"}
            </button>
          </div>
          {expanded ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {FUTURE_SUBJECTS.map((name) => (
                <li key={name} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm">
                  <span>{name}</span>
                  <StatusPill status="planned" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/75">Mathematics, computer science, agricultural science and more — labelled as planned expansion, not current product claims.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function StagesSection() {
  return (
    <section className="expera-section">
      <div className="expera-container grid gap-10">
        <SectionIntro title="From first discoveries to advanced scientific thinking." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, i) => (
            <article key={stage.title} className="relative rounded-[var(--expera-radius-lg)] border border-expera-border bg-expera-surface p-5">
              <span className="text-4xl font-bold text-expera-primary/25" aria-hidden>
                {i + 1}
              </span>
              <h3 className="mt-2 text-lg font-bold text-expera-navy">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-expera-ink-soft">{stage.description}</p>
              <div className="mt-4">
                <StatusPill status={stage.status} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection() {
  return (
    <section id="about" className="expera-section border-y border-expera-border/70 bg-expera-bg-warm/40">
      <div className="expera-container grid gap-10">
        <SectionIntro title="Making practical science more accessible." />
        <div className="grid auto-rows-fr gap-4 md:grid-cols-6 md:grid-rows-2">
          {BENEFITS.map((b, i) => (
            <article
              key={b.title}
              className={`rounded-[var(--expera-radius-lg)] border border-expera-border bg-expera-surface p-5 shadow-sm ${
                i === 0 ? "md:col-span-3 md:row-span-2" : i === 1 ? "md:col-span-3" : "md:col-span-2"
              }`}
            >
              <h3 className="text-lg font-bold text-expera-navy">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-expera-ink-soft">{b.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CurriculumSection() {
  return (
    <section className="expera-section">
      <div className="expera-container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <SectionIntro
          title="Built around the way students learn in Nigeria."
          description="Expera is being developed with the Nigerian educational curriculum in mind, helping students connect classroom learning with practical scientific experiences. Content is subject to scientific and teacher review."
        />
        <div className="rounded-[var(--expera-radius-xl)] border border-expera-border bg-expera-surface p-6">
          <p className="text-sm text-expera-ink-soft">Examination contexts referenced in content design (text labels only — not endorsement):</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMS.map((exam) => (
              <span key={exam} className="rounded-lg bg-expera-bg px-4 py-2 text-sm font-bold tracking-wide text-expera-navy">
                {exam}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-expera-navy-muted">
            Expera does not imply official partnership, certification or endorsement by WAEC, NECO, JAMB or BECE.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SchoolsSection() {
  return (
    <section id="schools" className="expera-section bg-expera-navy text-white">
      <div className="expera-container grid gap-10 lg:grid-cols-[1fr_1fr]">
        <SectionIntro
          title="Bring a new dimension of practical science into your school."
          description="Expera is building a digital environment that helps schools extend science learning beyond textbooks and traditional classroom demonstrations."
          tone="dark"
        />
        <div className="grid gap-4">
          {[
            {
              title: "Extend practical learning",
              body: "Give students additional opportunities to investigate scientific concepts in interactive environments.",
            },
            {
              title: "Support science teaching",
              body: "Use demonstrations and virtual procedures to complement lessons — not replace skilled instruction.",
            },
            {
              title: "Explore digital laboratory access",
              body: "Introduce virtual experimentation where physical equipment, time or space is limited.",
            },
          ].map((block) => (
            <article key={block.title} className="rounded-[var(--expera-radius-lg)] border border-white/15 bg-white/5 p-5">
              <h3 className="text-lg font-bold">{block.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{block.body}</p>
            </article>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            <PrimaryButton href="#early-access">Partner with Expera</PrimaryButton>
            <GhostButton href="mailto:hello@expera.ng?subject=School%20partnership" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              Talk to our team
            </GhostButton>
          </div>
          <p className="text-xs text-white/60">Email is a placeholder destination — replace with your live contact address before launch.</p>
        </div>
      </div>
    </section>
  );
}

export function ParentsSection() {
  return (
    <section className="expera-section">
      <div className="expera-container grid gap-8 lg:grid-cols-2 lg:items-center">
        <SectionIntro title="Give curiosity room to grow." description="Students can explore science outside the classroom, understand concepts visually, and build confidence through independent practice." />
        <ul className="grid gap-3 text-sm text-expera-ink-soft">
          {[
            "Explore science outside the classroom",
            "Understand concepts visually",
            "Develop curiosity",
            "Practise independently",
            "Build confidence in science",
          ].map((item) => (
            <li key={item} className="rounded-xl border border-expera-border bg-expera-surface px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
        <div className="lg:col-span-2">
          <PrimaryButton href="/chemistry">Discover Expera</PrimaryButton>
        </div>
      </div>
    </section>
  );
}

export function ProfessionalsSection() {
  return (
    <section className="expera-section border-t border-expera-border bg-expera-surface">
      <div className="expera-container grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
        <SectionIntro
          title="For professionals and lifelong learners"
          description="Expera is building toward applied STEM exploration, advanced measurements and technical simulations beyond conventional school years."
        />
        <div className="rounded-[var(--expera-radius-lg)] border border-dashed border-expera-border bg-expera-bg p-6">
          <StatusPill status="planned" />
          <p className="mt-4 text-sm leading-relaxed text-expera-ink-soft">
            Professional-grade simulations and continuing education pathways are planned platform expansion — not part of the current Wave 1 release.
          </p>
          <div className="mt-6">
            <GhostButton href="#early-access">Follow the platform&apos;s development</GhostButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EarlyAccessSection() {
  return (
    <section id="early-access" className="expera-section bg-gradient-to-b from-expera-bg to-expera-bg-warm">
      <div className="expera-container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <SectionIntro
          title="Be part of the future of practical science learning."
          description="Expera is growing. Join the early-access community and be among the first to explore new learning experiences and virtual laboratories."
        />
        <EarlyAccessForm />
      </div>
    </section>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="expera-section border-t border-expera-border">
      <div className="expera-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionIntro title="Frequently asked questions" />
        <div className="grid gap-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-expera-border bg-expera-surface px-4 py-3 open:shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-expera-navy marker:content-none [&::-webkit-details-marker]:hidden">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-expera-ink-soft">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTASection() {
  return (
    <section className="expera-section">
      <div className="expera-container rounded-[var(--expera-radius-xl)] bg-expera-primary px-6 py-12 text-center text-white md:px-12">
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight">The future of science learning starts with curiosity.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          Explore a different way to understand science. Learn concepts, experience experiments and discover what is possible.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#early-access" className="inline-flex min-h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-expera-primary-deep">
            Join early access
          </a>
          <a href="/chemistry" className="inline-flex min-h-11 items-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white hover:bg-white/10">
            Explore Expera
          </a>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-expera-border bg-expera-navy text-white">
      <div className="expera-container grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-xl font-bold text-white">Expera</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
            Interactive STEM learning and virtual laboratories — designed for practical science education starting with the Nigerian curriculum.
          </p>
          <p className="mt-6 text-sm font-semibold text-white/90">Expera — Science is better when you can experience it.</p>
        </div>
        <div>
          <p className="text-sm font-bold">Explore</p>
          <ul className="mt-3 grid gap-2 text-sm text-white/75">
            <li>
              <a href="#experience" className="hover:text-white">
                The Expera experience
              </a>
            </li>
            <li>
              <a href="#subjects" className="hover:text-white">
                Subjects
              </a>
            </li>
            <li>
              <a href="#schools" className="hover:text-white">
                For schools
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-white">
                About
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold">Legal</p>
          <ul className="mt-3 grid gap-2 text-sm text-white/75">
            <li>
              <a href="/contact" className="hover:text-white">
                Contact
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-white">
                Privacy policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-white">
                Terms of service
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} Expera. All rights reserved.</div>
    </footer>
  );
}
