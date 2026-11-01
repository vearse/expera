"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import { prefersReducedMotion } from "@/lib/device";

function Electron({ radius, speed, phase, tilt }: { radius: number; speed: number; phase: number; tilt: number }) {
  const ref = useRef<Mesh>(null);
  const still = prefersReducedMotion();
  useFrame((_, dt) => {
    if (!ref.current || still) return;
    const t = performance.now() * 0.001 * speed + phase;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * Math.cos(tilt);
    ref.current.position.z = Math.sin(t) * radius * Math.sin(tilt);
  });
  if (still) {
    const a = phase;
    return (
      <mesh position={[Math.cos(a) * radius, Math.sin(a) * radius * Math.cos(tilt), Math.sin(a) * radius * Math.sin(tilt)]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#0072b2" />
      </mesh>
    );
  }
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 12, 12]} />
      <meshStandardMaterial color="#0072b2" />
    </mesh>
  );
}

function ShellRing({ radius, count, tilt, speed }: { radius: number; count: number; tilt: number; speed: number }) {
  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.02, 8, 48]} />
        <meshStandardMaterial color="#94a3b8" opacity={0.5} transparent />
      </mesh>
      {Array.from({ length: count }, (_, i) => (
        <Electron key={i} radius={radius} speed={speed} phase={(i / count) * Math.PI * 2} tilt={tilt} />
      ))}
    </group>
  );
}

function Nucleus({ protons, neutrons }: { protons: number; neutrons: number }) {
  const total = protons + neutrons;
  const show = Math.min(40, total);
  const pRatio = protons / total;
  return (
    <group>
      {Array.from({ length: show }, (_, i) => {
        const a = (i / show) * Math.PI * 2;
        const r = 0.15 + (i % 5) * 0.04;
        const isP = i / show < pRatio;
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, (i % 3) * 0.05]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={isP ? "#d55e00" : "#999999"} />
          </mesh>
        );
      })}
      {total > 40 && (
        <mesh position={[0, 0, 0.3]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      )}
    </group>
  );
}

export default function Atom3D({
  protons,
  neutrons,
  shells,
  name,
}: {
  protons: number;
  neutrons: number;
  shells: number[];
  name: string;
}) {
  const alt = `${name}: ${protons} protons, ${neutrons} neutrons, electron shells ${shells.join(", ")}`;
  return (
    <div className="h-72 w-full max-w-md rounded-xl border bg-slate-900" aria-label={alt}>
      <p className="sr-only">{alt}</p>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]} frameloop="always">
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={0.9} />
        <Nucleus protons={protons} neutrons={neutrons} />
        {shells.map((count, i) => (
          <ShellRing key={i} radius={0.55 + i * 0.35} count={count} tilt={0.3 + i * 0.2} speed={1.2 - i * 0.1} />
        ))}
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
