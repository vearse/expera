"use client";

import Link from "next/link";
import { EarlyAccessForm } from "@/components/landing/EarlyAccessForm";
import { ExperaLogo } from "./ExperaLogo";
import { DesktopLandingHeroMockup } from "./DesktopLandingHeroMockup";
import { LandingStemBranches } from "./LandingStemBranches";
import { LiveWorkstationPreview } from "./LiveWorkstationPreview";
import { BtnPrimary, BtnSecondary, MaterialIcon, SectionShell, StatusChip } from "./ui";
import { VanguardLandingNav } from "./VanguardLandingNav";

export function VanguardLandingPage() {
  return (
    <div id="top" className="overflow-x-clip bg-background text-on-surface antialiased">
      <VanguardLandingNav />

      <section className="relative overflow-hidden bg-gradient-to-b from-surface to-surface-container-low pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="vanguard-container grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest px-4 py-1.5 shadow-sm">
              <span aria-hidden>🇳🇬</span>
              <span className="text-xs font-bold tracking-wide text-primary">Aligned to NERDC, WAEC, NECO &amp; JAMB curriculum</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3rem]">
              Science you can <span className="text-primary underline decoration-primary-container decoration-wavy decoration-2">actually do</span>.
            </h1>
            <p className="max-w-xl text-lg text-on-surface-variant">
              Explore, experiment, practise and prepare for WAEC, NECO and JAMB in interactive labs built for the Nigerian syllabus.
            </p>
            <div className="flex w-full flex-wrap items-center gap-4 pt-2 sm:w-auto">
              <BtnPrimary href="#waitlist">
                Join the waitlist
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </BtnPrimary>
              <BtnSecondary href="/chemistry/lab/titration">
                <MaterialIcon name="play_circle" className="text-xl text-primary" />
                Watch a lab in action
              </BtnSecondary>
            </div>
            <div className="flex w-full items-center gap-4 border-t border-outline-variant/40 pt-6">
              <div className="flex -space-x-3 overflow-hidden" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="size-10 rounded-full bg-primary-container/30 ring-2 ring-surface-container-lowest" />
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface">Aligned to Nigerian curriculum</p>
                <p className="text-sm text-on-surface-variant">Built with Nigerian STEM educators in early access cohorts</p>
              </div>
            </div>
          </div>
          <DesktopLandingHeroMockup />
        </div>
      </section>

      <SectionShell className="border-y border-outline-variant/30 bg-surface-container-lowest">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="rounded-full bg-surface-container px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">Pedagogical method</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">The 4-part mastery engine</h2>
          <p className="mt-2 text-on-surface-variant">Every concept moves from curiosity to exam readiness through Learn, Lab, Practice and Exam.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", icon: "explore", title: "1. Learn", body: "Interactive explorers: periodic table, atoms, cells, and particle models.", foot: "Interactive explorers →" },
            { n: "02", icon: "biotech", title: "2. Lab", body: "Run titrations, apparatus setups, microscopy, and food tests safely in 3D.", foot: "Zero glassware breakage →", highlight: true },
            { n: "03", icon: "quiz", title: "3. Practice", body: "Topic questions aligned to national standards with step-by-step feedback.", foot: "Targeted reinforcement →", tertiary: true },
            { n: "04", icon: "verified", title: "4. Exam", body: "Timed mocks replicating WAEC, NECO practical layouts and JAMB CBT.", foot: "Marking schemes →", amber: true },
          ].map((step) => (
            <article
              key={step.n}
              className={`relative flex flex-col justify-between rounded-lg border bg-surface p-6 level-1-card ${
                step.highlight ? "border-2 border-primary-container/60 level-2-floating lg:-translate-y-1" : "border-outline-variant/50"
              }`}
            >
              {step.highlight ? (
                <span className="absolute -top-3 right-4 rounded-full bg-primary-container px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-primary-container">
                  3D simulations
                </span>
              ) : null}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-container/20 font-display font-bold text-primary">{step.n}</span>
                  <MaterialIcon name={step.icon} className={`text-[28px] ${step.tertiary ? "text-tertiary" : step.amber ? "text-amber-600" : "text-primary"}`} />
                </div>
                <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{step.body}</p>
              </div>
              <p className={`mt-6 border-t border-outline-variant/30 pt-4 text-xs font-bold ${step.tertiary ? "text-tertiary" : step.amber ? "text-amber-800" : "text-primary"}`}>
                {step.foot}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="features" className="overflow-hidden bg-background">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="rounded-full bg-primary-container/20 px-3.5 py-1 text-xs font-bold uppercase text-primary">Software live preview</span>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Test-drive the apparatus in real time</h2>
          </div>
          <p className="max-w-md text-on-surface-variant">
            Manipulate virtual apparatus safely. Each tab opens a real Expera route when you launch the session.
          </p>
        </div>
        <LiveWorkstationPreview />
      </SectionShell>

      <LandingStemBranches />

      <SectionShell id="subjects" className="bg-background">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="rounded-full bg-primary-container/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">Curriculum scope</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Built for Nigeria&apos;s core sciences</h2>
          <p className="mt-2 text-on-surface-variant">Wave 1 chemistry and biology scopes from the Expera syllabus map — labels show what you can open today.</p>
        </div>
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          <Link href="/chemistry" className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-[#042f2e] to-[#0f766e] p-8 text-white shadow-xl">
            <StatusChip status="available" />
            <h3 className="mt-4 font-display text-xl font-bold">Chemistry</h3>
            <p className="mt-2 text-sm text-teal-100">Seven Wave 1 scopes: learn explorers, titration lab, apparatus, and guided practicals.</p>
          </Link>
          <Link href="/biology" className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-[#064e3b] to-[#047857] p-8 text-white shadow-xl">
            <StatusChip status="available" />
            <h3 className="mt-4 font-display text-xl font-bold">Biology</h3>
            <p className="mt-2 text-sm text-emerald-100">Six Wave 1 scopes — microscopy laboratory live; food tests and osmosis on the roadmap.</p>
          </Link>
          <Link href="/physics" className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-[#172554] to-[#1d4ed8] p-8 text-white shadow-xl">
            <StatusChip status="in-development" />
            <h3 className="mt-4 font-display text-xl font-bold">Physics</h3>
            <p className="mt-2 text-sm text-blue-100">Measurement, circuits, and optics practicals planned for Wave 1.</p>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 rounded-md border border-outline-variant/40 bg-surface-container-high/60 px-6 py-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <MaterialIcon name="hourglass_top" className="text-2xl text-primary" />
            <span className="text-sm font-semibold">More Nigerian curriculum subjects on the roadmap</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Agricultural science", "Basic science (JSS)", "Food & nutrition"].map((s) => (
              <span key={s} className="rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-on-surface-variant">
                {s}
              </span>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell className="bg-surface-container-lowest">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="rounded-full bg-surface-container px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">Student experience</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Why students use Expera</h2>
          <p className="mt-2 text-on-surface-variant">Bandwidth-friendly, high engagement, and access when the physical lab is not available.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "touch_app", title: "Hands-on 3D labs", body: "Perform practicals anytime without waiting for a scarce laboratory period." },
            { icon: "military_tech", title: "Missions and progress", body: "Track exploration across Learn, Lab and Practice as features roll out." },
            { icon: "lightbulb", title: "Instant explanations", body: "Step-by-step corrections when a procedure step needs clarification." },
            { icon: "phonelink", title: "Low-end friendly", body: "Runs on budget phones, Chromebooks, and low-bandwidth networks." },
          ].map((item) => (
            <article key={item.title} className="rounded-lg border border-outline-variant/50 bg-surface p-6 level-1-card">
              <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary-container/20 text-primary">
                <MaterialIcon name={item.icon} />
              </div>
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{item.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="teachers" className="bg-background">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 level-2-floating lg:col-span-6">
            <StatusChip status="in-development" />
            <h3 className="mt-4 font-display text-lg font-bold">Teacher dashboard preview</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Class assignments, live progress analytics, and printable reports shown in design previews are not yet product features. Early access schools can explore labs with students today.
            </p>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-6">
            <span className="w-fit rounded-full bg-surface-container px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">For science teachers</span>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Empower lesson plans with hands-on labs</h2>
            <p className="text-on-surface-variant">Turn abstract diagrams into tactile experiences. Wave 1 modules map directly to NERDC chemistry and biology practical skills.</p>
            <ul className="space-y-4 text-sm">
              {[
                { icon: "timer", title: "Assign labs in minutes", body: "Select Wave 1 modules and share links with your class." },
                { icon: "insights", title: "See struggle points by topic", body: "Spot titration and microscopy skills that need reinforcement before exams." },
                { icon: "sanitizer", title: "No reagent or glassware worries", body: "Repeat experiments without chemical shortages or broken burettes." },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <MaterialIcon name={item.icon} className="mt-0.5 text-primary" />
                  <div>
                    <strong className="block font-semibold">{item.title}</strong>
                    <span className="text-on-surface-variant">{item.body}</span>
                  </div>
                </li>
              ))}
            </ul>
            <BtnSecondary href="/contact">Request a teacher demo</BtnSecondary>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="schools" className="border-y border-outline-variant/30 bg-surface-container-low">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-surface-container px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">School administrators</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Give every student a science lab</h2>
          <p className="mt-2 text-on-surface-variant">
            Extend practical science where equipment, time or space is limited. Partner via early access while institutional dashboards are in development.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "savings", title: "Lower consumable pressure", body: "Virtual reagents and glassware reduce recurrent lab spend." },
            { icon: "health_and_safety", title: "Safer practicals", body: "No chemical burns, spills, or inhalation hazards in virtual benches." },
            { icon: "grade", title: "Exam-oriented practice", body: "Repeat WAEC-style practicals until students reach concordant titres." },
            { icon: "hub", title: "One platform", body: "Chemistry, biology, and physics hubs in a single Expera workspace." },
          ].map((item) => (
            <article key={item.title} className="rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-6 level-1-card">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-container/20 text-primary">
                <MaterialIcon name={item.icon} className="text-[26px]" />
              </div>
              <h4 className="font-display font-semibold">{item.title}</h4>
              <p className="mt-2 text-sm text-on-surface-variant">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <BtnPrimary href="#waitlist">Book a school demo</BtnPrimary>
        </div>
      </SectionShell>

      <section className="relative overflow-hidden bg-[#0B132B] py-24 text-white" id="exam-prep">
        <div className="pointer-events-none absolute right-1/4 top-0 size-96 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="vanguard-container relative mx-auto max-w-3xl text-center">
          <StatusChip status="coming-soon" />
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Prepare the way the exams test you</h2>
          <p className="mt-3 text-slate-300">
            Structured WAEC, NECO and JAMB mock assessments are in development. Use Practice for guided exam-style preparation today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BtnSecondary href="/chemistry?tab=practice" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              Open chemistry practice
            </BtnSecondary>
          </div>
        </div>
      </section>

      <SectionShell id="waitlist" className="bg-background">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl bg-gradient-to-r from-[#006c49] via-[#047857] to-[#065f46] p-8 text-center text-white shadow-2xl md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-10 [background-size:24px_24px]" aria-hidden />
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">Early access cohort</span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Be the first to step into Nigeria&apos;s interactive science laboratory</h2>
            <p className="mt-4 text-lg text-emerald-100">Join students, teachers, and schools pioneering hands-on STEM in early access.</p>
            <div className="mt-8 rounded-2xl bg-white/95 p-1 text-left text-brand-ink">
              <EarlyAccessForm />
            </div>
            <p className="mt-4 text-xs text-emerald-200">
              School owner?{" "}
              <a href="#schools" className="font-bold text-white underline hover:text-primary-fixed">
                Talk to us about your school →
              </a>
            </p>
          </div>
        </div>
      </SectionShell>

      <footer className="border-t border-outline/20 bg-inverse-surface text-inverse-on-surface">
        <div className="vanguard-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <ExperaLogo className="size-10 text-primary-fixed" />
              <span className="font-display text-lg font-bold">Expera</span>
            </div>
            <p className="max-w-sm text-sm text-inverse-on-surface/75">
              Interactive science laboratory simulations aligned to Nigerian NERDC, WAEC, NECO, and JAMB science contexts.
            </p>
            <p className="text-sm font-semibold text-primary-fixed">Science is better when you can experience it.</p>
          </div>
          {[
            {
              title: "Platform",
              links: [
                { href: "/chemistry/lab/apparatus", label: "Virtual simulations" },
                { href: "/chemistry/learn/periodic-table", label: "Periodic table" },
                { href: "/chemistry/lab/titration", label: "Titration lab" },
              ],
            },
            {
              title: "Subjects",
              links: [
                { href: "/chemistry", label: "Chemistry hub" },
                { href: "/biology", label: "Biology hub" },
                { href: "/physics", label: "Physics hub" },
              ],
            },
            {
              title: "Institutions",
              links: [
                { href: "#schools", label: "For schools" },
                { href: "#waitlist", label: "Early access" },
                { href: "/contact", label: "Contact" },
              ],
            },
            {
              title: "Legal",
              links: [
                { href: "/about", label: "About" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h5 className="font-display font-bold">{col.title}</h5>
              <ul className="mt-3 space-y-2 text-sm text-inverse-on-surface/70">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href} className="hover:text-primary-fixed">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="hover:text-primary-fixed">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-outline/20 py-4 text-center text-xs text-inverse-on-surface/50">
          © {new Date().getFullYear()} Expera. Pioneering interactive STEM education in Nigeria.
        </div>
      </footer>
    </div>
  );
}
