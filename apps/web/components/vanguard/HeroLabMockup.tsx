export function HeroLabMockup() {
  return (
    <div className="relative w-full">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-container/20 to-tertiary-container/30 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-tr from-brand-ink via-[#132822] to-[#0a1f18] p-5 shadow-2xl sm:aspect-[16/11] sm:p-7">
        <div className="absolute inset-0 lab-grid-dark opacity-30" />
        <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 font-mono text-xs text-emerald-400/80">SIM_SESSION://TITRATION_ACID_BASE</span>
          </div>
          <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-1 text-xs text-emerald-300">
            <span className="material-symbols-outlined text-xs">view_in_ar</span>
            WebGL 3D optional
          </div>
        </div>
        <div className="relative flex min-h-[280px] items-center justify-center py-4 sm:min-h-[320px]">
          <div className="absolute size-60 rounded-full border border-dashed border-emerald-500/25 sm:size-72" style={{ animationDuration: "25s" }} />
          <div className="absolute size-44 rotate-45 rounded-full border border-cyan-400/20 sm:size-56" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex h-32 w-4 flex-col justify-end rounded-t-sm border border-emerald-400/40 bg-white/10 p-0.5 shadow-inner sm:h-40">
              <div className="relative h-24 w-full rounded-b-xs bg-gradient-to-t from-emerald-400/80 to-emerald-200/40">
                <span className="absolute -right-8 top-2 font-mono text-[9px] text-emerald-300">24.50 mL</span>
              </div>
            </div>
            <div className="my-0.5 flex h-3 w-8 items-center justify-center rounded bg-emerald-500/80 shadow">
              <div className="h-1 w-2 rounded-full bg-white" />
            </div>
            <div className="my-2 size-2 animate-bounce rounded-full bg-emerald-300 opacity-90" />
            <div className="relative h-28 w-28 sm:h-36 sm:w-36">
              <svg className="h-full w-full drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]" viewBox="0 0 120 120" aria-hidden>
                <path
                  d="M50 15 L70 15 L70 35 L105 100 A 10 10 0 0 1 96 112 L24 112 A 10 10 0 0 1 15 100 L50 35 Z"
                  fill="rgba(255,255,255,0.06)"
                  stroke="#4edea3"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M26 95 L94 95 L96 100 A 10 10 0 0 1 88 110 L32 110 A 10 10 0 0 1 24 100 Z"
                  fill="url(#solutionGrad)"
                />
                <path d="M26 95 Q 60 92 94 95" fill="none" stroke="#a7f3d0" strokeWidth="2" />
                <defs>
                  <linearGradient id="solutionGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#34d399" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div className="absolute left-2 top-4 flex animate-pulse items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-md sm:left-4 sm:p-3">
            <div className="flex size-8 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/20 font-display text-sm font-bold text-emerald-300">
              HCl
            </div>
            <div className="text-[11px] text-gray-300">
              <div className="font-mono">0.10 M titrant</div>
              <div className="font-medium text-emerald-400">Standardised sol.</div>
            </div>
          </div>
          <div className="absolute bottom-3 right-2 flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-md sm:bottom-6 sm:right-4">
            <div className="flex size-8 items-center justify-center rounded-lg border border-pink-400/40 bg-pink-500/20 font-display text-sm font-bold text-pink-300">
              pH
            </div>
            <div className="text-[11px] text-gray-200">
              <div className="font-mono">Indicator: methyl orange</div>
              <div className="font-bold text-pink-400">Endpoint tracking</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between font-mono text-xs text-emerald-400/60">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            WAEC Chemistry practical style
          </span>
          <span>Expera lab engine</span>
        </div>
      </div>
    </div>
  );
}
