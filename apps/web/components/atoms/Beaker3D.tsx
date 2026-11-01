"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DoubleSide } from "three";

export default function Beaker3D({ liquidColour, label }: { liquidColour: string; label: string }) {
  return (
    <div className="h-48 w-full max-w-xs rounded-xl border bg-slate-900" aria-label={label}>
      <p className="sr-only">{label}</p>
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.6, 0.5, 1.2, 32, 1, true]} />
          <meshStandardMaterial color="#e2e8f0" side={DoubleSide} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.5, 32]} />
          <meshStandardMaterial color={liquidColour} transparent opacity={0.85} />
        </mesh>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
