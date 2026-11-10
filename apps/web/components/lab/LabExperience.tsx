"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type LabReadyApi = { markReady: () => void; ready: boolean };

const LabReadyContext = createContext<LabReadyApi | null>(null);

export function useLabReadySignal(): (() => void) | undefined {
  return useContext(LabReadyContext)?.markReady;
}

const LOADING_MESSAGES = [
  "Unpacking the apparatus…",
  "Arranging the workbench…",
  "Checking the safety notes…",
  "Waking Ms. Ada…",
];

const MIN_LOADING_MS = 750;
const FALLBACK_READY_MS = 18_000;
const FADE_MS = 500;

export function LabLoadingPanel({
  label = "Preparing your laboratory…",
  className = "h-[560px]",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-slate-950 text-slate-100 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative grid size-14 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/20" />
        <Image src="/brand/icon.png" alt="" width={44} height={47} className="relative size-10 object-contain" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Expera</p>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}

export function LabExperience({
  children,
  title,
  subject,
  waitForSignal = true,
}: {
  children: ReactNode;
  title?: string;
  subject?: string;
  waitForSignal?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");
  const [messageIndex, setMessageIndex] = useState(0);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const markReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (waitForSignal) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [waitForSignal]);

  useEffect(() => {
    if (!waitForSignal || ready) return;
    const timer = setTimeout(() => setReady(true), FALLBACK_READY_MS);
    return () => clearTimeout(timer);
  }, [ready, waitForSignal]);

  useEffect(() => {
    if (!ready) return;
    const elapsed = Date.now() - (mountedAt.current || Date.now());
    const wait = Math.max(0, MIN_LOADING_MS - elapsed);
    const timer = setTimeout(() => setPhase("revealing"), wait);
    return () => clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (phase !== "revealing") return;
    const timer = setTimeout(() => setPhase("done"), FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "done") return;
    const timer = setInterval(() => {
      setMessageIndex((index) => (index + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [phase]);

  const api = useMemo(() => ({ markReady, ready }), [markReady, ready]);

  return (
    <LabReadyContext.Provider value={api}>
      {children}

      {phase !== "done" ? (
        <div
          className={`fixed inset-0 z-[110] flex flex-col items-center justify-center gap-6 bg-[#0c1224] px-6 text-center text-white transition-opacity duration-500 ${
            phase === "revealing" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          role="status"
          aria-live="polite"
          aria-busy={phase === "loading"}
        >
          <div className="relative grid size-24 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/15" />
            <span className="absolute inset-0 rounded-[28px] border border-sky-300/25 bg-white/5" />
            <Image src="/brand/icon.png" alt="Expera" width={72} height={76} priority className="relative size-16 object-contain" />
          </div>

          <div>
            <p className="font-display text-2xl font-bold tracking-tight">Expera</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-300">
              {subject ? `${subject} virtual laboratory` : "Virtual laboratory"}
            </p>
          </div>

          <div className="w-60 max-w-full">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="expera-loading-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400" />
            </div>
            <p className="mt-3 min-h-5 text-sm text-white/70">{title ? `${title} · ` : ""}{LOADING_MESSAGES[messageIndex]}</p>
          </div>

          <p className="text-[11px] text-white/40">Please keep this tab open while the laboratory loads.</p>
        </div>
      ) : null}

      <LabOrientationGate />
    </LabReadyContext.Provider>
  );
}

function LabOrientationGate() {
  const [portrait, setPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(orientation: portrait) and (max-width: 1180px) and (pointer: coarse)");
    const update = () => setPortrait(query.matches);
    update();
    query.addEventListener?.("change", update);
    window.addEventListener("orientationchange", update);
    return () => {
      query.removeEventListener?.("change", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  if (!portrait || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-6 bg-[#0c1224]/97 px-6 text-center text-white backdrop-blur-md">
      <div className="relative grid size-28 place-items-center rounded-[2rem] border border-white/15 bg-white/5">
        <span className="absolute inset-0 animate-ping rounded-[2rem] bg-sky-400/10" />
        <span className="material-symbols-outlined expera-rotate-hint text-6xl text-sky-300" aria-hidden>
          screen_rotation
        </span>
      </div>

      <div className="max-w-sm space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-300">Expera laboratory</p>
        <h2 className="font-display text-2xl font-bold tracking-tight">Rotate your phone</h2>
        <p className="text-sm leading-relaxed text-white/70">
          The bench, apparatus and teacher notes need a wider screen. Turn your phone sideways to enter the laboratory.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        Continue in portrait
      </button>
    </div>
  );
}
