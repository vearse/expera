/**
 * Close-up of a burette scale around the liquid level. 0.00 is at the top and
 * numbers increase downwards; the reading is taken at the bottom of the meniscus.
 */
export function BuretteScale({ level, liquid = "#e8f1fb", height = 260 }: { level: number; liquid?: string; height?: number }) {
  const span = 4; // cm3 shown in the window
  const top = level - span / 2;
  const pxPer = height / span;
  const y = (v: number) => (v - top) * pxPer;
  const ticks: number[] = [];
  for (let t = Math.ceil(top * 10) / 10; t <= top + span; t = Math.round((t + 0.1) * 10) / 10) if (t >= 0 && t <= 50) ticks.push(t);
  const my = y(level);
  return (
    <svg width={170} height={height} viewBox={`0 0 170 ${height}`} role="img" aria-label="Close-up of the burette scale. Read the bottom of the meniscus.">
      <rect x={50} y={0} width={50} height={height} fill="#fff" stroke="#334155" strokeWidth={2} />
      <path d={`M51 ${my - 8} Q75 ${my + 8} 99 ${my - 8} L99 ${height} L51 ${height} Z`} fill={liquid} stroke="#64748b" />
      {ticks.map((t) => {
        const major = Math.abs(t - Math.round(t)) < 1e-6;
        const half = !major && Math.abs(t * 2 - Math.round(t * 2)) < 1e-6;
        return (
          <g key={t}>
            <line x1={50} x2={50 + (major ? 26 : half ? 18 : 10)} y1={y(t)} y2={y(t)} stroke="#0f172a" strokeWidth={major ? 2 : 1} />
            {major && (
              <text x={44} y={y(t) + 5} textAnchor="end" fontSize={15} fontWeight={600} fill="#0f172a">
                {t}
              </text>
            )}
          </g>
        );
      })}
      <line x1={102} x2={140} y1={my} y2={my} stroke="#0072b2" strokeDasharray="4 3" />
      <text x={108} y={my - 6} fontSize={11} fill="#0072b2">
        eye level
      </text>
    </svg>
  );
}

export function Flask({ colour, label }: { colour: string; label: string }) {
  return (
    <svg width={120} height={130} viewBox="0 0 100 110" role="img" aria-label={`Conical flask; solution is ${label}`}>
      <path d="M40 5 h20 v30 l28 55 a6 6 0 0 1 -5 9 h-66 a6 6 0 0 1 -5 -9 l28 -55 z" fill="#fff" stroke="#334155" strokeWidth={2.5} />
      <path d="M22 68 h56 l10 22 a6 6 0 0 1 -5 9 h-66 a6 6 0 0 1 -5 -9 z" fill={colour} stroke="none" opacity={0.9} />
      <rect x={0} y={102} width={100} height={8} fill="#f8fafc" stroke="#cbd5e1" />
    </svg>
  );
}
