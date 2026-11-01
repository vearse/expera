"use client";

import type { SpecimenSpec } from "@/lib/content/biology";
import type { ObservationResult, SlideState } from "@/lib/engine/biology/microscopy";
import type { MicroscopeModelSpec } from "@/lib/content/biology";
import type { SpecimenVariant } from "@/lib/content/biology";
import { MicroscopeField } from "./MicroscopeField";

export function BiologyBench2D({
  model,
  specimen,
  variant,
  specimens,
  activeSpecimenId,
  slide,
  selectedPart,
  observation,
  onInspectPart,
  onSelectSpecimen,
  onStageClick,
  onClipClick,
  onSelectMicroscope,
}: {
  model: MicroscopeModelSpec;
  specimen: SpecimenSpec | null;
  variant: SpecimenVariant | null;
  specimens: SpecimenSpec[];
  activeSpecimenId: string | null;
  slide: SlideState | null;
  selectedPart: string | null;
  observation: ObservationResult | null;
  onInspectPart: (id: string) => void;
  onSelectSpecimen: (id: string) => void;
  onStageClick: () => void;
  onClipClick: () => void;
  onSelectMicroscope: (id: string) => void;
}) {
  const lit = observation ? observation.brightness > 0.02 : false;
  const focus = observation?.focusQuality ?? 0;

  const hotspot = (id: string, label: string, x: number, y: number, width = 10, height = 8) => (
    <g
      key={id}
      role="button"
      tabIndex={0}
      aria-label={`Inspect ${label}`}
      className="cursor-pointer"
      onClick={() => onInspectPart(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onInspectPart(id);
        }
      }}
    >
      <rect x={x} y={y} width={width} height={height} rx="2" fill="#0f766e" opacity={selectedPart === id ? 0.35 : 0.01} stroke={selectedPart === id ? "#0f766e" : "transparent"} strokeWidth="0.6" />
    </g>
  );

  return (
    <div className="grid gap-3 rounded-2xl border border-emerald-900/15 bg-emerald-50 p-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_230px]">
        <div className="overflow-hidden rounded-xl border border-emerald-900/15 bg-[#f4f8ee]">
          <svg viewBox="0 0 500 320" className="h-full w-full" role="img" aria-label="2D biology laboratory bench with an interactive compound microscope, specimen jars and a slide preparation area.">
            <defs>
              <linearGradient id="bench2d" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eef3e6" />
                <stop offset="100%" stopColor="#d5dfc8" />
              </linearGradient>
              <radialGradient id="glass2d" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor={lit ? "#fefce8" : "#1e293b"} />
                <stop offset="100%" stopColor={lit ? "#fef9c3" : "#0f172a"} />
              </radialGradient>
            </defs>
            <rect width="500" height="320" fill="#e7eedf" />
            <rect y="238" width="500" height="82" fill="url(#bench2d)" />
            <rect y="232" width="500" height="10" fill="#b8c6a9" />
            <rect x="22" y="40" width="122" height="185" rx="7" fill="#a9bda1" />
            <rect x="31" y="52" width="104" height="154" rx="4" fill="#e8f1ec" opacity="0.75" />
            {[0, 1, 2].map((row) => (
              <rect key={row} x="40" y={66 + row * 46} width="86" height="6" rx="2" fill="#8ea388" />
            ))}
            <text x="83" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill="#33523a">SPECIMEN STORE</text>
            <g
              role="button"
              tabIndex={0}
              aria-label={`Select ${model.name}`}
              className="cursor-pointer"
              onClick={() => onSelectMicroscope(model.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectMicroscope(model.id);
                }
              }}
            >
              <rect x="169" y="208" width="148" height="22" rx="8" fill="#cbd5d9" />
              <rect x="192" y="76" width="28" height="143" rx="6" fill="#dbe4e8" />
              <rect x="225" y="80" width="22" height="93" rx="8" fill="#e4ecef" />
              <rect x="218" y="62" width="35" height="33" rx="8" fill="#1f2937" />
              <rect x="225" y="96" width="21" height="8" rx="3" fill="#0f766e" />
              <rect x="222" y="121" width="54" height="9" rx="3" fill="#334155" />
              <circle cx="205" cy="153" r="16" fill="#22313d" />
              <circle cx="205" cy="153" r="10" fill="none" stroke="#64748b" strokeWidth="2" />
              <circle cx="252" cy="153" r="11" fill="#22313d" />
              <ellipse cx="251" cy="212" rx="48" ry="12" fill={lit ? "#fefce8" : "#475569"} opacity="0.8" />
              <g style={{ filter: `blur(${(1 - focus) * 1.8}px)` }}>
                <rect x="234" y="110" width="30" height="8" rx="2" fill="#bfdbfe" opacity={slide?.onStage ? 0.9 : 0.18} />
                <rect x="238" y="112" width="22" height="4" fill="#65a30d" opacity={slide?.onStage ? 0.9 : 0.2} />
              </g>
              <text x="243" y="248" textAnchor="middle" fontSize="10" fontWeight="700" fill="#33523a">{model.name}</text>
            </g>

            <g
              role="button"
              tabIndex={0}
              aria-label="Place or inspect the microscope stage"
              className="cursor-pointer"
              onClick={onStageClick}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onStageClick();
                }
              }}
            >
              <rect x="220" y="118" width="59" height="15" rx="3" fill={slide?.onStage ? "#0ea5e9" : "#94a3b8"} opacity="0.55" />
              <text x="249" y="129" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#0f172a">{slide?.onStage ? "SLIDE" : "STAGE"}</text>
            </g>
            <g
              role="button"
              tabIndex={0}
              aria-label={slide?.secured ? "Release stage clips" : "Secure stage clips"}
              className="cursor-pointer"
              onClick={onClipClick}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClipClick();
                }
              }}
            >
              <rect x="218" y="114" width="8" height="10" rx="2" fill={slide?.secured ? "#f0b429" : "#64748b"} />
              <rect x="273" y="114" width="8" height="10" rx="2" fill={slide?.secured ? "#f0b429" : "#64748b"} />
            </g>

            {hotspot("eyepiece", "eyepiece", 216, 55, 39, 22)}
            {hotspot("nosepiece", "revolving nosepiece", 208, 100, 56, 18)}
            {hotspot("condenser", "condenser", 224, 133, 52, 16)}
            {hotspot("illuminator", "illuminator", 226, 198, 50, 20)}
            {hotspot("coarse-knob", "coarse adjustment knob", 187, 137, 20, 28)}
            {hotspot("fine-knob", "fine adjustment knob", 241, 141, 22, 20)}

            <g>
              <rect x="346" y="176" width="125" height="54" rx="6" fill="#c8d2bb" />
              <rect x="354" y="183" width="47" height="18" rx="3" fill="#e2e8f0" />
              {[0, 1, 2, 3].map((n) => (
                <rect key={n} x={358 + n * 10} y="189" width="7" height="7" fill="#bae6fd" opacity="0.8" />
              ))}
              {[0, 1, 2].map((n) => (
                <g key={n}>
                  <rect x={414 + n * 16} y="176" width="9" height="19" rx="2" fill={["#f59e0b", "#38bdf8", "#a78bfa"][n]} />
                  <rect x={416 + n * 16} y="171" width="5" height="6" fill="#334155" />
                </g>
              ))}
              <text x="408" y="249" textAnchor="middle" fontSize="9" fontWeight="700" fill="#33523a">SLIDE PREPARATION</text>
            </g>

            <g>
              {specimens.map((entry, index) => (
                <g
                  key={entry.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${entry.name}`}
                  className="cursor-pointer"
                  onClick={() => onSelectSpecimen(entry.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectSpecimen(entry.id);
                    }
                  }}
                >
                  <rect x={41 + (index % 2) * 44} y={72 + Math.floor(index / 2) * 46} width="34" height="32" rx="4" fill={["#b6d7a8", "#d8b4fe", "#99f6e4"][index % 3]} opacity={entry.id === activeSpecimenId ? 0.95 : 0.52} stroke={entry.id === activeSpecimenId ? "#0f766e" : "#64748b"} strokeWidth={entry.id === activeSpecimenId ? 2 : 1} />
                  <text x={58 + (index % 2) * 44} y={93 + Math.floor(index / 2) * 46} textAnchor="middle" fontSize="7" fontWeight="700" fill="#1e293b">{entry.name.split(" ")[0]}</text>
                </g>
              ))}
            </g>

            <rect x="0" y="0" width="500" height="24" fill="#0f172a" opacity="0.78" />
            <text x="250" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#d1fae5">2D MICROSCOPY BENCH · same simulation engine</text>
          </svg>
        </div>

        <div className="grid content-start gap-2">
          <MicroscopeField specimen={specimen} variant={variant} slide={slide} observation={observation} compact />
          <div className="rounded-lg border border-emerald-200 bg-white p-2 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-900">{specimen?.name ?? "No specimen selected"}</p>
            <p>Stage: {slide?.onStage ? (slide.secured ? "secure" : "unsecured") : "empty"}</p>
            <p>Focus: {Math.round(focus * 100)}% · Light: {lit ? "on" : "off"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {model.parts.slice(0, 8).map((part) => (
          <button
            key={part.id}
            type="button"
            onClick={() => onInspectPart(part.id)}
            className={`min-h-8 rounded-lg border px-2 text-[11px] font-semibold ${selectedPart === part.id ? "border-emerald-800 bg-emerald-800 text-white" : "border-emerald-300 bg-white text-emerald-900"}`}
          >
            {part.name}
          </button>
        ))}
        <span className="self-center px-1 text-[10px] uppercase tracking-wide text-emerald-700">click the bench or use the controls below</span>
      </div>
    </div>
  );
}
