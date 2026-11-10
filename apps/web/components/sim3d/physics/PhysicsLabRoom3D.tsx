"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { PhysicsStationId } from "@/lib/content/physics";
import { detectWebGL, prefersReducedMotion } from "@/lib/device";
import { ChemistryLabRoom, RoomLabel, STANDARD_LAB_ROOM, STANDARD_TEACHER, type LabRoomConfig } from "@/components/sim3d/ChemistryLabRoom";
import type { PhysicsRoomProps } from "@/components/physics/lab/PhysicsLabRoom";
import { LabMenu } from "@/components/lab/LabMenu";
import { useLabReadySignal } from "@/components/lab/LabExperience";

const STATION_X: Record<PhysicsStationId, number> = {
  vernier: -4.45,
  micrometer: -2.67,
  "metre-rule": -0.89,
  stopwatch: 0.89,
  parallax: 2.67,
  density: 4.45,
};

type ViewPreset = "room" | "instruments" | "density";

function Metal({ color, metalness = 0.7, roughness = 0.28 }: { color: string; metalness?: number; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />;
}

function Tick({ position, width = 0.006, height = 0.004, colour = "#e2e8f0" }: { position: [number, number, number]; width?: number; height?: number; colour?: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, 0.005]} />
      <meshBasicMaterial color={colour} toneMapped={false} />
    </mesh>
  );
}

function VernierModel({ jawGapMm }: { jawGapMm: number }) {
  const slider = 0.06 + (Math.min(jawGapMm, 40) / 40) * 0.72;
  return (
    <group rotation={[0, -0.08, 0]}>
      <RoundedBox args={[1.42, 0.05, 0.2]} radius={0.012} smoothness={3} position={[0, 0.06, 0]} castShadow>
        <Metal color="#94a3b8" metalness={0.82} roughness={0.2} />
      </RoundedBox>
      <mesh position={[-0.51, 0.15, 0]} castShadow>
        <boxGeometry args={[0.09, 0.18, 0.28]} />
        <Metal color="#cbd5e1" metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[-0.51, 0.28, 0]} castShadow>
        <boxGeometry args={[0.24, 0.11, 0.09]} />
        <Metal color="#e2e8f0" metalness={0.75} roughness={0.24} />
      </mesh>
      <group position={[slider, 0.13, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.12, 0.25]} />
          <Metal color="#38bdf8" metalness={0.62} roughness={0.27} />
        </mesh>
        <mesh position={[-0.08, 0.15, 0]}>
          <boxGeometry args={[0.17, 0.09, 0.08]} />
          <Metal color="#bae6fd" metalness={0.7} roughness={0.24} />
        </mesh>
      </group>
      <mesh position={[0, 0.092, 0.08]}>
        <boxGeometry args={[1.22, 0.003, 0.045]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.55} />
      </mesh>
      {Array.from({ length: 24 }).map((_, index) => (
        <Tick key={index} position={[-0.58 + index * 0.052, 0.095, 0.105]} width={index % 5 === 0 ? 0.008 : 0.004} height={index % 5 === 0 ? 0.012 : 0.007} colour="#334155" />
      ))}
      <mesh position={[0.34, 0.16, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.33, 18]} />
        <Metal color="#dbeafe" metalness={0.45} roughness={0.38} />
      </mesh>
      <mesh position={[-0.51, 0.34, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.08]} />
        <Metal color="#0f172a" metalness={0.5} roughness={0.32} />
      </mesh>
    </group>
  );
}

function MicrometerModel({ correctedMm, thimble }: { correctedMm: number; thimble: number }) {
  return (
    <group rotation={[0, 0.08, 0]}>
      <mesh position={[-0.27, 0.2, 0]} castShadow>
        <boxGeometry args={[0.14, 0.42, 0.15]} />
        <Metal color="#64748b" metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[0.27, 0.2, 0]} castShadow>
        <boxGeometry args={[0.14, 0.42, 0.15]} />
        <Metal color="#64748b" metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[0.68, 0.1, 0.2]} />
        <Metal color="#94a3b8" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[-0.27, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.2, 18]} />
        <Metal color="#cbd5e1" metalness={0.82} roughness={0.2} />
      </mesh>
      <mesh position={[0.14, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.038, 0.038, 0.3, 20]} />
        <Metal color="#e2e8f0" metalness={0.78} roughness={0.2} />
      </mesh>
      <mesh position={[0.35, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 28]} />
        <meshStandardMaterial color="#1e293b" roughness={0.38} metalness={0.45} />
      </mesh>
      <group position={[0.43, 0.35, 0]} rotation={[thimble / 50 * Math.PI * 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.074, 0.009, 8, 28]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0.12, 0.47, 0]}>
        <boxGeometry args={[0.23, 0.005, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      <RoomLabel text={`${correctedMm.toFixed(2)} mm`} position={[0.04, 0.64, 0.02]} height={0.09} />
    </group>
  );
}

function MetreRuleModel({ startCm, endCm }: { startCm: number; endCm: number }) {
  return (
    <group rotation={[0, 0, 0]}>
      <mesh position={[0, 0.055, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.02, 0.05, 0.25]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.58} metalness={0.05} />
      </mesh>
      {Array.from({ length: 32 }).map((_, index) => (
        <Tick key={index} position={[-0.96 + index * 0.062, 0.082, 0.03]} width={index % 5 === 0 ? 0.007 : 0.004} height={index % 5 === 0 ? 0.02 : 0.012} colour="#78350f" />
      ))}
      {[startCm, endCm].map((mark, index) => (
        <mesh key={index} position={[-0.96 + (mark / 30) * 1.9, 0.1, 0.09]}>
          <boxGeometry args={[0.012, 0.08, 0.07]} />
          <meshBasicMaterial color={index === 0 ? "#f97316" : "#34d399"} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.14, -0.02]} rotation={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.55, 12]} />
        <Metal color="#b45309" metalness={0.7} roughness={0.3} />
      </mesh>
      <RoomLabel text={`${Math.max(0, endCm - startCm).toFixed(1)} cm`} position={[0.62, 0.32, 0]} height={0.085} />
    </group>
  );
}

function StopwatchModel({ seconds }: { seconds: number }) {
  const angle = (seconds % 60) / 60 * Math.PI * 2;
  return (
    <group>
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 40]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.44} metalness={0.32} />
      </mesh>
      <mesh position={[0, 0.156, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 40]} />
        <meshStandardMaterial color="#0f172a" roughness={0.48} />
      </mesh>
      {Array.from({ length: 12 }).map((_, index) => {
        const a = (index / 12) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(a) * 0.23, 0.163, -Math.sin(a) * 0.23]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.012, 0.004, 0.05]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
        );
      })}
      <mesh position={[Math.cos(angle) * 0.11, 0.17, -Math.sin(angle) * 0.11]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[0.22, 0.008, 0.012]} />
        <meshBasicMaterial color="#fbbf24" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.06, 16]} />
        <Metal color="#cbd5e1" metalness={0.82} roughness={0.2} />
      </mesh>
      <mesh position={[0.38, 0.13, 0]} rotation={[0.2, 0, -0.25]} castShadow>
        <boxGeometry args={[0.15, 0.05, 0.15]} />
        <Metal color="#64748b" metalness={0.45} roughness={0.38} />
      </mesh>
      <RoomLabel text={`${seconds.toFixed(2)} s`} position={[0.34, 0.34, 0.03]} height={0.085} />
    </group>
  );
}

function ParallaxModel({ eyeOffsetMm, aligned, observedMm }: { eyeOffsetMm: number; aligned: boolean; observedMm: number }) {
  const eyeX = Math.max(-0.9, Math.min(0.9, eyeOffsetMm * 0.06));
  return (
    <group rotation={[0, -0.1, 0]}>
      <mesh position={[0, 0.18, -0.03]} rotation={[-0.14, 0, 0]} castShadow>
        <boxGeometry args={[1.3, 0.7, 0.06]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.62} />
      </mesh>
      {Array.from({ length: 13 }).map((_, index) => (
        <Tick key={index} position={[-0.54 + index * 0.09, 0.25 - index * 0.003, 0.015]} width={0.006} height={index % 2 === 0 ? 0.25 : 0.16} colour="#1e3a8a" />
      ))}
      <mesh position={[0.08, 0.23, 0.09]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.38, 10]} />
        <Metal color="#0f172a" metalness={0.75} roughness={0.22} />
      </mesh>
      <mesh position={[0.08, 0.42, 0.09]}>
        <sphereGeometry args={[0.035, 18, 12]} />
        <meshBasicMaterial color={aligned ? "#22d3ee" : "#f59e0b"} toneMapped={false} />
      </mesh>
      <group position={[eyeX, 0.46, 0.48]}>
        <mesh>
          <sphereGeometry args={[0.08, 20, 14]} />
          <meshStandardMaterial color="#fde68a" roughness={0.45} />
        </mesh>
        <mesh position={[0, -0.01, 0.072]}>
          <circleGeometry args={[0.025, 18]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.04, -0.28, -0.16]} rotation={[0.48, 0, 0.04]}>
          <boxGeometry args={[0.008, 0.5, 0.008]} />
          <meshBasicMaterial color={aligned ? "#22d3ee" : "#f59e0b"} toneMapped={false} />
        </mesh>
      </group>
      <RoomLabel text={aligned ? "eye aligned" : `${observedMm.toFixed(1)} mm`} position={[0.38, 0.74, 0]} height={0.085} />
    </group>
  );
}

function BalanceModel({ massG }: { massG: number }) {
  return (
    <group position={[-0.2, 0, 0]}>
      <RoundedBox args={[0.84, 0.2, 0.52]} radius={0.03} smoothness={3} position={[0, 0.14, 0]} castShadow>
        <meshStandardMaterial color="#334155" roughness={0.42} metalness={0.42} />
      </RoundedBox>
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.54, 0.12, 0.34]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.27, 0.176]}>
        <planeGeometry args={[0.45, 0.08]} />
        <meshBasicMaterial color={massG > 0 ? "#67e8f9" : "#1e293b"} toneMapped={false} />
      </mesh>
      <RoomLabel text={massG > 0 ? `${massG.toFixed(1)} g` : "0.0 g"} position={[0, 0.37, 0.18]} height={0.05} />
      <mesh position={[0, 0.42, -0.02]} castShadow>
        <cylinderGeometry args={[0.23, 0.23, 0.03, 30]} />
        <Metal color="#cbd5e1" metalness={0.72} roughness={0.24} />
      </mesh>
    </group>
  );
}

function CylinderModel({ volumeMl }: { volumeMl: number }) {
  const fill = Math.min(1, volumeMl / 100);
  return (
    <group position={[0.65, 0, 0]}>
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.62, 28, 1, true]} />
        <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.3} roughness={0.08} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.14 + fill * 0.27, 0]}>
        <cylinderGeometry args={[0.145, 0.157, Math.max(0.01, fill * 0.48), 28]} />
        <meshPhysicalMaterial color="#67e8f9" transparent opacity={0.72} roughness={0.12} />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <torusGeometry args={[0.16, 0.014, 8, 28]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.24} />
      </mesh>
      <mesh position={[0.14, 0.43, 0]}>
        <boxGeometry args={[0.02, 0.55, 0.06]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <RoomLabel text={volumeMl > 0 ? `${volumeMl.toFixed(0)} cm3` : "empty"} position={[0.27, 0.54, 0]} height={0.055} />
    </group>
  );
}

function DensityModel({ massG, volumeMl }: { massG: number; volumeMl: number }) {
  return (
    <group scale={0.9}>
      <BalanceModel massG={massG} />
      <CylinderModel volumeMl={volumeMl} />
    </group>
  );
}

function Station({ id, active, complete, onSelect, children }: { id: PhysicsStationId; active: boolean; complete: boolean; onSelect: (id: PhysicsStationId) => void; children: React.ReactNode }) {
  return (
    <group
      position={[STATION_X[id], 1.06, 0.08]}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={() => {
        if (typeof document !== "undefined") document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (typeof document !== "undefined") document.body.style.cursor = "";
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0.06]}>
        <ringGeometry args={[0.48, 0.56, 40]} />
        <meshBasicMaterial color={active ? "#0284c7" : complete ? "#059669" : "#94a3b8"} transparent opacity={active ? 0.95 : 0.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.46, 32]} />
        <meshStandardMaterial color={active ? "#e0f2fe" : "#f1f5f9"} roughness={0.5} metalness={0.08} transparent opacity={0.94} />
      </mesh>
      {children}
      <RoomLabel text={id.replace(/-/g, " ")} position={[0, -0.34, 0.67]} height={0.07} opacity={active ? 1 : 0.7} />
      {complete ? (
        <mesh position={[0.4, 0.06, 0.24]}>
          <sphereGeometry args={[0.045, 16, 12]} />
          <meshBasicMaterial color="#059669" toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function Bench() {
  return (
    <group position={[0, 0, 0.15]}>
      <RoundedBox args={[11.4, 0.16, 2.25]} radius={0.04} smoothness={4} position={[0, 1, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#b8d8e4" roughness={0.32} metalness={0.06} clearcoat={0.35} />
      </RoundedBox>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.9, 0.82, 1.85]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.09, 1.1]} castShadow>
        <boxGeometry args={[10.9, 0.08, 0.08]} />
        <meshStandardMaterial color="#0e7490" roughness={0.4} metalness={0.24} />
      </mesh>
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <group key={x} position={[x, 0.59, 0.93]}>
          <mesh>
            <boxGeometry args={[1.5, 0.06, 0.04]} />
            <meshStandardMaterial color="#0891b2" opacity={0.55} transparent />
          </mesh>
          <mesh position={[0.45, 0, 0.015]}>
            <boxGeometry args={[0.24, 0.024, 0.02]} />
            <Metal color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.5, 0.08, 1.5]} />
        <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.18} />
      </mesh>
    </group>
  );
}

const PHYSICS_ROOM: LabRoomConfig = {
  ...STANDARD_LAB_ROOM,
  showShelves: false,
  showWorkBench: false,
  showSideBench: false,
  showStools: false,
  subjectLabel: "EXPERA PHYSICS LABORATORY",
  wallChart: "measurement",
  notice: {
    eyebrow: "Practical notice",
    title: "Measurement laboratory",
    subtitle: "Read the scale. Correct the error. Record the evidence.",
    lines: [
      "Click an instrument station to open its guide.",
      "Check the zero before taking a reading.",
      "Keep your eye level with the scale.",
      "Repeat readings to reduce random error.",
    ],
    footer: "Ask Mr. Bello if you are unsure.",
  },
  teacher: {
    ...STANDARD_TEACHER,
    name: "Mr. Bello",
    message: "Choose an instrument station, then read its guide below the room.",
  },
};

function CameraRig({ preset, focusId }: { preset: ViewPreset; focusId: PhysicsStationId | null }) {
  const { camera, size } = useThree();
  const controls = useThree((state) => state.controls) as { target: THREE.Vector3; update: () => void } | null;
  const desired = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; zoom: number } | null>(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    desired.current = null;
    const cameraBase = Math.min(76, Math.max(26, size.width / 13.2));
    const target = preset === "density" ? new THREE.Vector3(3.9, 1.05, 0.05) : preset === "instruments" ? new THREE.Vector3(-1.6, 1.12, 0.1) : new THREE.Vector3(0, 1.0, -0.25);
    const zoom = preset === "density" ? cameraBase * 1.55 : preset === "instruments" ? cameraBase * 1.42 : cameraBase;
    camera.position.set(8, 7.2, 8);
    camera.lookAt(target);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
    if (controls) {
      controls.target.copy(target);
      controls.update();
    }
  }, [camera, controls, preset, size.width]);

  useEffect(() => {
    if (!focusId) return;
    const cameraBase = Math.min(76, Math.max(26, size.width / 13.2));
    const target = new THREE.Vector3(STATION_X[focusId], 1.12, 0.06);
    desired.current = {
      pos: target.clone().add(new THREE.Vector3(6.4, 5.4, 6.4)),
      target,
      zoom: Math.min(150, Math.max(70, cameraBase * 2.3)),
    };
  }, [focusId, size.width]);

  useFrame((_, delta) => {
    const next = desired.current;
    if (!next) return;
    const t = reduced ? 1 : 1 - Math.pow(0.001, Math.min(delta, 0.08));
    camera.position.lerp(next.pos, t);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom += (next.zoom - camera.zoom) * t;
      camera.updateProjectionMatrix();
    }
    if (controls) {
      controls.target.lerp(next.target, t);
      controls.update();
    }
  });

  return null;
}

function Scene(props: PhysicsRoomProps & { preset: ViewPreset }) {
  const onSelect = props.onSelectStation;

  return (
    <>
      <ChemistryLabRoom config={PHYSICS_ROOM} />

      <CameraRig preset={props.preset} focusId={(props.guide?.id as PhysicsStationId | undefined) ?? null} />
      <Bench />

      <Station id="vernier" active={props.activeStationId === "vernier"} complete={props.completedStations.includes("vernier")} onSelect={onSelect}>
        <VernierModel jawGapMm={props.vernier.observedMm} />
      </Station>
      <Station id="micrometer" active={props.activeStationId === "micrometer"} complete={props.completedStations.includes("micrometer")} onSelect={onSelect}>
        <MicrometerModel correctedMm={props.micrometer.correctedMm} thimble={props.micrometer.thimbleDivision} />
      </Station>
      <Station id="metre-rule" active={props.activeStationId === "metre-rule"} complete={props.completedStations.includes("metre-rule")} onSelect={onSelect}>
        <MetreRuleModel startCm={props.rule.startCm} endCm={props.rule.endCm} />
      </Station>
      <Station id="stopwatch" active={props.activeStationId === "stopwatch"} complete={props.completedStations.includes("stopwatch")} onSelect={onSelect}>
        <StopwatchModel seconds={props.stopwatch.elapsedMs / 1000} />
      </Station>
      <Station id="parallax" active={props.activeStationId === "parallax"} complete={props.completedStations.includes("parallax")} onSelect={onSelect}>
        <ParallaxModel eyeOffsetMm={props.parallax.eyeOffsetMm} aligned={props.parallax.aligned} observedMm={props.parallax.observedMm} />
      </Station>
      <Station id="density" active={props.activeStationId === "density"} complete={props.completedStations.includes("density")} onSelect={onSelect}>
        <DensityModel massG={props.solid.massG} volumeMl={props.liquid.volumeMl} />
      </Station>

      <OrbitControls makeDefault enablePan enableDamping dampingFactor={0.08} enableRotate={false} minZoom={0.7} maxZoom={3.4} target={[0, 1, -0.25]} />
    </>
  );
}

export default function PhysicsLabRoom3D(props: PhysicsRoomProps) {
  const [preset, setPreset] = useState<ViewPreset>("room");
  const [webgl] = useState(() => detectWebGL());
  const markReady = useLabReadySignal();
  const active = useMemo(() => props.stations.find((station) => station.id === props.activeStationId), [props.activeStationId, props.stations]);

  useEffect(() => {
    if (!webgl) markReady?.();
  }, [markReady, webgl]);

  if (!webgl) {
    return (
      <div className="grid gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">This device cannot show the 3D laboratory.</p>
        <p>The 2D bench remains fully usable. All instrument controls are available outside the canvas.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-[#d9e7f0] shadow-lg" aria-label="Interactive isometric 3D Physics laboratory. Select Vernier calipers, micrometer, metre rule, stopwatch, parallax scale or density station. All actions are also available in the controls below.">
      <div className="h-[clamp(300px,60vh,560px)] w-full">
        <Canvas
          orthographic
          camera={{ position: [8, 7.2, 8], zoom: 60, near: 0.1, far: 100 }}
          onCreated={() => markReady?.()}
          dpr={[1, 1.6]}
          shadows
          gl={{ antialias: true }}
        >
          <Scene {...props} preset={preset} />
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto grid max-w-[19rem] gap-2">
          <div className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-lg backdrop-blur">
            <span className="mr-2 inline-block size-2 rounded-full bg-sky-500" />
            <strong className="text-slate-950">{active?.title ?? "Measurement laboratory"}</strong>
            <span className="ml-2 text-slate-500">{props.mode === "guided" ? "guided" : "independent"}</span>
          </div>
          {props.guide ? (
            <div className="rounded-xl border border-sky-200 bg-white/95 p-3 text-slate-700 shadow-lg backdrop-blur" aria-live="polite">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Selected apparatus</p>
                  <p className="text-sm font-bold text-slate-950">{props.guide.name}</p>
                </div>
                {props.onDismissGuide ? (
                  <button type="button" onClick={props.onDismissGuide} className="grid size-7 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close apparatus detail">
                    ×
                  </button>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed">{props.guide.use}</p>
              <p className="mt-1.5 text-[10px] font-semibold text-sky-700">View the full guide below the room ↓</p>
            </div>
          ) : null}
        </div>
        <div className="pointer-events-auto">
          <LabMenu label="Camera controls">
            <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              {([
                ["room", "Whole lab", "grid_view"],
                ["instruments", "Instruments", "straighten"],
                ["density", "Density", "scale"],
              ] as const).map(([value, label, icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreset(value)}
                  className={`min-h-10 w-full justify-center rounded-lg px-3 text-xs font-semibold shadow-sm transition sm:min-h-9 sm:w-auto ${preset === value ? "bg-sky-700 text-white" : "bg-white/90 text-slate-700 hover:bg-white"}`}
                  title={label}
                  aria-label={`Camera: ${label}`}
                >
                  <span className="material-symbols-outlined mr-1.5 align-middle text-base sm:mr-0">{icon}</span>
                  <span className="sm:hidden">{label}</span>
                </button>
              ))}
            </div>
          </LabMenu>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-lg backdrop-blur">
          Click a station · drag to pan · scroll or pinch to zoom
        </div>
        <div className="pointer-events-auto rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-[11px] font-semibold text-sky-800 shadow-lg backdrop-blur">
          {props.completedStations.length}/{props.stations.length} stations complete
        </div>
      </div>
    </div>
  );
}
