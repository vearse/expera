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
                onClick={openEarlyAccess}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-container px-6 text-sm font-bold text-on-primary-container shadow-emerald custom-emerald-shadow transition hover:opacity-95"
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
          <p className="text-sm font-semibold text-[#2f5bff]">Pedagogical method</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#1a1464] sm:text-5xl">The 4-part mastery engine</h2>
          <p className="mt-3 text-lg text-[#3d4a7a]">Every concept moves from curiosity to exam readiness through Learn, Lab, Practice and Exam.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { n: "01", icon: "explore", title: "Learn", body: "Interactive explorers: periodic table, atoms, cells, and particle models.", foot: "Interactive explorers", tone: "bg-[#dff6fb]", iconBg: "bg-[#22b7d4]", footTone: "text-[#0e7490]" },
            { n: "02", icon: "biotech", title: "Lab", body: "Run titrations, apparatus setups, microscopy, and food tests safely in 3D.", foot: "Zero glassware breakage", tone: "bg-[#e7edff]", iconBg: "bg-[#2f5bff]", footTone: "text-[#1d4ed8]", highlight: true },
            { n: "03", icon: "quiz", title: "Practice", body: "Topic questions aligned to national standards with step-by-step feedback.", foot: "Targeted reinforcement", tone: "bg-[#fff1d6]", iconBg: "bg-[#f5a524]", footTone: "text-[#c2410c]" },
            { n: "04", icon: "verified", title: "Exam", body: "Timed mocks replicating WAEC, NECO practical layouts and JAMB CBT.", foot: "Marking schemes", tone: "bg-[#ece9ff]", iconBg: "bg-[#1a1464]", footTone: "text-[#1a1464]" },
          ].map((step) => (
            <article
              key={step.n}
              className={`group relative flex min-h-[22rem] flex-col justify-between rounded-3xl border border-white/80 p-8 shadow-sm transition duration-200 hover:z-10 hover:scale-[1.04] hover:shadow-2xl ${step.tone} ${
                step.highlight ? "ring-2 ring-[#2f5bff]/30" : ""
              }`}
            >
              {step.highlight ? (
                <span className="absolute -top-3 right-6 rounded-full bg-[#2f5bff] px-3 py-1 text-xs font-bold text-white">3D simulations</span>
              ) : null}
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-display text-4xl font-bold text-[#1a1464]/25">{step.n}</span>
                  <span className={`grid size-14 place-items-center rounded-2xl text-white shadow-md ${step.iconBg}`}>
                    <MaterialIcon name={step.icon} className="text-[30px]" />
                  </span>
                </div>
                <h3 className="font-display text-3xl font-bold text-[#1a1464]">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[#3d4a7a]">{step.body}</p>
              </div>
              <p className={`mt-8 border-t border-[#1a1464]/10 pt-5 text-sm font-bold ${step.footTone}`}>{step.foot}</p>
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

      <LandingStemBranches />

      <CurricularDomainsSection />

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

      <SectionShell id="teachers" className="bg-[#f7f8fc]">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative lg:col-span-6">
            <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-[2rem] bg-[#e7edff] lg:block" aria-hidden />
            <figure className="relative overflow-hidden rounded-[2rem] shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=80"
                alt="Smiling science teacher ready to lead a class practical"
                className="aspect-[4/5] w-full object-cover object-[center_15%] sm:aspect-[5/4]"
              />
              <figcaption className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 px-4 py-3 text-sm text-[#1a1464] shadow-md backdrop-blur">
                <span className="font-bold">Ms. Ada, science lead</span>
                <span className="mt-0.5 block text-[#3d4a7a]">A practical the whole class can repeat, without waiting for one working burette.</span>
              </figcaption>
            </figure>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-6">
            <p className="w-fit text-sm font-semibold text-[#2f5bff]">For science teachers</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-[#1a1464] sm:text-5xl">Plan the practical before the class walks in.</h2>
            <p className="text-lg text-[#3d4a7a]">
              Share a live lab link, walk the bench with your students, and send them back to repeat the hard steps on their own tablets.
            </p>
            <ul className="space-y-4">
              {[
                { icon: "timer", title: "Assign a lab in minutes", body: "Pick a Wave 1 module and send the link. No setup period, no missing reagents." },
                { icon: "insights", title: "See where the class stalls", body: "Titration technique and microscope focus show up before the mock, not after it." },
                { icon: "sanitizer", title: "Repeat without breakage", body: "Students practise the same practical as many times as they need. The glass stays intact." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e7edff] text-[#2f5bff]">
                    <MaterialIcon name={item.icon} />
                  </span>
                  <div>
                    <strong className="block font-display text-lg text-[#1a1464]">{item.title}</strong>
                    <span className="text-sm text-[#3d4a7a]">{item.body}</span>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={openEarlyAccess} className="w-fit rounded-full bg-[#1a1464] px-6 py-3 text-sm font-bold text-white">
              Request a teacher demo
            </button>
          </div>
        </div>
      </SectionShell>

      <section className="bg-[#f3f6f4] py-16 lg:py-20">
        <div className="vanguard-container">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c8a52] via-[#087a48] to-[#064e32] px-8 py-12 text-white shadow-[0_24px_60px_-28px_rgba(6,78,50,0.7)] md:px-14 md:py-16">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/80">Flexible access for individuals &amp; schools</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight sm:text-5xl">Empower Your Science Students Today</h2>
            <p className="mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
              Get unlimited access to the entire 3D virtual apparatus library, WAEC past practical series, and automatic examiner reports.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={openEarlyAccess} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0b3d2a]">
                Start Free Trial
              </button>
              <button type="button" onClick={openEarlyAccess} className="rounded-full bg-[#063d28] px-6 py-3 text-sm font-bold text-white">
                Book School Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <EarlyAccessModal />

      <footer className="border-t border-outline/20 bg-inverse-surface text-inverse-on-surface">
        <div className="vanguard-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <div className="inline-flex rounded-2xl bg-white px-3 py-2">
              <BrandLogo className="h-12 w-auto" />
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
                      <button type="button" onClick={openEarlyAccess} className="hover:text-primary-fixed">
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
