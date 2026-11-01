"use client";

import { useState } from "react";
import { z } from "zod";
import { EARLY_ACCESS_ROLES } from "./landing-data";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(EARLY_ACCESS_ROLES as unknown as [string, ...string[]]),
  institution: z.string().trim().optional(),
  consent: z.boolean().refine((v) => v === true, { message: "Consent is required to join early access." }),
});

type FormState = "idle" | "submitting" | "success" | "error";

export function EarlyAccessForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      role: fd.get("role"),
      institution: fd.get("institution") || undefined,
      consent: fd.get("consent") === "on",
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setState("error");
      setMessage("Check the highlighted fields and try again.");
      return;
    }
    setState("submitting");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Try again shortly.");
        return;
      }
      setState("success");
      setMessage(data.message ?? "Thank you — you are on the early-access list.");
      e.currentTarget.reset();
    } catch {
      setState("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className={`grid gap-4 ${compact ? "" : "rounded-[var(--expera-radius-xl)] border border-expera-border bg-expera-surface p-6 shadow-[0_20px_50px_var(--expera-shadow)] md:p-8"}`} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-expera-navy">Full name</span>
          <input
            name="fullName"
            required
            autoComplete="name"
            className="min-h-11 rounded-xl border border-expera-border bg-expera-bg px-3 text-expera-navy"
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? "ea-name-error" : undefined}
          />
          {fieldErrors.fullName ? (
            <span id="ea-name-error" className="text-xs text-red-700">
              {fieldErrors.fullName}
            </span>
          ) : null}
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-expera-navy">Email address</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="min-h-11 rounded-xl border border-expera-border bg-expera-bg px-3 text-expera-navy"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? <span className="text-xs text-red-700">{fieldErrors.email}</span> : null}
        </label>
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold text-expera-navy">Role</span>
        <select name="role" required className="min-h-11 rounded-xl border border-expera-border bg-expera-bg px-3 text-expera-navy" defaultValue="">
          <option value="" disabled>
            Select your role
          </option>
          {EARLY_ACCESS_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        {fieldErrors.role ? <span className="text-xs text-red-700">{fieldErrors.role}</span> : null}
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold text-expera-navy">
          School or institution <span className="font-normal text-expera-ink-soft">(optional)</span>
        </span>
        <input name="institution" className="min-h-11 rounded-xl border border-expera-border bg-expera-bg px-3 text-expera-navy" />
      </label>
      <label className="flex gap-3 text-sm leading-relaxed text-expera-ink-soft">
        <input name="consent" type="checkbox" className="mt-1 size-4 rounded border-expera-border" required />
        <span>
          I agree to be contacted about Expera early access and understand my details will be stored locally on this deployment for
          registration purposes until a production database is connected.
        </span>
      </label>
      {fieldErrors.consent ? <span className="text-xs text-red-700">{fieldErrors.consent}</span> : null}
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-expera-primary px-6 text-sm font-semibold text-white transition hover:bg-expera-primary-deep disabled:opacity-60"
      >
        {state === "submitting" ? "Submitting…" : "Join early access"}
      </button>
      {message ? (
        <p
          role="status"
          className={`text-sm ${state === "success" ? "text-emerald-800" : state === "error" ? "text-red-800" : "text-expera-ink-soft"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
