"use client";

import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { CurricularDomainsSection } from "./CurricularDomainsSection";
import { EarlyAccessModal } from "./EarlyAccessModal";
import { openEarlyAccess } from "./earlyAccess";
import { HeroLabCarousel } from "./HeroLabCarousel";
import { LandingStemBranches } from "./LandingStemBranches";
import { LiveWorkstationPreview } from "./LiveWorkstationPreview";
import { PracticalRealitySection } from "./PracticalRealitySection";
import { BtnSecondary, MaterialIcon, SectionShell } from "./ui";
import { ScrollToTopFab } from "./ScrollToTopFab";
import { VanguardLandingNav } from "./VanguardLandingNav";

export function VanguardLandingPage() {
  return (
    <div id="top" className="bg-background text-on-surface antialiased">
      <VanguardLandingNav />

      <section className="relative bg-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="vanguard-container grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest px-4 py-1.5 shadow-sm">
              <span aria-hidden>🇳🇬</span>
              <span className="text-xs font-bold tracking-wide text-primary">Aligned to NERDC, WAEC, NECO &amp; JAMB curriculum</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3rem]">
              Science is better when you can <span className="text-primary underline decoration-primary-container decoration-wavy decoration-2">experience</span> it.
            </h1>
            <p className="max-w-xl text-lg text-on-surface-variant">
              Explore, experiment, practise and prepare for WAEC, NECO and JAMB in interactive labs built for the Nigerian syllabus.
            </p>
            <div className="flex w-full flex-wrap items-center gap-4 pt-2 sm:w-auto">
              <button
                type="button"
                onClick={() => openEarlyAccess()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-container px-6 text-sm font-bold text-on-primary-container custom-brand-shadow transition hover:opacity-95"
              >
                Join the waitlist
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </button>
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
          <HeroLabCarousel />
        </div>
      </section>

      <SectionShell className="border-y border-outline-variant/30 bg-white py-24 lg:py-32">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-sm font-semibold text-accent">Pedagogical method</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-brand sm:text-5xl">The 4-part mastery engine</h2>
          <p className="mt-3 text-lg text-brand-muted">Every concept moves from curiosity to exam readiness through Learn, Lab, Practice and Exam.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { n: "01", icon: "explore", title: "Learn", body: "Interactive explorers: periodic table, atoms, cells, and particle models.", foot: "Interactive explorers", tone: "bg-wash-cyan", iconBg: "bg-accent-cyan", footTone: "text-accent-cyan-deep" },
            { n: "02", icon: "biotech", title: "Lab", body: "Run titrations, apparatus setups, microscopy, and food tests safely in 3D.", foot: "Zero glassware breakage", tone: "bg-accent-soft", iconBg: "bg-accent", footTone: "text-accent", highlight: true },
            { n: "03", icon: "quiz", title: "Practice", body: "Topic questions aligned to national standards with step-by-step feedback.", foot: "Targeted reinforcement", tone: "bg-wash-orange", iconBg: "bg-accent-orange", footTone: "text-accent-orange-deep" },
            { n: "04", icon: "verified", title: "Exam", body: "Timed mocks replicating WAEC, NECO practical layouts and JAMB CBT.", foot: "Marking schemes", tone: "bg-wash-navy", iconBg: "bg-brand", footTone: "text-brand" },
          ].map((step) => (
            <article
              key={step.n}
              className={`group relative flex min-h-[22rem] flex-col justify-between rounded-3xl border border-white/80 p-8 shadow-sm transition duration-200 hover:z-10 hover:scale-[1.04] hover:shadow-2xl ${step.tone} ${
                step.highlight ? "ring-2 ring-accent/30" : ""
              }`}
            >
              {step.highlight ? (
                <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">3D simulations</span>
              ) : null}
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-display text-4xl font-bold text-brand/25">{step.n}</span>
                  <span className={`grid size-14 place-items-center rounded-2xl text-white shadow-md ${step.iconBg}`}>
                    <MaterialIcon name={step.icon} className="text-[30px]" />
                  </span>
                </div>
                <h3 className="font-display text-3xl font-bold text-brand">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-brand-muted">{step.body}</p>
              </div>
              <p className={`mt-8 border-t border-brand/10 pt-5 text-sm font-bold ${step.footTone}`}>{step.foot}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <PracticalRealitySection />

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

      <section id="schools" className="bg-lab-bg py-20 lg:py-20">
        <div className="vanguard-container">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">School administrators &amp; principals</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface sm:text-5xl">Give every student a science lab.</h2>
            <p className="mt-3 text-base text-secondary sm:text-lg">
              Equipping physical secondary school laboratories costs millions in recurrent capital. Expera delivers practical science at a fraction of the cost.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "savings", title: "Zero reagent costs", body: "No annual budget drain buying scarce silver nitrate, hydrochloric acid, or delicate glass thermometers." },
              { icon: "health_and_safety", title: "100% safe practicals", body: "Zero risk of chemical burns, acid spills, inhalation hazards, or laboratory fires." },
              { icon: "star", title: "Exam-ready results", body: "Raise WAEC and NECO science outcomes by giving every student frequent, repeatable practical trials." },
              { icon: "hub", title: "One unified platform", body: "Deploy across every arm from JSS 1 to SSS 3 with one science workspace for the whole school." },
            ].map((item) => (
              <article key={item.title} className="glass-hover rounded-3xl border border-white bg-white p-6 shadow-sm">
                <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-brand">
                  <MaterialIcon name={item.icon} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-on-surface">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button type="button" onClick={() => openEarlyAccess("school")} className="rounded-full bg-primary px-7 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-container">
              Book a school demo
            </button>
          </div>
        </div>
      </section>

      <LandingStemBranches />

      <section id="students" className="bg-white py-20 lg:py-20">
        <div className="vanguard-container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">Student experience</span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-on-surface sm:text-5xl">Why students love Expera</h2>
            <p className="mt-3 text-base text-secondary sm:text-lg">Built for everyday Nigerian realities: bandwidth-friendly, high engagement, zero anxiety.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "touch_app", title: "Hands-on 3D labs", body: "Perform practicals anytime, anywhere. No waiting for a scarce laboratory period or shared apparatus.", tint: "bg-accent-soft text-brand" },
              { icon: "military_tech", title: "Missions & badges", body: "Earn mastery points, clear syllabus milestones, and unlock exam-ready badges as you practise.", tint: "bg-amber-50 text-amber-700" },
              { icon: "lightbulb", title: "Instant explanations", body: "Immediate step-by-step corrections when an experiment spills or an answer misses the mark.", tint: "bg-sky-50 text-sky-700" },
              { icon: "phonelink", title: "Low-end friendly", body: "Runs smoothly on budget Android phones, cheap Chromebooks, and low-bandwidth Nigerian networks.", tint: "bg-teal-50 text-teal-700" },
            ].map((item) => (
              <article key={item.title} className="glass-hover rounded-3xl border border-line-soft bg-lab-bg p-6">
                <span className={`grid size-11 place-items-center rounded-full ${item.tint}`}>
                  <MaterialIcon name={item.icon} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-on-surface">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl border border-line-soft bg-surface-container-low px-6 py-6 sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">Practice and exam preparation</p>
              <p className="mt-2 max-w-2xl font-display text-lg font-bold text-on-surface sm:text-xl">
                Repeat WAEC and NECO practicals, then sit timed mocks in the same layout as the paper.
              </p>
              <p className="mt-1 text-sm text-secondary">Acid–base titration, food tests, and apparatus steps — practise until the reading is concordant.</p>
            </div>
            <button type="button" onClick={() => openEarlyAccess()} className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-container">
              Start free trial
            </button>
          </div>
        </div>
      </section>

      <CurricularDomainsSection />

      <SectionShell id="teachers" className="bg-lab-bg">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative lg:col-span-6">
            <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-[2rem] bg-accent-soft lg:block" aria-hidden />
            <figure className="relative overflow-hidden rounded-[2rem] shadow-xl">
              <img
                src="/landing/teacher-ada.jpg"
                alt="Smiling West African science teacher ready to lead a class practical"
                className="aspect-[4/5] w-full object-cover object-[center_20%] sm:aspect-[5/4]"
              />
              <figcaption className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 px-4 py-3 text-sm text-brand shadow-md backdrop-blur">
                <span className="font-bold">Ms. Ada, science lead</span>
                <span className="mt-0.5 block text-brand-muted">A practical the whole class can repeat, without waiting for one working burette.</span>
              </figcaption>
            </figure>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-6">
            <p className="w-fit text-sm font-semibold text-accent">For science teachers</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-brand sm:text-5xl">Plan the practical before the class walks in.</h2>
            <p className="text-lg text-brand-muted">
              Share a live lab link, walk the bench with your students, and send them back to repeat the hard steps on their own tablets.
            </p>
            <ul className="space-y-4">
              {[
                { icon: "timer", title: "Assign a lab in minutes", body: "Pick a Wave 1 module and send the link. No setup period, no missing reagents." },
                { icon: "insights", title: "See where the class stalls", body: "Titration technique and microscope focus show up before the mock, not after it." },
                { icon: "sanitizer", title: "Repeat without breakage", body: "Students practise the same practical as many times as they need. The glass stays intact." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <MaterialIcon name={item.icon} />
                  </span>
                  <div>
                    <strong className="block font-display text-lg text-brand">{item.title}</strong>
                    <span className="text-sm text-brand-muted">{item.body}</span>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => openEarlyAccess("teacher")} className="w-fit rounded-full bg-brand px-6 py-3 text-sm font-bold text-white">
              Request a teacher demo
            </button>
          </div>
        </div>
      </SectionShell>

      <section className="bg-lab-bg py-16 lg:py-20">
        <div className="vanguard-container">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-mid via-brand to-brand-deep px-8 py-12 text-white shadow-[0_24px_60px_-28px_color-mix(in_srgb,var(--brand)_55%,transparent)] md:px-14 md:py-16">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/80">Flexible access for individuals &amp; schools</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight sm:text-5xl">Empower Your Science Students Today</h2>
            <p className="mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
              Get unlimited access to the entire 3D virtual apparatus library, WAEC past practical series, and automatic examiner reports.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => openEarlyAccess()} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-primary">
                Start Free Trial
              </button>
              <button type="button" onClick={() => openEarlyAccess("school")} className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white">
                Book School Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <EarlyAccessModal />
      <ScrollToTopFab />

      <footer className="border-t border-outline/20 bg-inverse-surface text-inverse-on-surface">
        <div className="vanguard-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <BrandLogo variant="onDark" />
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
                { href: "/contact", label: "Contact" },
                { href: "#waitlist", label: "Early access" },
                { href: "#teachers", label: "For teachers" },
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
                    {link.label === "Early access" ? (
                      <button type="button" onClick={() => openEarlyAccess()} className="hover:text-primary-fixed">
                        {link.label}
                      </button>
                    ) : link.href.startsWith("#") ? (
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
