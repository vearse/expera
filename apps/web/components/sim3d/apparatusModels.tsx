"use client";

import { useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type ModelProps = { lit?: boolean };

const GLASS = "#e8f7ff";

function GlassMat({ opacity = 0.42, color = GLASS }: { opacity?: number; color?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      transparent
      opacity={opacity}
      roughness={0.06}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.04}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

function LiquidMat({ color = "#38bdf8", opacity = 0.82 }: { color?: string; opacity?: number }) {
  return <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.12} metalness={0.05} />;
}

function MetalMat({ color = "#cbd5e1" }: { color?: string }) {
  return <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />;
}

function WoodMat() {
  return <meshStandardMaterial color="#8b5e3c" roughness={0.72} metalness={0.02} />;
}

function Lathe({ profile, segments = 48 }: { profile: readonly [number, number][]; segments?: number }) {
  const points = useMemo(() => profile.map(([x, y]) => new THREE.Vector2(x, y)), [profile]);
  return <latheGeometry args={[points, segments]} />;
}

function TickMarks({
  count,
  start,
  gap,
  x = 0.045,
  z = 0.05,
  length = 0.055,
}: {
  count: number;
  start: number;
  gap: number;
  x?: number;
  z?: number;
  length?: number;
}) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[x, start + i * gap, z]}>
          <boxGeometry args={[length, 0.0035, 0.0035]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function SelectionRing({ radius = 0.28 }: { radius?: number }) {
  return (
    <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.035, 56]} />
      <meshBasicMaterial color="#0ea5e9" transparent opacity={0.9} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

const CONICAL_PROFILE: [number, number][] = [
  [0, 0],
  [0.25, 0],
  [0.25, 0.025],
  [0.225, 0.045],
  [0.06, 0.3],
  [0.06, 0.55],
];
const CONICAL_LIQUID: [number, number][] = [
  [0, 0.025],
  [0.215, 0.025],
  [0.09, 0.16],
  [0, 0.16],
];
const EVAP_PROFILE: [number, number][] = [
  [0, 0.025],
  [0.15, 0.025],
  [0.24, 0.075],
  [0.24, 0.095],
  [0.21, 0.098],
  [0.14, 0.055],
  [0, 0.055],
];
const SEPARATING_PROFILE: [number, number][] = [
  [0.028, 0.11],
  [0.032, 0.18],
  [0.14, 0.27],
  [0.195, 0.37],
  [0.185, 0.46],
  [0.095, 0.57],
  [0.055, 0.63],
  [0.055, 0.79],
];

export const APPARATUS_HEIGHTS: Record<string, number> = {
  beaker: 0.4,
  "conical-flask": 0.58,
  burette: 1.24,
  pipette: 1.02,
  "measuring-cylinder": 0.73,
  "test-tube": 0.4,
  "filter-funnel": 0.58,
  "bunsen-burner": 0.78,
  "evaporating-dish": 0.12,
  "separating-funnel": 0.84,
  "retort-stand": 1.12,
  "white-tile": 0.06,
  "wash-bottle": 0.6,
  condenser: 0.94,
  "distillation-flask": 0.74,
  "chromatography-paper": 0.56,
  thermometer: 0.64,
  spatula: 0.42,
  dropper: 0.36,
  "tripod-gauze": 0.34,
  vernier: 0.42,
  micrometer: 0.58,
  "metre-rule": 0.2,
  stopwatch: 0.3,
  density: 0.58,
  "parallax-scale": 0.72,
  "compound-microscope": 0.92,
  "glass-slide": 0.04,
  coverslip: 0.03,
  "petri-dish": 0.2,
  forceps: 0.32,
  "iodine-solution": 0.36,
  "specimen-jar": 0.56,
};

function Beaker(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.195, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.38, 48, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.018, 48]} />
        <GlassMat opacity={0.62} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.158, 0.158, 0.21, 48, 1, true]} />
        <LiquidMat color="#38bdf8" />
      </mesh>
      <mesh position={[0, 0.226, 0]}>
        <cylinderGeometry args={[0.158, 0.158, 0.006, 48]} />
        <LiquidMat color="#7dd3fc" opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.385, 0]}>
        <torusGeometry args={[0.17, 0.008, 8, 48]} />
        <GlassMat opacity={0.7} />
      </mesh>
      <TickMarks count={5} start={0.1} gap={0.06} z={0.172} />
      <mesh position={[-0.17, 0.37, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.05, 0.055, 0.012]} />
        <GlassMat opacity={0.62} />
      </mesh>
    </group>
  );
}

function ConicalFlask(_: ModelProps) {
  return (
    <group>
      <mesh>
        <Lathe profile={CONICAL_PROFILE} />
        <GlassMat />
      </mesh>
      <mesh>
        <Lathe profile={CONICAL_LIQUID} />
        <LiquidMat color="#fbbf24" opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.06, 0.008, 8, 40]} />
        <GlassMat opacity={0.72} />
      </mesh>
      <TickMarks count={4} start={0.33} gap={0.045} x={0.058} z={0.068} length={0.03} />
    </group>
  );
}

function Burette(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.06, 24, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 24, 1, true]} />
        <LiquidMat color="#60a5fa" opacity={0.78} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.006, 24]} />
        <LiquidMat color="#93c5fd" opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.16, 24]} />
        <GlassMat opacity={0.68} />
      </mesh>
      <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.12, 12]} />
        <MetalMat />
      </mesh>
      <mesh position={[0.22, 0.1, 0]}>
        <boxGeometry args={[0.018, 0.12, 0.055]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.012, 0.0035, 0.08, 16]} />
        <GlassMat opacity={0.75} />
      </mesh>
      <mesh position={[0, 1.205, 0]}>
        <torusGeometry args={[0.035, 0.008, 8, 24]} />
        <GlassMat opacity={0.7} />
      </mesh>
      <TickMarks count={12} start={0.2} gap={0.072} x={0.042} z={0.035} length={0.045} />
    </group>
  );
}

function Pipette(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.53, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.9, 20, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.56, 0]} scale={[1, 1.85, 1]}>
        <sphereGeometry args={[0.072, 28, 20]} />
        <GlassMat opacity={0.38} />
      </mesh>
      <mesh position={[0, 0.53, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.46, 20, 1, true]} />
        <LiquidMat color="#38bdf8" opacity={0.65} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <torusGeometry args={[0.018, 0.005, 8, 20]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.018, 0.1, 16]} />
        <GlassMat opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <torusGeometry args={[0.016, 0.006, 8, 20]} />
        <GlassMat opacity={0.7} />
      </mesh>
    </group>
  );
}

function MeasuringCylinder(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.014, 0]}>
        <cylinderGeometry args={[0.14, 0.15, 0.028, 40]} />
        <GlassMat opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.68, 40, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.3, 40, 1, true]} />
        <LiquidMat color="#22d3ee" opacity={0.76} />
      </mesh>
      <mesh position={[0, 0.341, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.006, 40]} />
        <LiquidMat color="#67e8f9" opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.705, 0]}>
        <torusGeometry args={[0.075, 0.007, 8, 40]} />
        <GlassMat opacity={0.7} />
      </mesh>
      <TickMarks count={8} start={0.07} gap={0.075} x={0.04} z={0.075} length={0.05} />
      <mesh position={[-0.075, 0.7, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.04, 0.06, 0.012]} />
        <GlassMat opacity={0.62} />
      </mesh>
    </group>
  );
}

function TestTube(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <capsuleGeometry args={[0.058, 0.27, 10, 28]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.051, 0.051, 0.16, 28, 1, true]} />
        <LiquidMat color="#a3e635" opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.055, 0]}>
        <sphereGeometry args={[0.051, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <LiquidMat color="#a3e635" opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.388, 0]}>
        <torusGeometry args={[0.058, 0.007, 8, 28]} />
        <GlassMat opacity={0.72} />
      </mesh>
    </group>
  );
}

function FilterFunnel(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.3, 20, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.26, 0.3, 44, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.405, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.23, 0.27, 40, 1, true]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.26, 0.009, 8, 48]} />
        <GlassMat opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.04, 0.035, 0.05, 20]} />
        <GlassMat opacity={0.6} />
      </mesh>
    </group>
  );
}

function Flame() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.scale.set(1 + Math.sin(t * 8.3) * 0.04, 1 + Math.sin(t * 11.7) * 0.07, 1 + Math.cos(t * 7.1) * 0.04);
  });
  return (
    <group ref={ref} position={[0, 0.46, 0]}>
      <mesh position={[0, 0.12, 0]}>
        <coneGeometry args={[0.065, 0.27, 20, 1, true]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <coneGeometry args={[0.032, 0.18, 18, 1, true]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#fbbf24" intensity={0.55} distance={1.6} decay={2} />
    </group>
  );
}

function BunsenBurner({ lit }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.028, 0]}>
        <cylinderGeometry args={[0.18, 0.19, 0.055, 32]} />
        <MetalMat color="#64748b" />
      </mesh>
      <mesh position={[-0.02, 0.26, 0]}>
        <cylinderGeometry args={[0.062, 0.068, 0.4, 28]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      <mesh position={[-0.02, 0.35, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.055, 28]} />
        <MetalMat color="#475569" />
      </mesh>
      <mesh position={[-0.02, 0.42, 0]}>
        <cylinderGeometry args={[0.055, 0.062, 0.05, 24]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
      <mesh position={[0.08, 0.08, 0.03]} rotation={[0.25, 0.3, 0.5]}>
        <cylinderGeometry args={[0.014, 0.014, 0.24, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {lit ? <Flame /> : null}
    </group>
  );
}

function EvaporatingDish(_: ModelProps) {
  return (
    <group>
      <mesh>
        <Lathe profile={EVAP_PROFILE} />
        <meshPhysicalMaterial color="#f1f5f9" roughness={0.35} metalness={0.05} clearcoat={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.077, 0]}>
        <cylinderGeometry args={[0.205, 0.205, 0.008, 40]} />
        <LiquidMat color="#fde68a" opacity={0.7} />
      </mesh>
    </group>
  );
}

function SeparatingFunnel(_: ModelProps) {
  return (
    <group>
      <mesh>
        <Lathe profile={SEPARATING_PROFILE} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.31, 0]} scale={[1, 0.72, 1]}>
        <sphereGeometry args={[0.16, 28, 20]} />
        <LiquidMat color="#38bdf8" opacity={0.68} />
      </mesh>
      <mesh position={[0, 0.43, 0]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[0.145, 28, 20]} />
        <LiquidMat color="#fbbf24" opacity={0.62} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 0.14, 20]} />
        <GlassMat opacity={0.7} />
      </mesh>
      <mesh position={[0.12, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.013, 0.013, 0.09, 12]} />
        <MetalMat />
      </mesh>
      <mesh position={[0.18, 0.08, 0]}>
        <boxGeometry args={[0.015, 0.1, 0.04]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.01, 0.003, 0.07, 16]} />
        <GlassMat opacity={0.74} />
      </mesh>
      <mesh position={[0, 0.79, 0]}>
        <cylinderGeometry args={[0.058, 0.05, 0.07, 24]} />
        <GlassMat opacity={0.6} />
      </mesh>
    </group>
  );
}

function RetortStand(_: ModelProps) {
  return (
    <group>
      <RoundedBox args={[0.46, 0.04, 0.3]} radius={0.018} smoothness={4} position={[0, 0.02, 0]}>
        <MetalMat color="#475569" />
      </RoundedBox>
      <mesh position={[-0.05, 0.58, 0]}>
        <cylinderGeometry args={[0.019, 0.019, 1.08, 20]} />
        <MetalMat />
      </mesh>
      <mesh position={[0.12, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.28, 16]} />
        <MetalMat />
      </mesh>
      <mesh position={[0.27, 0.82, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.09, 16]} />
        <MetalMat color="#64748b" />
      </mesh>
      <mesh position={[0.27, 0.86, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.011, 0.011, 0.16, 12]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      <mesh position={[-0.05, 0.76, 0]}>
        <sphereGeometry args={[0.038, 20, 16]} />
        <MetalMat color="#64748b" />
      </mesh>
    </group>
  );
}

function WhiteTile(_: ModelProps) {
  return (
    <RoundedBox args={[0.52, 0.032, 0.38]} radius={0.022} smoothness={4} position={[0, 0.016, 0]}>
      <meshPhysicalMaterial color="#f8fafc" roughness={0.28} metalness={0.02} clearcoat={0.8} />
    </RoundedBox>
  );
}

function WashBottle(_: ModelProps) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.39, 0),
        new THREE.Vector3(0.005, 0.51, 0),
        new THREE.Vector3(0.07, 0.57, 0),
        new THREE.Vector3(0.17, 0.57, 0),
        new THREE.Vector3(0.23, 0.5, 0),
      ]),
    [],
  );
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.14, 0.145, 0.36, 40]} />
        <GlassMat opacity={0.34} color="#f0f9ff" />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <sphereGeometry args={[0.12, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <GlassMat opacity={0.34} color="#f0f9ff" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.128, 0.132, 0.22, 40]} />
        <LiquidMat color="#38bdf8" opacity={0.56} />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.072, 0.075, 0.07, 32]} />
        <meshStandardMaterial color="#0f766e" roughness={0.5} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 32, 0.009, 8, false]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.22, 0.14]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.15, 0.09]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.22, 0.142]}>
        <planeGeometry args={[0.11, 0.015]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
    </group>
  );
}

function Condenser(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.092, 0.092, 0.86, 32, 1, true]} />
        <GlassMat opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.083, 0.083, 0.8, 32, 1, true]} />
        <LiquidMat color="#7dd3fc" opacity={0.18} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.94, 24, 1, true]} />
        <GlassMat opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.09, 0.075, 0.05, 32]} />
        <GlassMat opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.89, 0]}>
        <cylinderGeometry args={[0.075, 0.09, 0.05, 32]} />
        <GlassMat opacity={0.6} />
      </mesh>
      <mesh position={[0.14, 0.27, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.017, 0.017, 0.14, 16]} />
        <GlassMat opacity={0.6} />
      </mesh>
      <mesh position={[0.14, 0.69, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.017, 0.017, 0.14, 16]} />
        <GlassMat opacity={0.6} />
      </mesh>
    </group>
  );
}

function DistillationFlask(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.23, 0]}>
        <sphereGeometry args={[0.22, 40, 28]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.2, 0]} scale={[1, 0.62, 1]}>
        <sphereGeometry args={[0.196, 32, 24]} />
        <LiquidMat color="#c084fc" opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.28, 28, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0.15, 0.61, 0]} rotation={[0, 0, -Math.PI / 3.4]}>
        <cylinderGeometry args={[0.028, 0.028, 0.3, 20, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[0.052, 0.04, 0.05, 24]} />
        <GlassMat opacity={0.6} />
      </mesh>
    </group>
  );
}

function ChromatographyPaper(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.29, 0]}>
        <boxGeometry args={[0.26, 0.52, 0.006]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.39, 0.004]}>
        <boxGeometry args={[0.24, 0.006, 0.002]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.65} />
      </mesh>
      {[
        [0, 0.16, "#0ea5e9"],
        [0.02, 0.19, "#ec4899"],
        [0.01, 0.22, "#22c55e"],
      ].map(([x, y, color], i) => (
        <mesh key={i} position={[Number(x), Number(y), 0.005]}>
          <circleGeometry args={[0.018, 20]} />
          <meshBasicMaterial color={String(color)} />
        </mesh>
      ))}
      <mesh position={[0, 0.53, 0]}>
        <torusGeometry args={[0.012, 0.004, 8, 16]} />
        <MetalMat />
      </mesh>
    </group>
  );
}

function Thermometer(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.58, 20]} />
        <GlassMat opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <sphereGeometry args={[0.035, 24, 18]} />
        <meshStandardMaterial color="#dc2626" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.36, 12]} />
        <meshStandardMaterial color="#dc2626" roughness={0.25} />
      </mesh>
      <TickMarks count={10} start={0.12} gap={0.04} x={0.022} z={0.016} length={0.022} />
      <mesh position={[0, 0.62, 0]}>
        <torusGeometry args={[0.017, 0.006, 8, 20]} />
        <MetalMat />
      </mesh>
    </group>
  );
}

function Spatula(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.3, 16]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      <RoundedBox args={[0.1, 0.02, 0.03]} radius={0.006} smoothness={3} position={[0, 0.35, 0]}>
        <MetalMat color="#e2e8f0" />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.012, 0.022]} radius={0.004} smoothness={3} position={[0, 0.33, 0]}>
        <MetalMat color="#cbd5e1" />
      </RoundedBox>
    </group>
  );
}

function Dropper(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} scale={[1, 1.25, 1]}>
        <sphereGeometry args={[0.055, 24, 18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.25, 20, 1, true]} />
        <GlassMat />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.17, 16, 1, true]} />
        <LiquidMat color="#38bdf8" opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <sphereGeometry args={[0.02, 18, 14]} />
        <LiquidMat color="#38bdf8" opacity={0.8} />
      </mesh>
    </group>
  );
}

function TripodGauze(_: ModelProps) {
  const legs = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  return (
    <group>
      {legs.map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.13, 0.16, Math.sin(angle) * 0.13]}
          rotation={[Math.sin(angle) * 0.13, 0, -Math.cos(angle) * 0.13]}
        >
          <cylinderGeometry args={[0.012, 0.012, 0.32, 12]} />
          <MetalMat color="#64748b" />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.012, 10, 48]} />
        <MetalMat color="#64748b" />
      </mesh>
      <mesh position={[0, 0.322, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.19, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.55} roughness={0.45} side={THREE.DoubleSide} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, 0.318, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.19, 32, 4]} />
        <meshBasicMaterial color="#475569" wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function VernierCalipers(_: ModelProps) {
  return (
    <group rotation={[0, -0.12, 0]}>
      <RoundedBox args={[1.2, 0.05, 0.18]} radius={0.01} smoothness={3} position={[0, 0.08, 0]} castShadow>
        <MetalMat color="#94a3b8" />
      </RoundedBox>
      <mesh position={[-0.46, 0.17, 0]} castShadow>
        <boxGeometry args={[0.08, 0.16, 0.24]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
      <mesh position={[-0.46, 0.3, 0]} castShadow>
        <boxGeometry args={[0.22, 0.1, 0.08]} />
        <MetalMat color="#e2e8f0" />
      </mesh>
      <mesh position={[0.05, 0.17, 0]} castShadow>
        <boxGeometry args={[0.09, 0.14, 0.22]} />
        <MetalMat color="#38bdf8" />
      </mesh>
      <mesh position={[0.05, 0.28, 0]}>
        <boxGeometry args={[0.16, 0.09, 0.07]} />
        <MetalMat color="#bae6fd" />
      </mesh>
      <mesh position={[0, 0.106, 0.075]}>
        <boxGeometry args={[1.05, 0.004, 0.04]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {Array.from({ length: 21 }).map((_, index) => (
        <mesh key={index} position={[-0.5 + index * 0.05, 0.108, 0.1]}>
          <boxGeometry args={[index % 5 === 0 ? 0.008 : 0.004, index % 5 === 0 ? 0.012 : 0.007, 0.004]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      ))}
      <mesh position={[0.46, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.48, 12]} />
        <MetalMat color="#dbeafe" />
      </mesh>
    </group>
  );
}

function Micrometer(_: ModelProps) {
  return (
    <group rotation={[0, 0.1, 0]}>
      <mesh position={[-0.22, 0.22, 0]} castShadow>
        <boxGeometry args={[0.11, 0.42, 0.15]} />
        <MetalMat color="#64748b" />
      </mesh>
      <mesh position={[0.18, 0.22, 0]} castShadow>
        <boxGeometry args={[0.11, 0.42, 0.15]} />
        <MetalMat color="#64748b" />
      </mesh>
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[0.55, 0.07, 0.2]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      <mesh position={[-0.18, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.22, 18]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
      <mesh position={[0.13, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 0.34, 20]} />
        <MetalMat color="#e2e8f0" />
      </mesh>
      <mesh position={[0.33, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.15, 28]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0.43, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.08, 24]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
      <mesh position={[0.08, 0.475, 0]}>
        <boxGeometry args={[0.2, 0.004, 0.03]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

function MetreRule(_: ModelProps) {
  return (
    <group rotation={[0, 0.05, 0]}>
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.035, 0.2]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.6} />
      </mesh>
      {Array.from({ length: 28 }).map((_, index) => (
        <mesh key={index} position={[-0.85 + index * 0.063, 0.064, 0.025]}>
          <boxGeometry args={[index % 5 === 0 ? 0.007 : 0.004, index % 5 === 0 ? 0.02 : 0.012, 0.006]} />
          <meshBasicMaterial color="#78350f" />
        </mesh>
      ))}
    </group>
  );
}

function Stopwatch(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 40]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.42} metalness={0.28} />
      </mesh>
      <mesh position={[0, 0.136, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.235, 40]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.18, 0.142, -Math.sin(angle) * 0.18]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.01, 0.004, 0.04]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
        );
      })}
      <mesh position={[0.06, 0.15, -0.05]} rotation={[0, -0.55, 0]}>
        <boxGeometry args={[0.17, 0.006, 0.012]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.06, 14]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
      <mesh position={[0.3, 0.1, 0]} rotation={[0.2, 0, -0.25]} castShadow>
        <boxGeometry args={[0.12, 0.05, 0.12]} />
        <MetalMat color="#64748b" />
      </mesh>
    </group>
  );
}

function DigitalBalance(_: ModelProps) {
  return (
    <group>
      <RoundedBox args={[0.78, 0.18, 0.5]} radius={0.03} smoothness={3} position={[0, 0.11, 0]} castShadow>
        <meshStandardMaterial color="#334155" roughness={0.42} metalness={0.32} />
      </RoundedBox>
      <mesh position={[0, 0.235, -0.08]}>
        <boxGeometry args={[0.5, 0.09, 0.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.24, 0.023]}>
        <planeGeometry args={[0.4, 0.055]} />
        <meshBasicMaterial color="#67e8f9" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.38, -0.02]} castShadow>
        <cylinderGeometry args={[0.23, 0.23, 0.025, 32]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 0.36, -0.02]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.55} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.03, 0.2]}>
          <boxGeometry args={[0.08, 0.04, 0.03]} />
          <MetalMat color="#94a3b8" />
        </mesh>
      ))}
    </group>
  );
}

function ParallaxScale(_: ModelProps) {
  return (
    <group rotation={[0, -0.08, 0]}>
      <RoundedBox args={[0.42, 0.035, 0.28]} radius={0.012} smoothness={3} position={[0, 0.02, 0]} castShadow>
        <MetalMat color="#64748b" />
      </RoundedBox>
      <mesh position={[0, 0.34, -0.02]} castShadow>
        <boxGeometry args={[0.82, 0.6, 0.04]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      {Array.from({ length: 9 }).map((_, index) => (
        <mesh key={index} position={[-0.28 + index * 0.07, 0.37, 0.005]}>
          <boxGeometry args={[0.006, index % 2 === 0 ? 0.2 : 0.12, 0.005]} />
          <meshBasicMaterial color="#1e3a8a" />
        </mesh>
      ))}
      <mesh position={[0.03, 0.4, 0.03]}>
        <boxGeometry args={[0.008, 0.34, 0.008]} />
        <MetalMat color="#0f172a" />
      </mesh>
      <mesh position={[0.03, 0.58, 0.03]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
}

function CompoundMicroscope(_: ModelProps) {
  return (
    <group>
      <RoundedBox args={[0.48, 0.08, 0.34]} radius={0.03} smoothness={4} position={[0, 0.05, 0]} castShadow>
        <meshStandardMaterial color="#475569" roughness={0.45} metalness={0.28} />
      </RoundedBox>
      <mesh position={[-0.04, 0.13, -0.08]} rotation={[0, 0, 0.14]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.08]} />
        <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[-0.08, 0.48, -0.06]} rotation={[0, 0, 0.16]} castShadow>
        <boxGeometry args={[0.12, 0.62, 0.1]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.42} metalness={0.32} />
      </mesh>
      <RoundedBox args={[0.34, 0.035, 0.26]} radius={0.01} smoothness={3} position={[0.04, 0.31, 0.03]} castShadow>
        <meshStandardMaterial color="#334155" roughness={0.42} metalness={0.35} />
      </RoundedBox>
      <mesh position={[0.08, 0.42, 0.02]} rotation={[0.08, 0, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.035, 0.28, 20]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.32} metalness={0.42} />
      </mesh>
      <mesh position={[0.11, 0.58, -0.01]} rotation={[0.12, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.24, 18]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0.16, 0.72, -0.03]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.04, 0.12, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.45} />
      </mesh>
      <mesh position={[0.08, 0.27, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.05, 24]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      {[-0.045, 0, 0.045].map((x, index) => (
        <mesh key={x} position={[0.08 + x, 0.22 - index * 0.012, 0.03]} rotation={[index === 1 ? 0 : index === 0 ? 0.18 : -0.18, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.014, 0.1, 14]} />
          <MetalMat color="#cbd5e1" />
        </mesh>
      ))}
      <mesh position={[0.31, 0.07, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.06, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[0.3, 0.105, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.035, 24]} />
        <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
      </mesh>
      <mesh position={[-0.03, 0.31, 0.16]}>
        <boxGeometry args={[0.26, 0.02, 0.08]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      <mesh position={[-0.03, 0.35, 0.16]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 12]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
    </group>
  );
}

function GlassSlide(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.012, 0]} castShadow>
        <boxGeometry args={[0.62, 0.018, 0.22]} />
        <GlassMat opacity={0.5} color="#f0f9ff" />
      </mesh>
      <mesh position={[0, 0.022, 0]}>
        <boxGeometry args={[0.2, 0.004, 0.11]} />
        <meshStandardMaterial color="#bef264" transparent opacity={0.72} roughness={0.5} />
      </mesh>
      <mesh position={[0.02, 0.026, 0]}>
        <boxGeometry args={[0.24, 0.003, 0.14]} />
        <GlassMat opacity={0.36} />
      </mesh>
    </group>
  );
}

function Coverslip(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.012, 0]} castShadow>
        <boxGeometry args={[0.26, 0.008, 0.26]} />
        <GlassMat opacity={0.38} color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 28]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.42} roughness={0.3} />
      </mesh>
    </group>
  );
}

function PetriDish(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 40, 1, true]} />
        <GlassMat opacity={0.3} color="#f0f9ff" />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.025, 40]} />
        <meshStandardMaterial color="#fde68a" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.045, 40, 1, true]} />
        <GlassMat opacity={0.28} color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.155, 0]}>
        <torusGeometry args={[0.31, 0.008, 8, 40]} />
        <GlassMat opacity={0.5} />
      </mesh>
    </group>
  );
}

function Forceps(_: ModelProps) {
  return (
    <group rotation={[0, 0, 0.05]}>
      <mesh position={[-0.025, 0.16, 0]} rotation={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[0.022, 0.3, 0.035]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
      <mesh position={[0.025, 0.16, 0]} rotation={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[0.022, 0.3, 0.035]} />
        <MetalMat color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.06, 0.03, 0.035]} />
        <MetalMat color="#94a3b8" />
      </mesh>
      <mesh position={[-0.18, 0.26, 0]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[0.022, 0.18, 0.035]} />
        <MetalMat color="#e2e8f0" />
      </mesh>
      <mesh position={[0.18, 0.26, 0]} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[0.022, 0.18, 0.035]} />
        <MetalMat color="#e2e8f0" />
      </mesh>
    </group>
  );
}

function IodineSolution(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.13, 0.145, 0.28, 36]} />
        <GlassMat opacity={0.34} color="#fef3c7" />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.118, 0.132, 0.21, 36]} />
        <LiquidMat color="#7c2d12" opacity={0.84} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.08, 24]} />
        <meshStandardMaterial color="#292524" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.375, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.035, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.16, 0.137]}>
        <planeGeometry args={[0.18, 0.11]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.18, 0.139]}>
        <planeGeometry args={[0.13, 0.012]} />
        <meshBasicMaterial color="#92400e" />
      </mesh>
      <mesh position={[0, 0.15, 0.139]}>
        <planeGeometry args={[0.13, 0.008]} />
        <meshBasicMaterial color="#92400e" />
      </mesh>
    </group>
  );
}

function SpecimenJar(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.44, 36, 1, true]} />
        <GlassMat opacity={0.28} color="#e0f2fe" />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.195, 0.195, 0.26, 36]} />
        <LiquidMat color="#a5f3fc" opacity={0.42} />
      </mesh>
      <mesh position={[0.01, 0.18, 0]} scale={[1.2, 1, 0.8]}>
        <sphereGeometry args={[0.1, 24, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.62} />
      </mesh>
      <mesh position={[0.08, 0.22, 0.02]}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 10]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.225, 0.225, 0.06, 36]} />
        <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.24, 0.212]}>
        <planeGeometry args={[0.18, 0.1]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.76} />
      </mesh>
    </group>
  );
}

function Fallback(_: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.28, 0.4, 0.28]} />
        <GlassMat opacity={0.5} />
      </mesh>
    </group>
  );
}

const MODELS: Record<string, (props: ModelProps) => React.ReactElement> = {
  beaker: Beaker,
  "conical-flask": ConicalFlask,
  burette: Burette,
  pipette: Pipette,
  "measuring-cylinder": MeasuringCylinder,
  "test-tube": TestTube,
  "filter-funnel": FilterFunnel,
  "bunsen-burner": BunsenBurner,
  "evaporating-dish": EvaporatingDish,
  "separating-funnel": SeparatingFunnel,
  "retort-stand": RetortStand,
  "white-tile": WhiteTile,
  "wash-bottle": WashBottle,
  condenser: Condenser,
  "distillation-flask": DistillationFlask,
  "chromatography-paper": ChromatographyPaper,
  thermometer: Thermometer,
  spatula: Spatula,
  dropper: Dropper,
  "tripod-gauze": TripodGauze,
  vernier: VernierCalipers,
  micrometer: Micrometer,
  "metre-rule": MetreRule,
  stopwatch: Stopwatch,
  density: DigitalBalance,
  "parallax-scale": ParallaxScale,
  "compound-microscope": CompoundMicroscope,
  "glass-slide": GlassSlide,
  coverslip: Coverslip,
  "petri-dish": PetriDish,
  forceps: Forceps,
  "iodine-solution": IodineSolution,
  "specimen-jar": SpecimenJar,
};

export function ApparatusModel({ id, active = false, lit = false }: { id: string; active?: boolean; lit?: boolean }) {
  const Model = MODELS[id] ?? Fallback;
  return (
    <group>
      {active ? <SelectionRing radius={id === "retort-stand" || id === "tripod-gauze" ? 0.33 : 0.27} /> : null}
      <Model lit={lit} />
    </group>
  );
}

export function getApparatusHeight(id: string) {
  return APPARATUS_HEIGHTS[id] ?? 0.5;
}
