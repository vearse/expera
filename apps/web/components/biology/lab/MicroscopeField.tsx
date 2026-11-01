"use client";

import type { ObservationResult, SlideState } from "@/lib/engine/biology/microscopy";
import type { SpecimenSpec, SpecimenVariant, StructureSpec } from "@/lib/content/biology";

const SIZE = 400;

function OrganismShape({ structure }: { structure: StructureSpec }) {
  const x = structure.point[0] * SIZE;
  const y = structure.point[1] * SIZE;
  const id = structure.id;

  if (id.includes("paramecium")) {
    return (
      <g transform={`translate(${x} ${y}) rotate(-18)`}>
        <ellipse rx="44" ry="20" fill="#b6d7a8" stroke="#3f6212" strokeWidth="2" />
        <path d="M -20 -5 Q 8 8 24 -2" fill="none" stroke="#4d7c0f" strokeWidth="2" />
        <circle cx="20" cy="-4" r="4" fill="#365314" />
        <circle cx="-14" cy="-7" r="5" fill="#e2e8f0" stroke="#64748b" />
      </g>
    );
  }
  if (id.includes("euglena")) {
    return (
      <g transform={`translate(${x} ${y}) rotate(30)`}>
        <path d="M -30 0 C -10 -18 18 -16 30 0 C 18 14 -10 16 -30 0 Z" fill="#86c76f" stroke="#3f6212" strokeWidth="2" />
        <circle cx="16" cy="-3" r="3.5" fill="#dc2626" />
        <path d="M -30 0 Q -48 -8 -58 3" fill="none" stroke="#4d7c0f" strokeWidth="1.6" />
      </g>
    );
  }
  if (id.includes("amoeba")) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M -38 -8 C -44 -26 -22 -34 -8 -25 C 2 -42 24 -30 25 -16 C 43 -14 40 6 30 13 C 38 30 14 37 4 27 C -6 42 -30 30 -26 14 C -44 9 -48 -2 -38 -8 Z" fill="#c7d2e8" stroke="#475569" strokeWidth="2" />
        <circle cx="8" cy="2" r="7" fill="#64748b" opacity="0.7" />
        <circle cx="-16" cy="-6" r="5" fill="#94a3b8" opacity="0.7" />
      </g>
    );
  }
  if (id.includes("volvox")) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <circle r="34" fill="#86efac" stroke="#15803d" strokeWidth="2" />
        {Array.from({ length: 14 }).map((_, index) => {
          const angle = (index / 14) * Math.PI * 2;
          return <circle key={index} cx={Math.cos(angle) * 23} cy={Math.sin(angle) * 23} r="3" fill="#166534" />;
        })}
        <circle cx="7" cy="-4" r="7" fill="#4ade80" stroke="#166534" />
        <circle cx="-9" cy="9" r="5" fill="#4ade80" stroke="#166534" />
      </g>
    );
  }
  if (id.includes("diatom")) {
    return (
      <g transform={`translate(${x} ${y}) rotate(-28)`}>
        <ellipse rx="28" ry="11" fill="#facc15" stroke="#a16207" strokeWidth="2" opacity="0.85" />
        <path d="M -22 0 H 22 M -10 -6 V 6 M 2 -7 V 7 M 12 -5 V 5" stroke="#a16207" strokeWidth="1.4" fill="none" />
      </g>
    );
  }
  if (id.includes("stentor")) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M -30 32 L -12 -18 Q 0 -30 12 -18 L 30 32 Q 0 44 -30 32 Z" fill="#99f6e4" stroke="#0f766e" strokeWidth="2" />
        <path d="M -12 -18 Q 0 -8 12 -18" fill="none" stroke="#115e59" strokeWidth="2" />
        <path d="M -4 30 Q 0 12 4 30" fill="none" stroke="#115e59" strokeWidth="1.4" />
      </g>
    );
  }
  if (id.includes("cilia")) {
    return null;
  }
  if (id.includes("flagellum")) {
    return null;
  }
  return <circle cx={x} cy={y} r="20" fill="#a3c9a8" stroke="#3f6212" strokeWidth="2" />;
}

function OnionField({ visible }: { visible: string[] }) {
  const showWall = visible.includes("cell-wall");
  const showNucleus = visible.includes("nucleus");
  const showCytoplasm = visible.includes("cytoplasm");
  const showVacuole = visible.includes("vacuole");
  const xs = [0.18, 0.42, 0.66, 0.9];
  const ys = [0.14, 0.38, 0.62, 0.86];
  return (
    <g>
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 3 }).map((__, col) => (
          <rect
            key={`${row}-${col}`}
            x={xs[col] * SIZE}
            y={ys[row] * SIZE}
            width={(xs[col + 1] - xs[col]) * SIZE}
            height={(ys[row + 1] - ys[row]) * SIZE}
            rx="10"
            fill={showCytoplasm ? "#e9efcf" : "none"}
            stroke={showWall ? "#6b7f2b" : "none"}
            strokeWidth="2.4"
          />
        )),
      )}
      {showVacuole
        ? [
            [0.3, 0.26],
            [0.78, 0.5],
            [0.54, 0.74],
          ].map(([cx, cy]) => <ellipse key={`${cx}-${cy}`} cx={cx * SIZE} cy={cy * SIZE} rx="28" ry="18" fill="#f8fafc" opacity="0.5" stroke="#cbd5e1" />)
        : null}
      {showNucleus
        ? [
            [0.52, 0.48],
            [0.28, 0.25],
            [0.78, 0.73],
          ].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx * SIZE} cy={cy * SIZE} r="9" fill="#b45309" />
              <circle cx={cx * SIZE - 2} cy={cy * SIZE - 2} r="3" fill="#fde68a" />
            </g>
          ))
        : null}
    </g>
  );
}

function CheekField({ visible }: { visible: string[] }) {
  const showMembrane = visible.includes("cell-membrane");
  const showNucleus = visible.includes("nucleus");
  const showCytoplasm = visible.includes("cytoplasm");
  const cells = [
    { cx: 0.5, cy: 0.5, rx: 0.24, ry: 0.2, rotate: -12 },
    { cx: 0.21, cy: 0.28, rx: 0.13, ry: 0.1, rotate: 18 },
    { cx: 0.78, cy: 0.7, rx: 0.14, ry: 0.1, rotate: -20 },
  ];
  return (
    <g>
      {cells.map((cell, index) => (
        <g key={index} transform={`rotate(${cell.rotate} ${cell.cx * SIZE} ${cell.cy * SIZE})`}>
          <ellipse
            cx={cell.cx * SIZE}
            cy={cell.cy * SIZE}
            rx={cell.rx * SIZE}
            ry={cell.ry * SIZE}
            fill={showCytoplasm ? "#c7d2fe" : "none"}
            stroke={showMembrane ? "#4338ca" : "none"}
            strokeWidth="2.4"
          />
          {showNucleus ? (
            <>
              <ellipse cx={cell.cx * SIZE + (index === 0 ? 5 : 0)} cy={cell.cy * SIZE} rx={index === 0 ? 15 : 8} ry={index === 0 ? 11 : 6} fill="#5b21b6" />
              <circle cx={cell.cx * SIZE - 3} cy={cell.cy * SIZE - 3} r={index === 0 ? 4 : 2.5} fill="#ddd6fe" />
            </>
          ) : null}
        </g>
      ))}
    </g>
  );
}

export function MicroscopeField({
  specimen,
  variant,
  slide,
  observation,
  compact = false,
}: {
  specimen: SpecimenSpec | null;
  variant: SpecimenVariant | null;
  slide: SlideState | null;
  observation: ObservationResult | null;
  compact?: boolean;
}) {
  const status = observation?.status ?? "no-specimen";
  const showField = Boolean(specimen && variant && slide?.onStage && slide.secured && status !== "empty-field");
  const focus = observation?.focusQuality ?? 0;
  const clarity = observation?.clarity ?? 0;
  const brightness = observation?.brightness ?? 0;
  const total = observation?.totalMagnification ?? 100;
  const field = observation?.fieldOfViewMicrometres ?? 1800;
  const scale = Math.min(2.3, Math.max(0.85, 1 + Math.log2(Math.max(1, total / 100)) * 0.38));
  const offsetX = slide ? -slide.offsetXMicrometres / Math.max(field, 1) * SIZE : 0;
  const offsetY = slide ? slide.offsetYMicrometres / Math.max(field, 1) * SIZE : 0;
  const visible = status === "observable" ? observation?.visibleStructureIds ?? [] : [];
  const blur = Math.min(9, (1 - focus) * 7 + (1 - clarity) * 3);
  const dark = Math.max(0, 1 - brightness * 0.98);
  const glare = Math.max(0, (brightness - 0.91) * 2.4);
  const random = specimen?.id ?? "empty";

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-900 bg-slate-950 ${compact ? "aspect-square" : "aspect-square w-full"}`}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full"
        role="img"
        aria-label={
          showField
            ? `${specimen?.name ?? "Specimen"} field of view at ${total}× total magnification. ${visible.length} structures visible.`
            : "Microscope field of view. No prepared slide is ready for observation."
        }
      >
        <defs>
          <clipPath id="field-clip">
            <circle cx="200" cy="200" r="187" />
          </clipPath>
          <radialGradient id="field-light" cx="50%" cy="47%" r="55%">
            <stop offset="0%" stopColor="#fffef0" stopOpacity="0.25" />
            <stop offset="78%" stopColor="#e7e5d8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
          </radialGradient>
          <filter id={`focus-${random}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
          <pattern id="graticule" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#94a3b8" strokeWidth="0.5" opacity="0.2" />
          </pattern>
        </defs>

        <rect width={SIZE} height={SIZE} fill="#07120f" />
        <g clipPath="url(#field-clip)">
          <rect width={SIZE} height={SIZE} fill="#16251b" />
          <rect width={SIZE} height={SIZE} fill="url(#field-light)" />
          {showField ? (
            <g filter={`url(#focus-${random})`} opacity={Math.max(0.22, 0.18 + clarity * 0.82)}>
              <g transform={`translate(200 200) scale(${scale}) translate(-200 -200) translate(${offsetX} ${offsetY})`}>
                {specimen?.id === "onion-epidermis" ? <OnionField visible={visible} /> : null}
                {specimen?.id === "cheek-cells" ? <CheekField visible={visible} /> : null}
                {specimen?.id === "pond-water" && variant
                  ? variant.structures
                      .filter((structure) => visible.includes(structure.id) && ["organism", "structure"].includes(structure.kind))
                      .map((structure) => <OrganismShape key={structure.id} structure={structure} />)
                  : null}
                {specimen?.id === "pond-water" && visible.length === 0 ? (
                  <g opacity="0.4">
                    <circle cx="170" cy="170" r="34" fill="#6b7f2b" />
                    <circle cx="245" cy="230" r="22" fill="#94a3b8" />
                    <path d="M80 260 Q130 230 180 265 T320 250" fill="none" stroke="#475569" strokeWidth="2" />
                  </g>
                ) : null}
              </g>
            </g>
          ) : null}
          <rect width={SIZE} height={SIZE} fill="#020617" opacity={Math.min(0.95, dark)} />
          <rect width={SIZE} height={SIZE} fill="#fefce8" opacity={Math.min(0.75, glare)} />
          {showField ? <rect width={SIZE} height={SIZE} fill="url(#graticule)" opacity="0.55" /> : null}
        </g>
        <circle cx="200" cy="200" r="187" fill="none" stroke="#0f172a" strokeWidth="13" />
        <circle cx="200" cy="200" r="187" fill="none" stroke="#94a3b8" strokeWidth="1.2" opacity="0.8" />
        <path d="M 200 24 V 41 M 200 359 V 376 M 24 200 H 41 M 359 200 H 376" stroke="#cbd5e1" strokeWidth="2" opacity="0.65" />
        {!showField ? (
          <g>
            <rect x="74" y="167" width="252" height="66" rx="12" fill="#020617" opacity="0.88" />
            <text x="200" y="194" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="600">
              {status === "empty-field"
                ? "Specimen outside the field"
                : status === "preparation-incomplete"
                  ? "Slide preparation incomplete"
                  : status === "not-secured"
                    ? "Secure the slide with the clips"
                    : slide?.onStage
                      ? "No clear specimen image"
                      : "Place a prepared slide on the stage"}
            </text>
            <text x="200" y="214" textAnchor="middle" fill="#94a3b8" fontSize="11">
              {status === "empty-field" ? "Move the slide to centre the specimen" : "Use the workbench controls to continue"}
            </text>
          </g>
        ) : null}
      </svg>
      <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-slate-950/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
        {total}× · FOV {(field / 1000).toFixed(2)} mm
      </div>
      <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] text-slate-300">
        live optics preview
      </div>
    </div>
  );
}
