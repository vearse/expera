"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { MicroscopeModelSpec, SpecimenSpec } from "@/lib/content/biology";
import type { SlideState } from "@/lib/engine/biology/microscopy";
import { detectWebGL, prefersReducedMotion } from "@/lib/device";
import { RoomLabel } from "@/components/sim3d/ChemistryLabRoom";
import { CompoundMicroscope } from "./CompoundMicroscope";

type Preset = "room" | "microscope" | "cabinet" | "custom";
type ControlsLike = { enabled: boolean; target: THREE.Vector3; update?: () => void };

const JAR_COLOURS = ["#8fb56a", "#c7a5d8", "#65b9a8"];

export type BiologyRoomProps = {
  model: MicroscopeModelSpec;
  objectiveId: string;
  focusOffsetMicrometres: number;
  illumination: { power: boolean; intensity: number; diaphragm: number; condenser: number; mirrorAligned: boolean };
  specimen: SpecimenSpec | null;
  slide: SlideState | null;
  specimens: SpecimenSpec[];
  activeSpecimenId: string | null;
  selectedPart: string | null;
  microscopeSelected: boolean;
  teacherHint: string | null;
  onInspectPart: (id: string) => void;
  onSelectMicroscope: (modelId: string) => void;
  onSelectSpecimen: (id: string) => void;
  onStageClick: () => void;
  onClipClick: () => void;
};

function Bench() {
  return (
    <group position={[0, 0, 0.5]}>
      <RoundedBox args={[6.2, 0.13, 2.05]} radius={0.035} smoothness={4} position={[0, 1.0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#d7dfc9" roughness={0.38} metalness={0.04} clearcoat={0.62} />
      </RoundedBox>
      <mesh position={[-2.85, 1.17, -0.92]} castShadow>
        <boxGeometry args={[0.09, 0.24, 1.9]} />
        <meshStandardMaterial color="#c7d2bf" roughness={0.65} />
      </mesh>
      <mesh position={[2.85, 1.17, -0.92]} castShadow>
        <boxGeometry args={[0.09, 0.24, 1.9]} />
        <meshStandardMaterial color="#c7d2bf" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.52, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[5.9, 0.82, 1.72]} />
        <meshStandardMaterial color="#f1f4eb" roughness={0.72} />
      </mesh>
      {[-2, 0, 2].map((x) => (
        <group key={x} position={[x, 0.73, 0.85]}>
          <mesh>
            <boxGeometry args={[1.64, 0.18, 0.035]} />
            <meshStandardMaterial color="#f8faf6" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.01, 0.025]}>
            <boxGeometry args={[0.36, 0.022, 0.03]} />
            <meshStandardMaterial color="#789083" metalness={0.72} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[-2.6, 1.1, -0.68]} castShadow>
        <boxGeometry args={[0.48, 0.08, 0.38]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.34} />
      </mesh>
      <mesh position={[-2.6, 1.13, -0.68]}>
        <boxGeometry args={[0.4, 0.02, 0.3]} />
        <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function SpecimenCabinet({ specimens, activeId, onSelect }: { specimens: SpecimenSpec[]; activeId: string | null; onSelect: (id: string) => void }) {
  return (
    <group position={[-4.1, 0, -3.5]}>
      <RoundedBox args={[2.1, 2.8, 0.56]} radius={0.04} smoothness={4} position={[0, 1.4, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#b7c6b0" roughness={0.72} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, 1.43, 0.292]}>
        <boxGeometry args={[1.88, 2.44, 0.02]} />
        <meshPhysicalMaterial color="#dce8ea" transparent opacity={0.52} roughness={0.06} metalness={0.05} />
      </mesh>
      {[0.95, 1.55, 2.15].map((y) => (
        <mesh key={y} position={[0, y, 0.06]}>
          <boxGeometry args={[1.9, 0.04, 0.45]} />
          <meshStandardMaterial color="#8fa18b" roughness={0.64} />
        </mesh>
      ))}
      <mesh position={[0, 0.16, 0.28]}>
        <boxGeometry args={[1.9, 0.22, 0.03]} />
        <meshStandardMaterial color="#6c7f69" roughness={0.55} />
      </mesh>
      <RoomLabel text="SPECIMEN STORE" position={[0, 2.86, 0.1]} height={0.11} />
      {specimens.map((specimen, index) => {
        const active = specimen.id === activeId;
        return (
          <group
            key={specimen.id}
            position={[-0.62 + (index % 2) * 1.22, 1.62 + Math.floor(index / 2) * 0.6, 0.27]}
            onPointerDown={(event) => {
              event.stopPropagation();
              onSelect(specimen.id);
            }}
          >
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.17, 0.42, 24]} />
              <meshPhysicalMaterial color={JAR_COLOURS[index % JAR_COLOURS.length]} transparent opacity={0.58} roughness={0.12} clearcoat={0.8} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 24]} />
              <meshStandardMaterial color={active ? "#0f766e" : "#4b5c55"} roughness={0.5} />
            </mesh>
            {active ? (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.185, 0.012, 8, 28]} />
                <meshBasicMaterial color="#5eead4" toneMapped={false} />
              </mesh>
            ) : null}
            <RoomLabel text={specimen.name} position={[0, -0.16, 0.28]} height={0.065} />
          </group>
        );
      })}
    </group>
  );
}

function SlideCollection() {
  return (
    <group position={[4.0, 0, -3.48]}>
      <RoundedBox args={[2.1, 2.45, 0.52]} radius={0.04} smoothness={4} position={[0, 1.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d7dfd2" roughness={0.72} />
      </RoundedBox>
      <mesh position={[0, 1.22, 0.27]}>
        <boxGeometry args={[1.86, 2.12, 0.02]} />
        <meshPhysicalMaterial color="#e6eef0" transparent opacity={0.48} roughness={0.08} />
      </mesh>
      {[0.72, 1.16, 1.6, 2.04].map((y, row) => (
        <group key={y} position={[0, y, 0.12]}>
          <mesh>
            <boxGeometry args={[1.72, 0.035, 0.3]} />
            <meshStandardMaterial color="#93a78f" roughness={0.6} />
          </mesh>
          {[-0.52, -0.17, 0.17, 0.52].map((x, index) => (
            <mesh key={x} position={[x, 0.024, 0]} castShadow>
              <boxGeometry args={[0.22, 0.035, 0.22]} />
              <meshPhysicalMaterial color={["#dbeafe", "#fef3c7", "#dcfce7", "#fce7f3"][(row + index) % 4]} transparent opacity={0.8} roughness={0.15} />
            </mesh>
          ))}
        </group>
      ))}
      <RoomLabel text="PREPARED SLIDES" position={[0, 2.6, 0.1]} height={0.095} />
    </group>
  );
}

function PrepBench() {
  return (
    <group position={[5.05, 0, -0.15]} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[3.2, 0.11, 1.18]} radius={0.03} smoothness={4} position={[0, 0.94, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#c8d2bb" roughness={0.4} metalness={0.04} clearcoat={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.49, 0]} castShadow>
        <boxGeometry args={[2.95, 0.78, 0.95]} />
        <meshStandardMaterial color="#eef2e8" roughness={0.72} />
      </mesh>
      <mesh position={[0.82, 1.0, 0.08]}>
        <boxGeometry args={[0.72, 0.05, 0.42]} />
        <meshStandardMaterial color="#809b8a" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0.82, 1.04, 0.08]}>
        <boxGeometry args={[0.62, 0.035, 0.34]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.35} metalness={0.65} />
      </mesh>
      {[-1.05, -0.7, -0.35].map((x, index) => (
        <group key={x} position={[x, 1.09, -0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.075, 0.2, 18]} />
            <meshPhysicalMaterial color={["#f59e0b", "#38bdf8", "#a78bfa"][index]} transparent opacity={0.72} roughness={0.16} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 0.08, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
        </group>
      ))}
      <group position={[-0.1, 1.01, 0.15]}>
        <mesh>
          <boxGeometry args={[0.55, 0.04, 0.18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        {[0, 1, 2, 3, 4].map((n) => (
          <mesh key={n} position={[-0.2 + n * 0.1, 0.026, 0]}>
            <boxGeometry args={[0.07, 0.006, 0.13]} />
            <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.65} />
          </mesh>
        ))}
      </group>
      <mesh position={[0.2, 1.08, -0.35]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.008, 0.012, 0.34, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.18} />
      </mesh>
      <RoomLabel text="SLIDE PREPARATION" position={[0, 1.55, -0.34]} height={0.075} />
    </group>
  );
}

function NoticeWall() {
  return (
    <group position={[0, 2.3, -3.98]}>
      <mesh castShadow>
        <boxGeometry args={[3.4, 1.62, 0.06]} />
        <meshStandardMaterial color="#7b8d72" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.036]}>
        <planeGeometry args={[3.18, 1.42]} />
        <meshStandardMaterial color="#f7faf2" roughness={0.86} />
      </mesh>
      <group position={[0, 0.28, 0.045]}>
        <RoomLabel text="BIOLOGY LABORATORY" position={[0, 0, 0]} height={0.13} />
      </group>
      <group position={[0, 0.04, 0.045]}>
        <mesh>
          <planeGeometry args={[2.45, 0.52]} />
          <meshStandardMaterial color="#144e45" roughness={0.7} />
        </mesh>
        <RoomLabel text="CELLS & MICROSCOPY" position={[0, 0.01, 0.01]} height={0.09} />
      </group>
      <group position={[0, -0.35, 0.045]}>
        <RoomLabel text="Prepare carefully. Observe accurately. Record what you see." position={[0, 0, 0]} height={0.055} />
      </group>
      <group position={[-0.84, -0.23, 0.02]}>
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => (
            <mesh key={`${row}-${col}`} position={[-0.22 + col * 0.088, 0.16 - row * 0.07, 0]}>
              <planeGeometry args={[0.07, 0.055]} />
              <meshBasicMaterial color="#b8d4b5" />
            </mesh>
          )),
        )}
      </group>
      <group position={[0.82, -0.2, 0.02]}>
        <mesh>
          <planeGeometry args={[0.95, 0.55]} />
          <meshStandardMaterial color="#e0ead8" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0.005]}>
          <circleGeometry args={[0.13, 24]} />
          <meshBasicMaterial color="#8fb56a" />
        </mesh>
        <mesh position={[-0.18, -0.1, 0.005]}>
          <circleGeometry args={[0.07, 20]} />
          <meshBasicMaterial color="#c7a5d8" />
        </mesh>
        <mesh position={[0.2, -0.08, 0.005]}>
          <circleGeometry args={[0.05, 18]} />
          <meshBasicMaterial color="#65b9a8" />
        </mesh>
      </group>
    </group>
  );
}

function IdleMicroscope({ position, onSelect }: { position: [number, number, number]; onSelect: () => void }) {
  return (
    <group position={position} scale={0.55} onPointerDown={(event) => { event.stopPropagation(); onSelect(); }}>
      <RoundedBox args={[0.42, 0.07, 0.34]} radius={0.025} smoothness={3} position={[0, 0.035, 0]} castShadow>
        <meshStandardMaterial color="#cbd5d9" roughness={0.48} metalness={0.15} />
      </RoundedBox>
      <mesh position={[-0.09, 0.36, -0.08]} castShadow>
        <boxGeometry args={[0.1, 0.55, 0.11]} />
        <meshStandardMaterial color="#dfe7ea" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0.05, 0.76, -0.01]} castShadow>
        <cylinderGeometry args={[0.043, 0.05, 0.34, 24]} />
        <meshStandardMaterial color="#e5ecef" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0.05, 0.95, -0.01]}>
        <cylinderGeometry args={[0.05, 0.04, 0.11, 24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.45} />
      </mesh>
      <mesh position={[0.05, 0.55, 0.02]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.4} />
      </mesh>
      {[0, 1, 2].map((n) => (
        <mesh key={n} position={[-0.01 + n * 0.065, 0.49, 0.08]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.022, 0.11, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0.02, 0.42, 0.06]}>
        <boxGeometry args={[0.34, 0.025, 0.28]} />
        <meshStandardMaterial color="#334155" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[-0.25, 0.27, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.04, 20]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Teacher({ message }: { message: string | null }) {
  return (
    <group position={[-4.75, 0, -0.75]} rotation={[0, 1.15, 0]}>
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.065, 0.64, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
      ))}
      {[-0.11, 0.11].map((x) => (
        <mesh key={`shoe-${x}`} position={[x, 0.055, 0.07]} castShadow>
          <boxGeometry args={[0.16, 0.09, 0.28]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.99, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.34, 0.82, 24]} />
        <meshStandardMaterial color="#f7faf5" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.31, 0.255]}>
        <boxGeometry args={[0.12, 0.5, 0.02]} />
        <meshStandardMaterial color="#0f766e" roughness={0.7} />
      </mesh>
      <mesh position={[0.34, 1.17, 0.1]} rotation={[0.2, 0, 0.42]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.56, 16]} />
        <meshStandardMaterial color="#f7faf5" roughness={0.72} />
      </mesh>
      <mesh position={[-0.34, 1.17, 0]} rotation={[0, 0, 0.16]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.62, 16]} />
        <meshStandardMaterial color="#f7faf5" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 18]} />
        <meshStandardMaterial color="#6b4634" roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.67, -0.01]} scale={[1.06, 0.8, 1.02]} castShadow>
        <sphereGeometry args={[0.205, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
        <meshStandardMaterial color="#201714" roughness={0.8} />
      </mesh>
      {[-0.075, 0.075].map((x) => (
        <mesh key={x} position={[x, 1.6, 0.185]}>
          <boxGeometry args={[0.07, 0.05, 0.012]} />
          <meshStandardMaterial color="#dbeafe" transparent opacity={0.55} roughness={0.2} />
        </mesh>
      ))}
      {message ? <RoomLabel text={message} position={[0.05, 2.25, 0.18]} height={0.075} /> : null}
    </group>
  );
}

function RoomShell() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8.2]} />
        <meshStandardMaterial color="#e4e9dc" roughness={0.9} />
      </mesh>
      <gridHelper args={[12, 24, "#b9c5b0", "#d1d9c8"]} position={[0, 0.006, 0]} />
      <mesh position={[0, 2.35, -4.07]} receiveShadow>
        <planeGeometry args={[12, 4.7]} />
        <meshStandardMaterial color="#f2f5ec" roughness={0.92} />
      </mesh>
      <mesh position={[-6.02, 2.35, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.2, 4.7]} />
        <meshStandardMaterial color="#edf1e7" roughness={0.94} />
      </mesh>
      <mesh position={[6.02, 2.35, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.2, 4.7]} />
        <meshStandardMaterial color="#edf1e7" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.09, -4.04]}>
        <boxGeometry args={[12, 0.18, 0.08]} />
        <meshStandardMaterial color="#b9c5b0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.34, -4.02]}>
        <boxGeometry args={[12, 0.12, 0.05]} />
        <meshStandardMaterial color="#8fa18b" roughness={0.65} />
      </mesh>
      <mesh position={[5.96, 2.3, -0.7]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 1.5]} />
        <meshBasicMaterial color="#e5f3ea" />
      </mesh>
      <mesh position={[5.94, 2.3, -0.7]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[2.76, 1.66, 0.04]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.35} roughness={0.5} wireframe />
      </mesh>
      <RoomLabel text="EXPERA BIOLOGY LABORATORY" position={[-3.8, 3.35, -4.0]} height={0.12} />
      <mesh position={[4.85, 3.32, -4.0]}>
        <circleGeometry args={[0.25, 40]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      <mesh position={[4.85, 3.39, -3.975]}>
        <boxGeometry args={[0.016, 0.13, 0.006]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[4.92, 3.32, -3.972]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.012, 0.11, 0.006]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

function Scene({
  props,
  preset,
  onPresetChange,
}: {
  props: BiologyRoomProps;
  preset: Preset;
  onPresetChange: (preset: Preset) => void;
}) {
  const { camera } = useThree();
  const controls = useThree((state) => state.controls) as ControlsLike | null;
  const size = useThree((state) => state.size);
  const aspect = size.width / Math.max(size.height, 1);
  const desired = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const presets = useMemo(() => {
    const narrow = Math.max(0, Math.min(1.3, (1.25 - aspect) / 0.6));
    return {
      room: { pos: [0, 3.6 + narrow * 2.2, 8.6 + narrow * 5.5] as [number, number, number], target: [0, 1.25, -0.8] as [number, number, number] },
      microscope: { pos: [0.55, 2.15 + narrow * 1.2, 3.2 + narrow * 3.4] as [number, number, number], target: [0, 1.5, 0.1] as [number, number, number] },
      cabinet: { pos: [-2.1, 2.3 + narrow * 1.1, 2.5 + narrow * 2.8] as [number, number, number], target: [-2.1, 1.55, -2.6] as [number, number, number] },
    };
  }, [aspect]);

  useMemo(() => {
    const next = presets.room;
    desired.current = { pos: new THREE.Vector3(...next.pos), target: new THREE.Vector3(...next.target) };
  }, [presets]);

  useFrame((_, delta) => {
    if (preset === "custom") return;
    const next = presets[preset];
    desired.current = { pos: new THREE.Vector3(...next.pos), target: new THREE.Vector3(...next.target) };
    const target = desired.current;
    if (!target) return;
    const t = reduced ? 1 : 1 - Math.pow(0.001, Math.min(delta, 0.08));
    camera.position.lerp(target.pos, t);
    if (controls) controls.target.lerp(target.target, t);
    controls?.update?.();
  });

  const selected = props.microscopeSelected;

  return (
    <>
      <color attach="background" args={["#e9eee4"]} />
      <fog attach="fog" args={["#e9eee4", 14, 28]} />
      <ambientLight intensity={0.52} />
      <hemisphereLight args={["#f7fbf2", "#c5ccbc", 0.9]} />
      <directionalLight
        position={[4.4, 6.4, 5.2]}
        intensity={1.65}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-5.5, 3.5, -2]} intensity={0.65} color="#d9f99d" />
      <pointLight position={[5.6, 2.5, -0.4]} intensity={4.8} distance={7} color="#ecfeff" />
      <pointLight position={[-3, 2.2, 2]} intensity={2.2} distance={6} color="#fef3c7" />

      <RoomShell />
      <Bench />
      <SpecimenCabinet specimens={props.specimens} activeId={props.activeSpecimenId} onSelect={props.onSelectSpecimen} />
      <SlideCollection />
      <PrepBench />
      <NoticeWall />
      <Teacher message={props.teacherHint} />

      <group
        position={[0, 1.065, 0.52]}
        scale={0.58}
        onPointerDown={(event) => {
          event.stopPropagation();
          props.onSelectMicroscope(props.model.id);
        }}
      >
        <CompoundMicroscope
          model={props.model}
          objectiveId={props.objectiveId}
          focusOffsetMicrometres={props.focusOffsetMicrometres}
          illuminationPower={props.illumination.power}
          illuminationIntensity={props.illumination.intensity}
          mirrorAligned={props.illumination.mirrorAligned}
          specimen={props.specimen}
          slide={props.slide}
          selectedPart={props.selectedPart}
          onInspectPart={props.onInspectPart}
          onStageClick={props.onStageClick}
          onClipClick={props.onClipClick}
        />
        {selected ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <torusGeometry args={[0.39, 0.012, 8, 40]} />
            <meshBasicMaterial color="#2dd4bf" toneMapped={false} />
          </mesh>
        ) : null}
      </group>
      <IdleMicroscope position={[-2.15, 1.07, 0.5]} onSelect={() => props.onSelectMicroscope(props.model.id)} />
      <IdleMicroscope position={[2.15, 1.07, 0.5]} onSelect={() => props.onSelectMicroscope(props.model.id)} />

      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 0, 2.1]}>
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.23, 0.07, 28]} />
            <meshStandardMaterial color="#0f766e" roughness={0.55} />
          </mesh>
          {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((a) => (
            <mesh key={a} position={[Math.cos(a) * 0.16, 0.26, Math.sin(a) * 0.16]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.52, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      <ContactShadows position={[0, 0.012, 0]} opacity={0.36} scale={16} blur={2.4} far={6} color="#4b5563" />

      <OrbitControls
        makeDefault
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={2.2}
        maxDistance={13}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI / 2.03}
        target={[0, 1.25, -0.8]}
        onStart={() => {
          desired.current = null;
          onPresetChange("custom");
        }}
      />
    </>
  );
}

export default function BiologyLabRoom3D(props: BiologyRoomProps) {
  const [preset, setPreset] = useState<Preset>("room");
  const [webgl] = useState(() => detectWebGL());

  if (!webgl) {
    return (
      <div className="grid gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">This device cannot show the 3D laboratory.</p>
        <p>The 2D bench remains fully usable. All microscope and specimen controls are available outside the canvas.</p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-emerald-900/20 bg-emerald-50 shadow-inner"
      aria-label="Interactive 3D Biology laboratory with microscope workstations, specimen storage, prepared slides, a slide preparation bench and a notice board. Click a microscope or specimen jar. All actions are also available in the control panels below."
    >
      <div className="h-[420px] w-full sm:h-[560px]">
        <Canvas camera={{ position: [0, 4.4, 9.5], fov: 44 }} dpr={[1, 1.6]} shadows gl={{ antialias: true }}>
          <Scene props={props} preset={preset} onPresetChange={setPreset} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-end gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
          {(["room", "microscope", "cabinet"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreset(value)}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold capitalize shadow-sm transition ${preset === value ? "bg-emerald-800 text-white" : "bg-white/90 text-slate-700 hover:bg-white"}`}
            >
              {value === "room" ? "Room" : value === "microscope" ? "Microscopes" : "Specimens"}
            </button>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-xl border border-white/70 bg-white/88 px-3 py-2 text-xs text-slate-700 shadow-lg backdrop-blur">
          <span className="font-semibold text-slate-900">{props.model.name}</span>
          <span className="ml-2 text-slate-500">
            {props.slide?.onStage ? "slide on stage" : "no slide on stage"}
            {props.selectedPart ? ` · inspecting ${props.selectedPart.replace(/-/g, " ")}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
