"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MicroscopeModelSpec, SpecimenSpec } from "@/lib/content/biology";
import type { SlideState } from "@/lib/engine/biology/microscopy";
import { detectWebGL, prefersReducedMotion } from "@/lib/device";
import { LabMenu } from "@/components/lab/LabMenu";
import { useLabReadySignal } from "@/components/lab/LabExperience";

type Preset = "room" | "bench" | "wide" | "custom";
type ControlsLike = { enabled: boolean; target: THREE.Vector3; update?: () => void };

const ROOM_MODEL = "/models/chemical_laboratory.glb";
const ROOM_SCALE = 16;
const ROOM_OFFSET: [number, number, number] = [0, 0, 0];

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

const HIDDEN_ROOM_NODES = /^(pPlane26|pPlane27|pPlane40)(_|$)/;

function LabRoomModel() {
  const { scene } = useGLTF(ROOM_MODEL);
  const markReady = useLabReadySignal();

  useEffect(() => {
    markReady?.();
  }, [markReady]);

  const model = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((object) => {
      if (HIDDEN_ROOM_NODES.test(object.name)) {
        object.visible = false;
        return;
      }
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    return cloned;
  }, [scene]);

  return <primitive object={model} position={ROOM_OFFSET} scale={ROOM_SCALE} />;
}

function Scene({ preset, onPresetChange }: { preset: Preset; onPresetChange: (preset: Preset) => void }) {
  const { camera } = useThree();
  const controls = useThree((state) => state.controls) as ControlsLike | null;
  const size = useThree((state) => state.size);
  const aspect = size.width / Math.max(size.height, 1);
  const desired = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const presets = useMemo(() => {
    const narrow = Math.max(0, Math.min(1.3, (1.25 - aspect) / 0.6));
    return {
      room: {
        pos: [0, 2.9 + narrow * 1.0, 8.4 + narrow * 3.2] as [number, number, number],
        target: [0, 0.85, 0] as [number, number, number],
      },
      bench: {
        pos: [0, 1.8 + narrow * 0.7, 5.6 + narrow * 2.2] as [number, number, number],
        target: [0, 0.8, 0.3] as [number, number, number],
      },
      wide: {
        pos: [3.8, 2.8 + narrow * 0.9, 7.6 + narrow * 2.8] as [number, number, number],
        target: [-0.2, 0.85, -0.3] as [number, number, number],
      },
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

  return (
    <>
      <color attach="background" args={["#e9eee4"]} />
      <fog attach="fog" args={["#e9eee4", 18, 34]} />
      <ambientLight intensity={0.68} />
      <hemisphereLight args={["#f7fbf2", "#c5ccbc", 1.05]} />
      <directionalLight
        position={[5.5, 8.5, 6.5]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 4.5, -3]} intensity={0.6} color="#d9f99d" />
      <pointLight position={[4, 2.4, 3]} intensity={2.4} distance={9} color="#ecfeff" />

      <Suspense fallback={null}>
        <LabRoomModel />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={14}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.15}
        minAzimuthAngle={-Math.PI / 2.4}
        maxAzimuthAngle={Math.PI / 2.4}
        target={[0, 0.9, 0]}
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
  const markReady = useLabReadySignal();

  useEffect(() => {
    if (!webgl) markReady?.();
  }, [markReady, webgl]);

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
      aria-label="Interactive 3D Biology laboratory built from the chemical laboratory room. Drag to orbit, scroll to zoom. All microscope and specimen actions are also available in the control panels below."
    >
      <div className="h-[clamp(300px,60vh,560px)] w-full">
        <Canvas camera={{ position: [0, 2.9, 8.4], fov: 44 }} dpr={[1, 1.6]} shadows gl={{ antialias: true }}>
          <Scene preset={preset} onPresetChange={setPreset} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-end gap-2 p-3">
        <div className="pointer-events-auto">
          <LabMenu label="Camera controls">
            <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              {(["room", "bench", "wide"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreset(value)}
                  className={`min-h-10 w-full justify-center rounded-lg px-3 text-xs font-semibold capitalize shadow-sm transition sm:min-h-9 sm:w-auto ${preset === value ? "bg-emerald-800 text-white" : "bg-white/90 text-slate-700 hover:bg-white"}`}
                >
                  {value === "room" ? "Room" : value === "bench" ? "Bench" : "Wide"}
                </button>
              ))}
            </div>
          </LabMenu>
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
