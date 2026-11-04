"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { detectWebGL } from "@/lib/device";
import { buretteReading, currentPH, type TitrationAction, type TitrationState } from "@/lib/sim/titrationStore";
import { availableContextActions, availableSecondaryActions, targetKey } from "@/lib/sim/guidedSimulation";
import { TITRATION_INTERACTION_POINTS } from "@/lib/sim/titrationGuide";
import type { GuidedSimulationController } from "@/lib/sim/useGuidedSimulation";
import { GuidedInstructionCard } from "@/components/lab/GuidedInstructionCard";
import { BENCH_TOP, ChemistryLabRoom, RoomLabel, TITRATION_LAB_ROOM } from "./ChemistryLabRoom";
import { GuidedPointer } from "./GuidedPointer";
import { SimulationToolbar } from "./SimulationToolbar";

const BURETTE_X = 0.22;
const BURETTE_Z = 0.4;
const FLASK_X = 0.22;
const FLASK_Z = 0.42;
const BURETTE_BOTTOM = 1.45;
const BURETTE_TOP = 2.32;

type CameraView = "room" | "bench";
type ControlsLike = { target: THREE.Vector3; update?: () => void };

const CAMERA_VIEWS: Record<CameraView, { position: [number, number, number]; target: [number, number, number] }> = {
  room: { position: [3.15, 3.2, 7.6], target: [0, 1.4, -0.5] },
  bench: { position: [1.72, 2.4, 4.05], target: [0.1, 1.5, 0.3] },
};

const HOTSPOT_KEYS = Object.keys(TITRATION_INTERACTION_POINTS);

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

function CameraRig({ view }: { view: CameraView }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as ControlsLike | null;
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);
  const aspect = size.width / Math.max(size.height, 1);

  useEffect(() => {
    const next = CAMERA_VIEWS[view];
    const narrowing = Math.max(0, Math.min(1.4, (1.25 - aspect) / 0.6));
    camera.position.set(next.position[0], next.position[1], next.position[2] + narrowing * 3.6);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = view === "bench" ? (aspect < 1.15 ? 46 : 36) : aspect < 1.15 ? 56 : 44;
      camera.updateProjectionMatrix();
    }
    if (controls) {
      controls.target.set(...next.target);
      controls.update?.();
    }
    invalidate();
  }, [aspect, camera, controls, invalidate, view]);

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

function Burette({
  state,
  reading,
  tapInteractive,
  onTap,
}: {
  state: TitrationState;
  reading: number;
  tapInteractive: boolean;
  onTap: () => void;
}) {
  const liquidRef = useRef<THREE.Mesh>(null);
  const meniscusRef = useRef<THREE.Mesh>(null);
  const displayReading = useRef(50);
  const wasFilled = useRef(false);
  const invalidate = useThree((scene) => scene.invalidate);
  const ticks = useMemo(() => Array.from({ length: 21 }, (_, index) => 2.27 - index * 0.032), []);

  useEffect(() => {
    if (state.filled && !wasFilled.current) {
      displayReading.current = 50;
      invalidate();
    }
    if (!state.filled) displayReading.current = 50;
    wasFilled.current = state.filled;
  }, [invalidate, state.filled]);

  useEffect(() => () => {
    document.body.style.cursor = "default";
  }, []);

  useFrame((_, delta) => {
    if (!state.filled || !liquidRef.current || !meniscusRef.current) return;
    const target = Math.min(Math.max(reading, 0), 50);
    const diff = target - displayReading.current;
    if (Math.abs(diff) < 0.002) {
      displayReading.current = target;
    } else {
      displayReading.current += diff * (1 - Math.pow(0.0015, Math.min(delta, 0.08)));
      invalidate();
    }
    const liquidTop = BURETTE_TOP - 0.045 - (displayReading.current / 50) * 0.66;
    const liquidHeight = Math.max(0.015, liquidTop - BURETTE_BOTTOM);
    liquidRef.current.position.y = BURETTE_BOTTOM + liquidHeight / 2;
    liquidRef.current.scale.y = liquidHeight;
    meniscusRef.current.position.y = liquidTop;
  });

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
          <mesh ref={liquidRef} position={[0, BURETTE_BOTTOM + 0.0075, 0]} scale={[1, 0.015, 1]}>
            <cylinderGeometry args={[0.029, 0.029, 1, 24]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} roughness={0.12} />
          </mesh>
          <mesh ref={meniscusRef} position={[0, BURETTE_BOTTOM, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
      <group
        onClick={
          tapInteractive
            ? (event) => {
                event.stopPropagation();
                onTap();
              }
            : undefined
        }
        onPointerOver={
          tapInteractive
            ? (event) => {
                event.stopPropagation();
                document.body.style.cursor = "pointer";
              }
            : undefined
        }
        onPointerOut={
          tapInteractive
            ? () => {
                document.body.style.cursor = "default";
              }
            : undefined
        }
      >
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

function WhiteTile({ placed }: { placed: boolean }) {
  const x = placed ? FLASK_X : FLASK_X + 0.36;
  const z = placed ? FLASK_Z : FLASK_Z + 0.06;
  return (
    <mesh position={[x, BENCH_TOP + 0.012, z]} receiveShadow>
      <boxGeometry args={[0.72, 0.02, 0.58]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.28} metalness={0.02} />
    </mesh>
  );
}

function Pipette() {
  return (
    <group position={[0.92, BENCH_TOP + 0.02, 0.74]} rotation={[0.16, 0, 0.52]}>
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.012, 0.018, 0.56, 14]} />
        <GlassMaterial opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.007, 0.012, 0.18, 12]} />
        <GlassMaterial opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.61, 0]}>
        <sphereGeometry args={[0.062, 18, 14]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.48} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.022, 0.03, 0.06, 14]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
    </group>
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
      <RoomLabel text="Indicator" position={[1.28, BENCH_TOP + 0.34, 0.76]} height={0.045} />
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

function InteractionHotspot({
  pointKey,
  active,
  interactive,
  onInteract,
}: {
  pointKey: string;
  active: boolean;
  interactive: boolean;
  onInteract: (apparatusId: string, interactionPoint: string) => void;
}) {
  const point = TITRATION_INTERACTION_POINTS[pointKey];
  const [hovered, setHovered] = useState(false);
  if (!point) return null;

  const separator = pointKey.indexOf(":");
  const apparatusId = pointKey.slice(0, separator);
  const interactionPoint = pointKey.slice(separator + 1);

  return (
    <group position={point.position}>
      <mesh
        onPointerOver={
          interactive
            ? (event) => {
                event.stopPropagation();
                setHovered(true);
                document.body.style.cursor = "pointer";
              }
            : undefined
        }
        onPointerOut={
          interactive
            ? () => {
                setHovered(false);
                document.body.style.cursor = "default";
              }
            : undefined
        }
        onClick={
          interactive
            ? (event) => {
                event.stopPropagation();
                onInteract(apparatusId, interactionPoint);
              }
            : undefined
        }
      >
        <sphereGeometry args={[point.radius, 20, 16]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      {active ? (
        <group>
          <mesh>
            <sphereGeometry args={[point.radius * 1.35, 20, 16]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.16} depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, point.radius * 0.9, 0]}>
            <ringGeometry args={[point.radius * 0.9, point.radius * 1.18, 36]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      ) : hovered ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, point.radius * 0.8, 0]}>
          <ringGeometry args={[point.radius * 0.9, point.radius * 1.1, 32]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function TitrationScene({
  state,
  colour,
  view,
  guided,
  locked,
  onTeacherClick,
}: {
  state: TitrationState;
  colour: string;
  view: CameraView;
  guided: GuidedSimulationController<TitrationState, TitrationAction>;
  locked: boolean;
  onTeacherClick: () => void;
}) {
  const reading = buretteReading(state);
  const teacherMessage = guided.step
    ? guided.hintText ?? guided.nextInstruction
    : "All the titres are recorded. Open History to review the table, the average and the calculation.";

  const roomConfig = useMemo(
    () => ({
      ...TITRATION_LAB_ROOM,
      teacher: TITRATION_LAB_ROOM.teacher
        ? { ...TITRATION_LAB_ROOM.teacher, message: teacherMessage, onSpeechClick: onTeacherClick }
        : null,
    }),
    [onTeacherClick, teacherMessage],
  );

  const activeKey = guided.nextTarget ? targetKey(guided.nextTarget) : null;
  const activePoint = activeKey ? TITRATION_INTERACTION_POINTS[activeKey] : null;

  return (
    <>
      <ChemistryLabRoom config={roomConfig} />
      <RetortStand />
      <WhiteTile placed={state.onTile} />
      <ConicalFlask state={state} colour={colour} />
      <Burette
        state={state}
        reading={reading}
        tapInteractive={activeKey === "burette:tap"}
        onTap={() => guided.interact("burette", "tap")}
      />
      <Pipette />
      <BenchSupplies />

      {HOTSPOT_KEYS.filter((key) => !(key === "white-tile:surface" && state.onTile)).map((key) => (
        <InteractionHotspot
          key={key}
          pointKey={key}
          active={key === activeKey}
          interactive={!activeKey || key === activeKey}
          onInteract={guided.interact}
        />
      ))}

      {activePoint ? (
        <GuidedPointer
          position={[activePoint.position[0], activePoint.position[1] + 0.04, activePoint.position[2]]}
          instruction={guided.pointerLabel ?? guided.nextTarget?.label ?? ""}
        />
      ) : null}

      <CameraRig view={view} />
      <OrbitControls
        makeDefault
        enabled={!locked}
        enablePan={!locked}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.7}
        maxDistance={11}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2.03}
        target={[0.08, 1.55, 0.3]}
      />
    </>
  );
}

export default function TitrationBench3D({
  state,
  colour,
  guided,
  onHistory,
  notice,
}: {
  state: TitrationState;
  colour: string;
  guided: GuidedSimulationController<TitrationState, TitrationAction>;
  onHistory: () => void;
  notice?: string | null;
}) {
  const [view, setView] = useState<CameraView>("room");
  const [locked, setLocked] = useState(false);
  const [fullView, setFullView] = useState(false);
  const [webgl] = useState(() => detectWebGL());
  const reading = buretteReading(state);
  const ph = currentPH(state);

  useEffect(() => {
    if (!fullView) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullView(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullView]);

  if (!webgl) {
    return (
      <div className="grid gap-2 rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">This device cannot show the 3D titration laboratory.</p>
        <p>Use the 2D view to run the titration. All the guided apparatus interactions remain available.</p>
      </div>
    );
  }

  const contextActions = availableContextActions(guided.step, state);
  const secondaryActions = availableSecondaryActions(guided.step);
  const actions =
    contextActions.length || secondaryActions.length ? (
      <>
        {contextActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => guided.runAction(action.action, action.note)}
            className={`min-h-8 rounded-md px-2.5 text-[11px] font-semibold ${
              action.variant === "primary"
                ? "bg-teal-700 text-white hover:bg-teal-800"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {action.label}
          </button>
        ))}
        {secondaryActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => guided.runAction(action.action, action.note)}
            className="min-h-8 rounded-md border border-rose-300 bg-rose-50 px-2.5 text-[11px] font-semibold text-rose-800 hover:bg-rose-100"
          >
            {action.label}
          </button>
        ))}
      </>
    ) : null;

  const instructionCard = (
    <GuidedInstructionCard
      title={guided.step?.title ?? null}
      stepNumber={guided.stepNumber}
      totalSteps={guided.totalSteps}
      instruction={guided.nextInstruction || "Everything is recorded. Review the history and calculation."}
      hint={guided.hintText}
      hintLevel={guided.hintLevel}
      onHint={guided.step ? guided.requestHint : undefined}
      feedback={guided.feedback}
      notice={notice}
      progress={guided.progress}
      actions={actions}
    />
  );

  return (
    <div
      className={
        fullView
          ? `fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)] gap-2 bg-slate-950/90 p-3 backdrop-blur-sm ${locked ? "ring-2 ring-amber-400/80" : ""}`
          : `relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-200 shadow-inner ${locked ? "ring-2 ring-amber-400/80" : ""}`
      }
      role={fullView ? "dialog" : undefined}
      aria-label={`Full 3D titration laboratory. Burette reading ${reading.toFixed(2)} cm3. Flask ${ph === null ? "empty" : `pH ${ph.toFixed(1)}`}.`}
    >
      {fullView ? (
        <div className="flex items-center justify-between px-1 text-white">
          <p className="text-sm font-semibold">Full titration laboratory · press Esc to exit</p>
          <button
            type="button"
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
            onClick={() => setFullView(false)}
          >
            Exit full view
          </button>
        </div>
      ) : null}

      <div className={fullView ? "relative min-h-0 overflow-hidden rounded-2xl border border-slate-500 bg-slate-200 shadow-2xl" : "relative"}>
        <div className={fullView ? "h-full min-h-[480px] w-full" : "h-[560px] w-full"}>
          <Canvas camera={{ position: CAMERA_VIEWS.room.position, fov: 42 }} dpr={[1, 1.5]} shadows gl={{ antialias: true }} frameloop="demand">
            <TitrationScene state={state} colour={colour} view={view} guided={guided} locked={locked} onTeacherClick={guided.requestHint} />
          </Canvas>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3">
          <div className="pointer-events-auto flex flex-wrap gap-1.5 rounded-xl border border-white/70 bg-white/88 p-2 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur">
            <span className="rounded-lg bg-teal-700 px-2 py-1 text-white">Burette {reading.toFixed(2)} cm3</span>
            <span className="rounded-lg bg-slate-900/85 px-2 py-1 text-white">{ph === null ? "Flask empty" : `pH ${ph.toFixed(1)}`}</span>
            <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">
              {state.indicatorDrops} indicator {state.indicatorDrops === 1 ? "drop" : "drops"}
            </span>
          </div>
          <SimulationToolbar
            views={[
              { id: "room", label: "Room view" },
              { id: "bench", label: "Bench view" },
            ]}
            activeView={view}
            onViewChange={(id) => setView(id as CameraView)}
            onHistory={onHistory}
            locked={locked}
            onLockChange={setLocked}
            fullView={fullView}
            onFullViewChange={setFullView}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-end justify-between gap-2 p-3">
          {instructionCard}
          {locked ? (
            <span className="pointer-events-auto rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">Camera locked</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
