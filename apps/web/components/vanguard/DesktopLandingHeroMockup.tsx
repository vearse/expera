/** Hero viewport mockup aligned to expera_desktop_landing_page design. */
export function DesktopLandingHeroMockup() {
  return (
    <div className="relative lg:col-span-6">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-container/20 to-tertiary-container/30 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-lg border border-outline/30 bg-inverse-surface p-4 text-inverse-on-surface shadow-2xl md:p-6">
        <div className="flex items-center justify-between border-b border-outline/40 pb-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-error" />
            <span className="size-3 rounded-full bg-amber-400" />
            <span className="size-3 rounded-full bg-primary-container" />
            <span className="ml-3 flex items-center gap-1 text-label-sm text-inverse-on-surface/80">
              <span className="material-symbols-outlined text-[14px]">biotech</span>
              Expera 3D Engine · WAEC mode
            </span>
          </div>
          <span className="rounded-full border border-primary-container/40 bg-primary-container/20 px-2.5 py-0.5 text-label-sm font-semibold text-primary-fixed">
            WebGL optional
          </span>
        </div>
        <div className="relative my-4 flex h-80 w-full items-center justify-center overflow-hidden rounded-md border border-outline/20 bg-slate-900/90 sm:h-96">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] opacity-15 [background-size:16px_16px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex size-44 animate-pulse items-center justify-center rounded-full border-2 border-primary-container/40">
              <div className="absolute h-28 w-56 rotate-45 rounded-full border border-tertiary-fixed-dim/40" />
              <div className="absolute h-28 w-56 -rotate-45 rounded-full border border-primary-fixed/40" />
              <div className="relative z-20 flex flex-col items-center">
                <div className="h-16 w-4 rounded-t-sm border border-emerald-300 bg-gradient-to-b from-blue-300/40 to-emerald-400/80" />
                <div className="flex h-20 w-16 items-center justify-center rounded-b-2xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-400/60 to-emerald-600/90 shadow-lg shadow-emerald-500/30">
                  <span className="text-label-sm font-bold text-white">0.1M HCl</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute left-6 top-6 rounded-md border border-outline/40 bg-inverse-surface/90 p-3 shadow-lg backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary-fixed">Group 1 alkali</div>
            <div className="font-display text-2xl font-bold text-white">
              Na <span className="text-xs font-normal text-inverse-on-surface/60">22.99</span>
            </div>
            <div className="text-[11px] text-inverse-on-surface/70">Sodium (at. no 11)</div>
          </div>
          <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full border border-primary-container/50 bg-inverse-surface/90 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
            <span className="size-2.5 animate-ping rounded-full bg-primary-container" />
            <span className="text-label-sm text-inverse-on-surface">
              Reaction: <strong className="text-primary-fixed">Exothermic</strong>
            </span>
          </div>
          <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-primary-container/50 bg-inverse-surface/90 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
            <span className="material-symbols-outlined text-[16px] text-primary-fixed">verified</span>
            <span className="text-label-sm text-inverse-on-surface">
              Concordant titre: <strong className="text-primary-fixed">24.60 cm³</strong>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-inverse-on-surface/70">
          <span>Burette initial volume: 0.00 cm³</span>
          <span>Titre 1 end-point: 24.60 cm³</span>
          <span className="font-bold text-primary-fixed">Indicator: Methyl orange</span>
        </div>
      </div>
    </div>
  );
}
