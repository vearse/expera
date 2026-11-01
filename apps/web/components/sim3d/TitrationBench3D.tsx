"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { detectWebGL } from "@/lib/device";
import { buretteReading, currentPH, type TitrationState } from "@/lib/sim/titrationStore";
import { BENCH_TOP, ChemistryLabRoom, TITRATION_LAB_ROOM } from "./ChemistryLabRoom";

const BURETTE_X = 0.22;
const BURETTE_Z = 0.4;
const FLASK_X = 0.22;
const FLASK_Z = 0.42;
const BURETTE_BOTTOM = 1.45;
const BURETTE_TOP = 2.32;

type CameraView = "room" | "bench";
type ControlsLike = { target: THREE.Vector3; update?: () => void };

const CAMERA_VIEWS: Record<CameraView, { position: [number, number, number]; target: [number, number, number] }> = {
  room: { position: [2.65, 2.95, 6.2], target: [0, 1.35, -0.35] },
  bench: { position: [1.62, 2.3, 3.75], target: [0.08, 1.55, 0.3] },
};

function GlassMaterial({ opacity = 0.3 }: { opacity?: number }) {
  return (
    <meshPhysicalMaterial
      color="#e8f7ff"
      transparent
      opacity={opacity}
      roughness={0.05}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.04}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

function titrationTeacherHint(state: TitrationState, ph: number | null): string {
  if (state.finished) return "All the titres are recorded. Compare the concordant values, then calculate the base concentration.";
  if (state.rows.length > state.trialIndex) return "Record the final reading, then start the next trial. Repeat until you have concordant titres.";
  if (!state.rinsed) return "Rinse the burette with a little of the acid before you fill it.";
  if (!state.filled) return "Fill the burette just above the zero mark, using a funnel below eye level.";
  if (!state.bubbleRemoved) return "Open the tap briefly to clear the air bubble from the jet. Check that the tip is full.";
  if (state.initialRecorded === null) return "Read the starting level at eye level, using the bottom of the meniscus.";
  if (!state.baseInFlask) return "Use a pipette filler to transfer exactly 25 cm3 of base into the conical flask.";
  if (state.indicatorDrops < 2) return "Add two drops of indicator. Swirl gently so the colour is evenly mixed.";
  if (!state.onTile) return "Place the flask on the white tile. The colour change is much easier to see against white.";
  if (state.deliveredToFlask === 0) return "Swirl the flask, then run acid in 1 cm3 portions. Stop and swirl after each addition.";
  if (ph !== null && ph < 6) return "The colour is changing. Add acid one drop at a time and swirl after every drop.";
  return "Keep the flask swirling. Near the end point, let single drops fall and watch for the first permanent colour change.";
}

function CameraRig({ view }: { view: CameraView }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as ControlsLike | null;
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const next = CAMERA_VIEWS[view];
    camera.position.set(...next.position);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = view === "bench" ? 36 : 42;
      camera.updateProjectionMatrix();
    }
    if (controls) {
      controls.target.set(...next.target);
      controls.update?.();
    }
    invalidate();
  }, [camera, controls, invalidate, view]);

  return null;
}

function RetortStand() {
  return (
    <group position={[-0.58, BENCH_TOP, 0.4]}>
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.36]} />
        <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.7, -0.04]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 1.4, 18]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.02, 1.04, -0.04]} castShadow>
        <boxGeometry args={[0.16, 0.13, 0.12]} />
        <meshStandardMaterial color="#475569" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0.4, 1.04, 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.8, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.8, 1.04, 0.02]} castShadow>
        <boxGeometry args={[0.08, 0.09, 0.12]} />
        <meshStandardMaterial color="#475569" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0.8, 1.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.014, 8, 24]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.28} />
      </mesh>
    </group>
  );
}

function Burette({ state, reading }: { state: TitrationState; reading: number }) {
  const liquidTop = BURETTE_TOP - 0.045 - (Math.min(reading, 50) / 50) * 0.66;
  const liquidHeight = Math.max(0.015, liquidTop - BURETTE_BOTTOM);
  const ticks = useMemo(() => Array.from({ length: 21 }, (_, index) => 2.27 - index * 0.032), []);

  return (
    <group position={[BURETTE_X, 0, BURETTE_Z]}>
      <mesh position={[0, (BURETTE_TOP + BURETTE_BOTTOM) / 2, 0]}>
        <cylinderGeometry args={[0.038, 0.038, BURETTE_TOP - BURETTE_BOTTOM, 28, 1, true]} />
        <GlassMaterial opacity={0.26} />
      </mesh>
      <mesh position={[0, BURETTE_TOP - 0.012, 0]}>
        <cylinderGeometry args={[0.046, 0.039, 0.035, 28]} />
        <GlassMaterial opacity={0.4} />
      </mesh>
      <mesh position={[0, BURETTE_BOTTOM + 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 0.11, 18]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
      </mesh>
      {state.filled ? (
        <>
          <mesh position={[0, BURETTE_BOTTOM + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.029, 0.029, liquidHeight, 24]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} roughness={0.12} />
          </mesh>
          <mesh position={[0, liquidTop, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 0.029, 28]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        </>
      ) : null}
      {ticks.map((y, index) => (
        <mesh key={y} position={[0.04, y, 0]}>
          <boxGeometry args={[index % 5 === 0 ? 0.055 : 0.035, 0.004, 0.004]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.72} />
        </mesh>
      ))}
      <mesh position={[0, 1.41, 0]}>
        <sphereGeometry args={[0.034, 18, 12]} />
        <meshStandardMaterial color="#0f766e" roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh position={[0.07, 1.41, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.15, 14]} />
        <meshStandardMaterial color="#0f766e" roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.39, 0]}>
        <cylinderGeometry args={[0.007, 0.014, 0.1, 16]} />
        <GlassMaterial opacity={0.45} />
      </mesh>
      {state.filled ? (
        <mesh position={[0, 1.325, 0]}>
          <sphereGeometry args={[0.012, 12, 10]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.9} />
        </mesh>
      ) : null}
    </group>
  );
}

function ConicalFlask({ state, colour }: { state: TitrationState; colour: string }) {
  const base = BENCH_TOP + (state.onTile ? 0.046 : 0.026);
  const liquidHeight = 0.075 + Math.min(state.deliveredToFlask / Math.max(state.pipetteVolume, 1), 1.5) * 0.035;

  return (
    <group position={[FLASK_X, base, FLASK_Z]}>
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.151, 0.151, 0.024, 36]} />
        <GlassMaterial opacity={0.34} />
      </mesh>
      <mesh position={[0, 0.145, 0]}>
        <cylinderGeometry args={[0.058, 0.151, 0.25, 36, 1, true]} />
        <GlassMaterial opacity={0.28} />
      </mesh>
      <mesh position={[0, 0.312, 0]}>
        <cylinderGeometry args={[0.05, 0.058, 0.11, 36, 1, true]} />
        <GlassMaterial opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.368, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.05, 0.007, 8, 36]} />
        <GlassMaterial opacity={0.55} />
      </mesh>
      {state.baseInFlask ? (
        <>
          <mesh position={[0, 0.038 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.086, 0.136, liquidHeight, 32]} />
            <meshStandardMaterial color={colour} transparent opacity={0.78} roughness={0.08} metalness={0.02} />
          </mesh>
          <mesh position={[0, 0.038 + liquidHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.086, 32]} />
            <meshBasicMaterial color={colour} transparent opacity={0.62} side={THREE.DoubleSide} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function WhiteTile({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <mesh position={[FLASK_X, BENCH_TOP + 0.012, FLASK_Z]} receiveShadow>
      <boxGeometry args={[0.72, 0.02, 0.58]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.28} metalness={0.02} />
    </mesh>
  );
}

function BenchSupplies() {
  return (
    <group>
      <group position={[-1.62, BENCH_TOP + 0.02, 0.56]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.125, 0.24, 28, 1, true]} />
          <GlassMaterial opacity={0.3} />
        </mesh>
        <mesh position={[0, 0.008, 0]}>
          <cylinderGeometry args={[0.125, 0.125, 0.016, 28]} />
          <GlassMaterial opacity={0.4} />
        </mesh>
        <mesh position={[0, 0.065, 0]}>
          <cylinderGeometry args={[0.118, 0.112, 0.095, 28]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.52} roughness={0.08} />
        </mesh>
      </group>
      <group position={[-2.05, BENCH_TOP + 0.02, 0.08]}>
        <mesh position={[0, 0.13, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.085, 0.26, 22]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.42} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.06, 18]} />
          <meshStandardMaterial color="#0f766e" roughness={0.45} />
        </mesh>
        <mesh position={[0.02, 0.38, 0]} rotation={[0.4, 0, -0.25]}>
          <cylinderGeometry args={[0.008, 0.012, 0.28, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
      <group position={[1.28, BENCH_TOP + 0.02, 0.76]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.062, 0.16, 20]} />
          <meshPhysicalMaterial color="#f59e0b" transparent opacity={0.66} roughness={0.14} clearcoat={0.7} />
        </mesh>
        <mesh position={[0, 0.175, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.04, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.215, 0]}>
          <cylinderGeometry args={[0.012, 0.02, 0.045, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.55} />
        </mesh>
      </group>
      <group position={[1.45, BENCH_TOP + 0.035, 0.18]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.018, 0.012, 0.42, 14]} />
          <GlassMaterial opacity={0.55} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.035, 14, 10]} />
          <meshStandardMaterial color="#0f766e" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function TitrationScene({ state, colour, ph, view }: { state: TitrationState; colour: string; ph: number | null; view: CameraView }) {
  const reading = buretteReading(state);
  const roomConfig = useMemo(
    () => ({
      ...TITRATION_LAB_ROOM,
      teacher: TITRATION_LAB_ROOM.teacher ? { ...TITRATION_LAB_ROOM.teacher, message: titrationTeacherHint(state, ph) } : null,
    }),
    [ph, state],
  );

  return (
    <>
      <ChemistryLabRoom config={roomConfig} />
      <RetortStand />
      <WhiteTile visible={state.onTile} />
      <ConicalFlask state={state} colour={colour} />
      <Burette state={state} reading={reading} />
      <BenchSupplies />
      <CameraRig view={view} />
      <OrbitControls
        makeDefault
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={1.7}
        maxDistance={10}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2.03}
        target={[0.08, 1.55, 0.3]}
      />
    </>
  );
}

export default function TitrationBench3D({ state, colour }: { state: TitrationState; colour: string }) {
  const [view, setView] = useState<CameraView>("room");
  const [webgl] = useState(() => detectWebGL());
  const reading = buretteReading(state);
  const ph = currentPH(state);

  if (!webgl) {
    return (
      <div className="grid gap-2 rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">This device cannot show the 3D titration laboratory.</p>
        <p>Use the 2D view to run the titration. All the controls remain available.</p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-200 shadow-inner"
      aria-label={`Full 3D titration laboratory. Burette reading ${reading.toFixed(2)} cm3. Flask ${ph === null ? "empty" : `pH ${ph.toFixed(1)}`}.`}
    >
      <p className="sr-only">Orbit the room. The flask liquid colour matches the indicator, and the burette level falls as acid is delivered.</p>
      <div className="h-[520px] w-full">
        <Canvas camera={{ position: CAMERA_VIEWS.room.position, fov: 42 }} dpr={[1, 1.5]} shadows gl={{ antialias: true }} frameloop="demand">
          <TitrationScene state={state} colour={colour} ph={ph} view={view} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap gap-1.5 rounded-xl border border-white/70 bg-white/88 p-2 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur">
          <span className="rounded-lg bg-teal-700 px-2 py-1 text-white">Burette {reading.toFixed(2)} cm3</span>
          <span className="rounded-lg bg-slate-900/85 px-2 py-1 text-white">{ph === null ? "Flask empty" : `pH ${ph.toFixed(1)}`}</span>
          <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">{state.indicatorDrops} indicator {state.indicatorDrops === 1 ? "drop" : "drops"}</span>
        </div>
        <div className="pointer-events-auto flex gap-1.5">
          {(["room", "bench"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold capitalize shadow-sm transition ${view === value ? "bg-teal-700 text-white" : "bg-white/90 text-slate-700 hover:bg-white"}`}
            >
              {value === "room" ? "Room view" : "Bench view"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
