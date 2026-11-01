import type { Molecule } from "@/lib/content/schemas";

/** Colour-blind-safe atom colours; every atom is also labelled with its symbol. */
export const ATOM_COLOURS: Record<string, string> = { H: "#f1f5f9", C: "#3f3f46", N: "#0072b2", O: "#d55e00", Cl: "#009e73" };

/** 2D fallback: projection of the 3D coordinates onto the x–y plane. */
export function Molecule2D({ m }: { m: Molecule }) {
  const s = 80;
  const c = 150;
  const p = (a: { x: number; y: number; z: number }) => ({ x: c + (a.x + a.z * 0.35) * s, y: c - (a.y - a.z * 0.2) * s });
  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-sm rounded-xl border bg-white" role="img" aria-label={`${m.name}: ${m.shape}, bond angle ${m.bondAngle}`}>
      {m.bonds.map(([i, j, order], k) => {
        const a = p(m.atoms[i]);
        const b = p(m.atoms[j]);
        const dx = b.y - a.y;
        const dy = a.x - b.x;
        const len = Math.hypot(dx, dy) || 1;
        return Array.from({ length: order }, (_, o) => {
          const off = (o - (order - 1) / 2) * 7;
          return <line key={`${k}-${o}`} x1={a.x + (dx / len) * off} y1={a.y + (dy / len) * off} x2={b.x + (dx / len) * off} y2={b.y + (dy / len) * off} stroke="#334155" strokeWidth={4} />;
        });
      })}
      {m.atoms.map((a, i) => {
        const q = p(a);
        const dark = a.el === "C" || a.el === "N";
        return (
          <g key={i}>
            <circle cx={q.x} cy={q.y} r={a.el === "H" ? 18 : 26} fill={ATOM_COLOURS[a.el] ?? "#a1a1aa"} stroke="#334155" strokeWidth={2} />
            <text x={q.x} y={q.y + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill={dark ? "#fff" : "#0f172a"}>
              {a.el}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
