"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { detectWebGL } from "@/lib/device";
import { ChemistryLabRoom, RoomLabel, type LabRoomConfig } from "@/components/sim3d/ChemistryLabRoom";
import {
  currentBob,
  currentEffectiveLengthM,
  currentGravity,
  stopwatchDisplay,
  type PendulumLabState,
} from "@/lib/sim/pendulumStore";
import { formatStopwatch } from "@/lib/engine/physics/pendulum";

const PIVOT_Y = 4.62;
const LENGTH_SCALE = 1.72;

const PENDULUM_ROOM: LabRoomConfig = {
  showShelves: false,
  showWorkBench: false,
  showSideBench: false,
  showStools: false,
  subjectLabel: "EXPERA PHYSICS LABORATORY",
  wallChart: "measurement",
  palette: {
    background: "#d9e7f0",
    fog: "#d9e7f0",
    floor: "#e2ebf2",
    floorGridMajor: "#b7c9d7",
    floorGridMinor: "#cedbe5",
    wallBack: "#eff5fa",
    wallSide: "#e5eef6",
    trim: "#c3d3df",
    benchTop: "#b8d8e4",
    benchBody: "#e2e8f0",
    sideBenchTop: "#b8d8e4",
    drawer: "#f1f5f9",
    metal: "#94a3b8",
    accent: "#0e7490",
    seat: "#0e7490",
  },
  notice: {
    eyebrow: "Pendulum practical",
    title: "Period and length",
    subtitle: "Time repeated swings. Plot T squared against L.",
    lines: [
      "Measure pivot to bob centre.",
      "Start and stop at centre crossings.",
      "Time 10 or 20 oscillations.",
      "Use five lengths at one gravity setting.",
    ],
    footer: "Ask Mr. Bello if you are unsure.",
  },
  teacher: {
    name: "Mr. Bello",
    message: "Measure the effective length, then arm the stopwatch for a repeated-swing timing.",
    position: [-5.45, 0, -1.25],
    rotation: 1.28,
  },
};

type CameraPreset = "room" | "rig";

function roomConfig(state: PendulumLabState): LabRoomConfig {
  if (state.mode === "guided") return PENDULUM_ROOM;
  return {
    ...PENDULUM_ROOM,
    notice: {
      eyebrow: "Independent task",
      title: "Period and length",
      subtitle: "Plan your own measurements and keep valid evidence.",
      lines: [
        "Choose the range of lengths.",
        "Decide how many oscillations to time.",
        "Keep control variables fixed.",
        "Analyse your graph and check your error.",
      ],
      footer: "Success criteria are in the panel above.",
    },
    teacher: {
      name: "Mr. Bello",
      message: "Independent mode: no procedural hints. Read the aim, choose your apparatus and collect evidence you can justify.",
      position: [-5.45, 0, -1.25],
      rotation: 1.28,
    },
  };
}

function Metal({ color, metalness = 0.72, roughness = 0.24 }: { color: string; metalness?: number; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />;
}

function BenchLeg({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.46, z]} castShadow>
      <boxGeometry args={[0.12, 0.82, 0.12]} />
      <Metal color="#64748b" metalness={0.6} roughness={0.35} />
    </mesh>
  );
}

function LaboratoryTable() {
  return (
    <group>
      <RoundedBox args={[4.25, 0.16, 1.55]} radius={0.04} smoothness={4} position={[0.25, 1.01, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#c7dee8" roughness={0.3} metalness={0.08} clearcoat={0.35} />
      </RoundedBox>
      <mesh position={[0.25, 0.82, 0]} castShadow>
        <boxGeometry args={[3.98, 0.18, 1.3]} />
        <meshStandardMaterial color="#dbe7ee" roughness={0.7} />
      </mesh>
      {[-1.35, 1.85].map((x) => (
        <group key={x}>
          <BenchLeg x={x} z={-0.48} />
          <BenchLeg x={x} z={0.48} />
        </group>
      ))}
      <mesh position={[0.25, 0.93, 0.71]}>
        <boxGeometry args={[3.98, 0.05, 0.04]} />
        <meshStandardMaterial color="#0e7490" roughness={0.4} metalness={0.25} />
      </mesh>
    </group>
  );
}

function RetortStand() {
  return (
    <group>
      <RoundedBox args={[0.95, 0.1, 0.72]} radius={0.035} smoothness={3} position={[-1.62, 1.14, 0]} castShadow>
        <meshStandardMaterial color="#334155" roughness={0.32} metalness={0.6} />
      </RoundedBox>
      <mesh position={[-1.62, 2.7, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.075, 3.3, 24]} />
        <Metal color="#94a3b8" metalness={0.82} roughness={0.18} />
      </mesh>
      <mesh position={[-0.82, PIVOT_Y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 1.62, 18]} />
        <Metal color="#cbd5e1" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.62, PIVOT_Y, 0]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <Metal color="#475569" metalness={0.68} roughness={0.28} />
      </mesh>
      <mesh position={[0, PIVOT_Y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.085, 0.12, 24]} />
        <Metal color="#e2e8f0" metalness={0.9} roughness={0.16} />
      </mesh>
    </group>
  );
}

function Protractor() {
  const ticks = Array.from({ length: 13 }, (_, index) => -30 + index * 5);
  return (
    <group position={[0, PIVOT_Y, -0.08]}>
      <mesh>
        <ringGeometry args={[0.5, 0.53, 48, 1, Math.PI, Math.PI]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.38} side={THREE.DoubleSide} />
      </mesh>
      {ticks.map((angle) => {
        const radians = (angle * Math.PI) / 180;
        const major = angle % 10 === 0;
        return (
          <mesh key={angle} position={[Math.sin(radians) * 0.48, -Math.cos(radians) * 0.48, 0.01]} rotation={[0, 0, -radians]}>
            <boxGeometry args={[major ? 0.009 : 0.005, major ? 0.11 : 0.065, 0.006]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        );
      })}
    </group>
  );
}

function MetreRule({ effectiveLengthM, measuredLengthM }: { effectiveLengthM: number; measuredLengthM: number | null }) {
  return (
    <group position={[-0.92, 2.85, 0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.1, 2.84, 0.04]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.55} />
      </mesh>
      {Array.from({ length: 31 }).map((_, index) => (
        <mesh key={index} position={[0.058, -1.36 + index * 0.09, 0.022]}>
          <boxGeometry args={[index % 10 === 0 ? 0.09 : index % 5 === 0 ? 0.065 : 0.04, 0.006, 0.005]} />
          <meshBasicMaterial color="#78350f" />
        </mesh>
      ))}
      <mesh position={[0.075, -1.36 + effectiveLengthM * LENGTH_SCALE, 0.03]}>
        <boxGeometry args={[0.15, 0.018, 0.02]} />
        <meshBasicMaterial color="#dc2626" toneMapped={false} />
      </mesh>
      <RoomLabel text={measuredLengthM === null ? "measure L" : `${measuredLengthM.toFixed(3)} m`} position={[-0.22, -1.54, 0.03]} height={0.085} />
    </group>
  );
}

function Stopwatch({ state }: { state: PendulumLabState }) {
  return (
    <group position={[1.25, 1.12, 0.11]}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.31, 0.31, 0.09, 36]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.28} />
      </mesh>
      <mesh position={[0, 0.128, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 36]} />
        <meshStandardMaterial color="#0f172a" roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.135, 0]}>
        <circleGeometry args={[0.19, 36]} />
        <meshBasicMaterial color={state.timing.phase === "complete" ? "#064e3b" : state.simulation.running ? "#0c4a6e" : "#111827"} />
      </mesh>
      <RoomLabel text={`${stopwatchDisplay(state)} s`} position={[0, 0.2, 0.01]} height={0.075} />
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.05, 14]} />
        <Metal color="#e2e8f0" metalness={0.8} roughness={0.18} />
      </mesh>
      <mesh position={[0.32, 0.1, 0]} rotation={[0.2, 0, -0.2]} castShadow>
        <boxGeometry args={[0.13, 0.04, 0.13]} />
        <Metal color="#64748b" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function PendulumAssembly({ state }: { state: PendulumLabState }) {
  const bob = currentBob(state);
  const effectiveLengthM = currentEffectiveLengthM(state);
  const visualLength = effectiveLengthM * LENGTH_SCALE;
  const thetaRad = state.simulation.thetaRad;
  const bobRadius = Math.max(0.085, bob.radiusM * 6.8);
  const bobX = Math.sin(thetaRad) * visualLength;
  const bobY = PIVOT_Y - Math.cos(thetaRad) * visualLength;
  return (
    <>
      <group position={[0, PIVOT_Y, 0]} rotation={[0, 0, thetaRad]}>
        <mesh position={[0, -visualLength / 2, 0]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, visualLength, 10]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, -visualLength, 0]} castShadow>
          <sphereGeometry args={[bobRadius, 28, 20]} />
          <meshPhysicalMaterial color={bob.colour} roughness={0.26} metalness={0.68} clearcoat={0.35} />
        </mesh>
        <mesh position={[0, -visualLength + bobRadius * 0.55, 0.01]}>
          <sphereGeometry args={[bobRadius * 0.26, 16, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.42} />
        </mesh>
      </group>
      <mesh position={[bobX, 1.11, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.12, bobRadius * 1.18), 28]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.17} depthWrite={false} />
      </mesh>
      <mesh position={[bobX, 1.105, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(0.12, bobRadius * 1.18), Math.max(0.14, bobRadius * 1.32), 30]} />
        <meshBasicMaterial color={state.params.dampingOn ? "#f59e0b" : "#0e7490"} transparent opacity={0.18} />
      </mesh>
      <RoomLabel text={`L = ${effectiveLengthM.toFixed(3)} m`} position={[0.48, PIVOT_Y - visualLength - 0.36, 0]} height={0.09} />
      <RoomLabel text={`θ = ${((thetaRad * 180) / Math.PI).toFixed(1)}°`} position={[0.46, PIVOT_Y - visualLength, 0]} height={0.08} />
      <group position={[bobX, bobY, 0]}>
        <mesh>
          <sphereGeometry args={[bobRadius * 1.025, 20, 14]} />
          <meshBasicMaterial color={bob.colour} transparent opacity={0.12} />
        </mesh>
      </group>
    </>
  );
}

function CameraRig({ preset }: { preset: CameraPreset }) {
  const { camera, size } = useThree();
  const controls = useThree((state) => state.controls) as { target: THREE.Vector3; update: () => void } | null;

  useEffect(() => {
    const base = Math.min(46, Math.max(24, size.width / 17));
    const target = preset === "rig" ? new THREE.Vector3(0, 2.75, 0) : new THREE.Vector3(0.1, 1.7, -0.15);
    camera.position.set(7.4, 6.2, 7.6);
    camera.lookAt(target);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = preset === "rig" ? base * 2.3 : base;
      camera.updateProjectionMatrix();
    }
    if (controls) {
      controls.target.copy(target);
      controls.update();
    }
  }, [camera, controls, preset, size.width]);

  return null;
}

function Scene({ state, preset, onFocus }: { state: PendulumLabState; preset: CameraPreset; onFocus: () => void }) {
  return (
    <>
      <ChemistryLabRoom config={roomConfig(state)} />
      <CameraRig preset={preset} />
      <LaboratoryTable />
      <group
        onPointerDown={(event) => {
          event.stopPropagation();
          onFocus();
        }}
        onPointerOver={() => {
          if (typeof document !== "undefined") document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (typeof document !== "undefined") document.body.style.cursor = "";
        }}
      >
        <RetortStand />
        <Protractor />
        <PendulumAssembly state={state} />
        <MetreRule effectiveLengthM={currentEffectiveLengthM(state)} measuredLengthM={state.measuredLength?.measuredM ?? null} />
        <Stopwatch state={state} />
      </group>
      <OrbitControls makeDefault enablePan enableDamping dampingFactor={0.08} enableRotate={false} minZoom={0.65} maxZoom={4.4} target={[0.1, 1.7, -0.15]} />
    </>
  );
}

export type PendulumRigProps = {
  state: PendulumLabState;
};

export default function PendulumRig({ state }: PendulumRigProps) {
  const [preset, setPreset] = useState<CameraPreset>("room");
  const [webgl] = useState(() => detectWebGL());
  const bob = currentBob(state);
  const gravity = currentGravity(state);

  if (!webgl) {
    return (
      <div className="grid gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">This device cannot show the 3D laboratory.</p>
        <p>The 2D side view remains fully usable. All apparatus controls are below the room.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-[#d9e7f0] shadow-lg" aria-label="Interactive 3D simple pendulum laboratory. Select the pendulum to focus the camera. All controls are also available below.">
      <div className="h-[430px] w-full sm:h-[560px]">
        <Canvas orthographic camera={{ position: [7.4, 6.2, 7.6], zoom: 36, near: 0.1, far: 100 }} dpr={[1, 1.6]} shadows gl={{ antialias: true }}>
          <Scene state={state} preset={preset} onFocus={() => setPreset("rig")} />
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto grid max-w-[20rem] gap-2">
          <div className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-lg backdrop-blur">
            <span className="mr-2 inline-block size-2 rounded-full bg-sky-500" />
            <strong className="text-slate-950">Simple pendulum</strong>
            <span className="ml-2 text-slate-500">{state.mode === "guided" ? "guided" : "independent"}</span>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-lg backdrop-blur">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span><strong className="text-slate-900">Bob:</strong> {bob.name}</span>
              <span><strong className="text-slate-900">g:</strong> {gravity.accelerationMS2.toFixed(2)} m/s²</span>
              <span><strong className="text-slate-900">Timer:</strong> {formatStopwatch(state.timing.measuredTimeS ?? 0, state.data.stopwatch.resolutionS)} s</span>
            </div>
          </div>
        </div>
        <div className="pointer-events-auto flex gap-1.5">
          {([
            ["room", "Whole lab", "grid_view"],
            ["rig", "Pendulum", "timer"],
          ] as const).map(([value, label, icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreset(value)}
              className={`material-symbols-outlined min-h-9 rounded-lg px-3 text-sm font-semibold shadow-sm transition ${preset === value ? "bg-sky-700 text-white" : "bg-white/90 text-slate-700 hover:bg-white"}`}
              title={label}
              aria-label={`Camera: ${label}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-lg backdrop-blur">
          Click the rig · drag to pan · scroll or pinch to zoom
        </div>
        <div className="pointer-events-auto rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-[11px] font-semibold text-sky-800 shadow-lg backdrop-blur">
          {state.simulation.running ? "Swinging" : state.timing.phase === "complete" ? "Timing complete" : "Ready"}
        </div>
      </div>
    </div>
  );
}
