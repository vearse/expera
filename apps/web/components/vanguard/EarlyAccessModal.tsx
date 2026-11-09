"use client";

import { useEffect, useState } from "react";
import { EARLY_ACCESS_ROLES } from "@/components/landing/landing-data";
import { MaterialIcon } from "./ui";
import { isWaitlistPreset, type WaitlistPreset } from "./earlyAccess";

type Role = (typeof EARLY_ACCESS_ROLES)[number];

const ROLES: { role: Role; icon: string; hint: string; wide?: boolean }[] = [
  { role: "Student", icon: "backpack", hint: "I'm in primary or secondary school" },
  { role: "Parent or guardian", icon: "diversity_1", hint: "I want the best for my child" },
  { role: "Teacher or educator", icon: "science", hint: "I teach science in a school" },
  { role: "School representative", icon: "school", hint: "I speak for a school or proprietor" },
  { role: "University or tertiary student", icon: "history_edu", hint: "I study at a university or polytechnic" },
  { role: "Professional", icon: "work", hint: "I work in education, tech or training" },
  { role: "Other", icon: "auto_awesome", hint: "None of these fit me", wide: true },
];

const PRESET_ROLE: Record<WaitlistPreset, Role> = {
  student: "Student",
  teacher: "Teacher or educator",
  school: "School representative",
};

function roleIcon(role: Role) {
  return ROLES.find((item) => item.role === role)?.icon ?? "person";
}

export function EarlyAccessModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [roleNote, setRoleNote] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function reset(preset: WaitlistPreset | null) {
    setError("");
    setStatus("idle");
    setFullName("");
    setEmail("");
    setInstitution("");
    setRoleNote("");
    if (isWaitlistPreset(preset)) {
      setRole(PRESET_ROLE[preset]);
      setStep(2);
    } else {
      setRole(null);
      setStep(1);
    }
  }

  useEffect(() => {
    const show = (event: Event) => {
      const raw = (event as CustomEvent<{ preset?: unknown }>).detail?.preset;
      reset(isWaitlistPreset(raw) ? raw : null);
      setOpen(true);
    };
    const onHash = () => {
      if (window.location.hash === "#waitlist") {
        reset(null);
        setOpen(true);
      }
    };
    window.addEventListener("expera-early-access", show);
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => {
      window.removeEventListener("expera-early-access", show);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Enter" && step === 1 && role) setStep(2);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, role, step]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!role) return;
    setError("");
    if (fullName.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          institution: [institution.trim(), role === "Other" ? roleNote.trim() : ""].filter(Boolean).join(" — ") || undefined,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setStatus("idle");
        setError(
          data.error ??
            (res.status === 429
              ? "Too many attempts. Please wait a minute and try again."
              : "Something went wrong. Try again shortly."),
        );
        return;
      }
      setStatus("success");
    } catch {
      setStatus("idle");
      setError("Network error. Check your connection and try again.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <button type="button" className="absolute inset-0 bg-[#0b132b]/55" aria-label="Close waitlist" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
        className="relative my-auto w-full max-w-[540px] overflow-hidden rounded-2xl border border-outline-variant/40 bg-white text-on-surface shadow-[0_24px_60px_-15px_rgba(11,19,43,0.35)]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-brand via-accent to-accent-cyan" />

        {step === 1 ? (
          <div>
            <div className="border-b border-outline-variant/20 bg-[#faf8ff]/80 px-6 pb-4 pt-6 sm:px-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-primary">Early access cohort</span>
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    <span className="text-[11px] text-slate-500">Nigeria {new Date().getFullYear()}</span>
                  </div>
                  <h2 id="waitlist-title" className="mt-1 font-display text-2xl font-bold tracking-tight">
                    Join the waitlist
                  </h2>
                </div>
                <button type="button" aria-label="Close" className="grid size-9 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container" onClick={() => setOpen(false)}>
                  <MaterialIcon name="close" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">Step 1 of 2</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-7 rounded-full bg-primary-container" />
                  <span className="h-2 w-2 rounded-full bg-outline-variant/50" />
                </div>
              </div>
            </div>
            <div className="space-y-5 p-6 sm:p-7">
              <p className="text-sm text-on-surface-variant">Tell us who you are so we can tailor your early access experience and curriculum modules.</p>
              <div className="grid max-h-[360px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2" role="radiogroup" aria-label="Select your role">
                {ROLES.map((item) => {
                  const selected = role === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setRole(item.role)}
                      className={`flex min-h-24 flex-col justify-between rounded-xl p-3.5 text-left transition ${item.wide ? "sm:col-span-2 min-h-0 flex-row items-center" : ""} ${
                        selected ? "border-2 border-accent bg-accent/10 shadow-[0_0_0_1px_var(--accent)]" : "border border-outline-variant/50 bg-white hover:border-brand/40 hover:bg-surface-container-low"
                      }`}
                    >
                      <span className={`flex w-full items-start justify-between ${item.wide ? "items-center gap-3" : ""}`}>
                        <span className="flex items-center gap-3">
                          <span className={`grid size-8 place-items-center rounded-lg text-primary ${selected ? "bg-primary-container/20" : "bg-surface-container"}`}>
                            <MaterialIcon name={item.icon} className="text-lg" />
                          </span>
                          {item.wide ? (
                            <span>
                              <span className={`block text-sm font-semibold ${selected ? "text-primary" : "text-on-surface"}`}>{item.role}</span>
                              <span className="text-[11px] text-on-surface-variant">{item.hint}</span>
                            </span>
                          ) : null}
                        </span>
                        {selected ? (
                          <span className="grid size-5 place-items-center rounded-full bg-primary text-white">
                            <MaterialIcon name="check" className="text-sm" />
                          </span>
                        ) : null}
                      </span>
                      {item.wide ? null : (
                        <span className="mt-2">
                          <span className={`block text-sm font-semibold leading-tight ${selected ? "font-bold text-primary" : "text-on-surface"}`}>{item.role}</span>
                          <span className="mt-0.5 block text-[11px] text-on-surface-variant">{item.hint}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
                <p className="hidden items-center gap-1.5 text-[11px] text-slate-500 sm:flex">
                  <MaterialIcon name="keyboard" className="text-sm" />
                  Press <span className="font-semibold text-on-surface">Enter</span> to continue
                </p>
                <button
                  type="button"
                  disabled={!role}
                  onClick={() => role && setStep(2)}
                  className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white custom-brand-shadow disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <MaterialIcon name="arrow_forward" className="text-base" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface" onClick={() => setStep(1)}>
                <MaterialIcon name="arrow_back" className="text-lg" />
                Back
              </button>
              <button type="button" aria-label="Close" className="grid size-8 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container" onClick={() => setOpen(false)}>
                <MaterialIcon name="close" />
              </button>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                <span className="size-2 animate-pulse rounded-full bg-primary-container" />
                Early access cohort
              </span>
              <h2 id="waitlist-title" className="mt-2 font-display text-[1.65rem] font-bold tracking-tight">
                {status === "success" ? "You're on the list" : "Join the waitlist"}
              </h2>
              <p className="text-base text-secondary">{status === "success" ? "We'll be in touch as new laboratories launch." : "Just a few details and you're in."}</p>
            </div>
            {status === "success" ? null : (
              <>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-primary">
                    <span>Registration</span>
                    <span className="font-semibold text-secondary">Step 2 of 2</span>
                  </div>
                  <div className="flex h-2 gap-1.5 overflow-hidden rounded-full bg-surface-container p-0.5">
                    <span className="h-full w-1/2 rounded-full bg-primary" />
                    <span className="h-full w-1/2 rounded-full bg-primary-container" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary">
                      <MaterialIcon name={role ? roleIcon(role) : "person"} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Selected role</p>
                      <p className="font-display text-base font-semibold">{role}</p>
                    </div>
                  </div>
                  <button type="button" className="rounded-md px-2.5 py-1 text-xs font-semibold text-primary underline underline-offset-2 hover:bg-primary/5" onClick={() => setStep(1)}>
                    Change
                  </button>
                </div>
                {error ? (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
                    {error}
                  </p>
                ) : null}
                <label className="grid gap-1.5 text-sm font-semibold">
                  <span>Full name <span className="text-red-700">*</span></span>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" placeholder="e.g. John Doe" className="h-12 rounded-[10px] border border-outline-variant px-4 font-normal text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  <span>Email address <span className="text-red-700">*</span></span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" autoComplete="email" placeholder="you@example.com" className="h-12 rounded-[10px] border border-outline-variant px-4 font-normal text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  <span className="flex items-center justify-between">
                    School or institution
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-medium text-secondary">Optional</span>
                  </span>
                  <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. King's College Lagos" className="h-12 rounded-[10px] border border-outline-variant px-4 font-normal text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                {role === "Other" ? (
                  <label className="grid gap-1.5 text-sm font-semibold">
                    <span className="flex items-center justify-between">
                      Tell us your role
                      <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-medium text-secondary">Optional</span>
                    </span>
                    <input value={roleNote} onChange={(e) => setRoleNote(e.target.value)} placeholder="e.g. Science curriculum specialist" className="h-12 rounded-[10px] border border-outline-variant px-4 font-normal text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </label>
                ) : null}
                <p className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <MaterialIcon name="lock" className="text-lg text-primary" />
                  We'll only use your details to contact you about early access. No spam.
                </p>
                <button type="submit" disabled={status === "submitting"} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-white custom-brand-shadow disabled:opacity-60">
                  {status === "submitting" ? "Joining…" : "Join the waitlist"}
                  <MaterialIcon name="arrow_forward" />
                </button>
                <p className="text-center text-[13px] text-secondary">By joining you agree to be contacted about Expera early access.</p>
              </>
            )}
          </form>
        )}
        <div className="flex items-center justify-between border-t border-outline-variant/30 bg-surface-container px-6 py-3 text-[11px] text-on-surface-variant">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary-container" />
            Expera Cloud Hub · Lagos
          </span>
          <span>expera.iseowoapp.com</span>
        </div>
      </div>
    </div>
  );
}
