const S = { fill: "none", stroke: "#1e293b", strokeWidth: 2.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const SHAPES: Record<string, React.ReactNode> = {
  beaker: (
    <>
      <path {...S} d="M25 15 h50 M30 15 v65 a5 5 0 0 0 5 5 h30 a5 5 0 0 0 5 -5 v-65" />
      <path {...S} strokeWidth={1.5} d="M60 35 h10 M60 50 h10 M60 65 h10" />
    </>
  ),
  "conical-flask": <path {...S} d="M42 10 h16 M44 10 v25 l-24 45 a5 5 0 0 0 4 7 h52 a5 5 0 0 0 4 -7 l-24 -45 v-25" />,
  burette: (
    <>
      <path {...S} d="M45 5 v75 h10 v-75 M50 80 v6 M44 86 h12 M50 86 v9" />
      <path {...S} strokeWidth={1.2} d="M45 15 h4 M45 25 h4 M45 35 h4 M45 45 h4 M45 55 h4 M45 65 h4" />
    </>
  ),
  pipette: <path {...S} d="M50 5 v25 M50 30 c-10 5 -10 30 0 35 c10 -5 10 -30 0 -35 M50 65 v30 M44 18 h12" />,
  "measuring-cylinder": (
    <>
      <path {...S} d="M38 10 v75 h24 v-75 M30 85 h40" />
      <path {...S} strokeWidth={1.2} d="M38 25 h8 M38 40 h8 M38 55 h8 M38 70 h8" />
    </>
  ),
  "test-tube": <path {...S} d="M40 8 v70 a10 10 0 0 0 20 0 v-70 M36 8 h28" />,
  "filter-funnel": <path {...S} d="M15 20 h70 l-30 35 v35 h-10 v-35 z" />,
  "bunsen-burner": <path {...S} d="M43 25 h14 v55 h-14 z M25 80 h50 v8 h-50 z M57 60 h15 M50 25 c-8 -8 0 -18 0 -20 c0 2 8 12 0 20" />,
  "evaporating-dish": <path {...S} d="M15 50 h70 c0 25 -70 25 -70 0 M80 50 l8 -4" />,
  "separating-funnel": <path {...S} d="M45 8 h10 M47 8 v8 c-25 10 -25 40 3 55 c28 -15 28 -45 3 -55 v-8 M50 71 v24 M42 80 h16" />,
  "retort-stand": <path {...S} d="M20 88 h50 v6 h-50 z M30 88 v-80 M30 35 h35 M60 30 v10" />,
  "white-tile": <rect {...S} x="15" y="55" width="70" height="20" />,
  "wash-bottle": <path {...S} d="M30 40 h40 v48 h-40 z M45 40 v-12 h10 v12 M50 28 c0 -15 20 -15 30 -10" />,
  condenser: <path {...S} d="M10 30 l80 40 M20 22 l70 35 M10 38 l70 35 M35 30 l-6 -10 M65 60 l6 10" />,
  "distillation-flask": <path {...S} d="M45 8 v25 c-25 5 -25 55 5 55 c30 0 30 -50 5 -55 v-25 M55 20 l30 15" />,
  "chromatography-paper": (
    <>
      <path {...S} d="M30 10 h40 v80 h-40 z" />
      <path {...S} strokeDasharray="4 3" d="M30 75 h40" />
      <circle cx="50" cy="75" r="3" fill="#1e293b" />
    </>
  ),
  thermometer: <path {...S} d="M46 10 v60 a8 8 0 1 0 8 0 v-60 a4 4 0 0 0 -8 0 M50 30 v45" />,
  spatula: <path {...S} d="M50 10 v60 M44 70 h12 l-2 18 h-8 z" />,
  dropper: <path {...S} d="M42 10 h16 v15 h-16 z M45 25 v50 l5 15 l5 -15 v-50" />,
  "tripod-gauze": <path {...S} d="M20 40 h60 M25 40 l-8 50 M75 40 l8 50 M50 40 v50" />,
};

export function ApparatusIcon({ id, size = 64, label }: { id: string; size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label ?? "Apparatus drawing"}>
      {SHAPES[id] ?? <text x="50" y="55" textAnchor="middle" fontSize="12">{id}</text>}
    </svg>
  );
}

export const APPARATUS_WITH_DRAWINGS = Object.keys(SHAPES);
