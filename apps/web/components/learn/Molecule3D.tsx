"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Quaternion, Vector3 } from "three";
import type { Molecule } from "@/lib/content/schemas";
import { ATOM_COLOURS } from "./Molecule2D";

function Bond({ from, to, offset }: { from: Vector3; to: Vector3; offset: Vector3 }) {
  const a = from.clone().add(offset);
  const b = to.clone().add(offset);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.06, 0.06, dir.length(), 12]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
  );
}

export default function Molecule3D({ m }: { m: Molecule }) {
  const pos = m.atoms.map((a) => new Vector3(a.x, a.y, a.z));
  return (
    <div className="h-80 w-full max-w-md rounded-xl border bg-white" role="img" aria-label={`3D model of ${m.name}. Drag to rotate, scroll or pinch to zoom.`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 5]} intensity={0.9} />
        {m.bonds.flatMap(([i, j, order], k) => {
          const dir = pos[j].clone().sub(pos[i]);
          const perp = new Vector3(0, 0, 1).cross(dir).normalize();
          if (perp.length() === 0) perp.set(0, 1, 0);
          return Array.from({ length: order }, (_, o) => <Bond key={`${k}-${o}`} from={pos[i]} to={pos[j]} offset={perp.clone().multiplyScalar((o - (order - 1) / 2) * 0.16)} />);
        })}
        {m.atoms.map((a, i) => (
          <mesh key={i} position={pos[i]}>
            <sphereGeometry args={[a.el === "H" ? 0.22 : 0.34, 24, 24]} />
            <meshStandardMaterial color={ATOM_COLOURS[a.el] ?? "#a1a1aa"} />
            <Html center distanceFactor={6} style={{ pointerEvents: "none", fontWeight: 700, color: a.el === "C" || a.el === "N" ? "#fff" : "#0f172a" }}>
              {a.el}
            </Html>
          </mesh>
        ))}
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
