/** SVG Bohr model from proton, neutron and electron counts or from element shells. */
export function Bohr2D({
  protons,
  neutrons,
  shells,
  size = 320,
  label,
}: {
  protons: number;
  neutrons: number;
  shells: number[];
  size?: number;
  label?: string;
}) {
  const c = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm" role="img" aria-label={label ?? `Atom: ${protons} protons, ${neutrons} neutrons, shells ${shells.join(", ")}`}>
      {shells.map((count, i) => {
        const r = 52 + i * 34;
        return (
          <g key={i}>
            <circle cx={c} cy={c} r={r} fill="none" stroke="#94a3b8" />
            {Array.from({ length: count }, (_, j) => {
              const a = (2 * Math.PI * j) / count - Math.PI / 2;
              return <circle key={j} cx={c + r * Math.cos(a)} cy={c + r * Math.sin(a)} r={6} fill="#0072b2" />;
            })}
          </g>
        );
      })}
      <circle cx={c} cy={c} r={34} fill="#fde8d7" stroke="#d55e00" />
      <text x={c} y={c - 4} textAnchor="middle" fontSize={13} fontWeight={700}>
        {protons}p
      </text>
      <text x={c} y={c + 14} textAnchor="middle" fontSize={13}>
        {neutrons}n
      </text>
    </svg>
  );
}

export function neutronsFromElement(atomicNumber: number, massIupac: number): number {
  return Math.max(0, Math.round(massIupac) - atomicNumber);
}
