"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Apparatus } from "@/lib/content/schemas";
import { detectWebGL } from "@/lib/device";
import { ApparatusModel, getApparatusHeight } from "./apparatusModels";
import {
  APPARATUS_LAB_ROOM,
  BENCH_COLS,
  BENCH_DX,
  BENCH_SCALE,
  BENCH_TOP,
  BENCH_X0,
  ChemistryLabRoom,
  RoomLabel,
  SHELF_COLS,
  SHELF_SCALE,
  SHELF_TIERS,
  SHELF_X,
  SHELF_Z,
} from "./ChemistryLabRoom";

type Preset = "room" | "shelves" | "bench" | "top" | "custom";
type ControlsLike = { enabled: boolean; target: THREE.Vector3; update?: () => void };

type RoomProps = {
  items: Apparatus[];
  selectedId: string | null;
  bench: string[];
  onSelect: (id: string) => void;
  onMoveToBench: (id: string) => void;
  onReturnToShelf: (id: string) => void;
  onReorderBench: (ids: string[]) => void;
  onClearBench: () => void;
  teacherHint: string;
};

function ApparatusObject({
  id,
  position,
  scale,
  selected,
  dragging,
  fromBench,
  onSelect,
  onDragStart,
  onToggle,
  onHover,
}: {
  id: string;
  position: [number, number, number];
  scale: number;
  selected: boolean;
  dragging: boolean;
  fromBench: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, fromBench: boolean) => void;
  onToggle: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      scale={scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        onHover(id);
        document.body.style.cursor = dragging ? "grabbing" : "grab";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "default";
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(id);
        onDragStart(id, fromBench);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onToggle(id);
      }}
    >
      <ApparatusModel id={id} active={selected || hovered} lit={selected || hovered} />
    </group>
  );
}

type DragInfo = { id: string; fromBench: boolean };

function FloatingLabel({ entry }: { entry: { item: Apparatus; position: [number, number, number]; scale: number } | null }) {
  const y = entry ? entry.position[1] + getApparatusHeight(entry.item.id) * entry.scale + 0.09 : -6;
  return (
    <RoomLabel
      text={entry?.item.name ?? " "}
      position={[entry?.position[0] ?? 0, y, entry?.position[2] ?? 0]}
      height={0.14}
      opacity={entry ? 1 : 0}
    />
  );
}

function RoomScene({ items, selectedId, bench, teacherHint, preset, onPresetChange, onSelect, onMoveToBench, onReturnToShelf, onReorderBench }: RoomProps & { preset: Preset; onPresetChange: (p: Preset) => void }) {
  const { camera, gl } = useThree();
  const size = useThree((state) => state.size);
  const controls = useThree((state) => state.controls) as ControlsLike | null;
  const aspect = size.width / Math.max(size.height, 1);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragPoint, setDragPoint] = useState<THREE.Vector3 | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const dragInfo = useRef<DragInfo | null>(null);
  const pointRef = useRef(new THREE.Vector3());
  const desired = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -BENCH_TOP), []);

  const onBench = useMemo(() => new Set(bench), [bench]);

  const shelfSlots = useMemo(() => {
    const slots: { id: string; position: [number, number, number] }[] = [];
    items.forEach((item, index) => {
      const unit = Math.min(Math.floor(index / 12), 1);
      const within = index % 12;
      const tier = Math.floor(within / 4);
      const col = within % 4;
      slots.push({
        id: item.id,
        position: [SHELF_X[unit] + SHELF_COLS[col], SHELF_TIERS[tier] + 0.036, SHELF_Z],
      });
    });
    return slots;
  }, [items]);

  const slotById = useMemo(() => new Map(shelfSlots.map((slot) => [slot.id, slot.position])), [shelfSlots]);

  const benchPositions = useMemo(() => {
    const positions = new Map<string, [number, number, number]>();
    bench.forEach((id, index) => {
      const row = Math.floor(index / BENCH_COLS);
      const col = index % BENCH_COLS;
      positions.set(id, [BENCH_X0 + col * BENCH_DX, BENCH_TOP, 0.2 + row * 0.45]);
    });
    return positions;
  }, [bench]);

  const cameraPresets = useMemo(() => {
    const narrow = Math.max(0, Math.min(1.35, (1.25 - aspect) / 0.6));
    return {
      room: { pos: [0, 3.3 + narrow * 2.3, 7.4 + narrow * 5.5] as [number, number, number], target: [0, 1.25, -0.9] as [number, number, number] },
      shelves: { pos: [0, 2.5 + narrow * 0.9, 2.2 + narrow * 4.6] as [number, number, number], target: [0, 1.95, -2.8] as [number, number, number] },
      bench: { pos: [0, 2.15 + narrow * 0.7, 3.55 + narrow * 3.3] as [number, number, number], target: [0, 1.02, 0.5] as [number, number, number] },
      top: { pos: [0, 8.6 + narrow * 4.2, 1.65 + narrow * 1.5] as [number, number, number], target: [0, 0.6, 0.5] as [number, number, number] },
    };
  }, [aspect]);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const fov = aspect < 1 ? 58 : 44;
    if (Math.abs(camera.fov - fov) > 0.1) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [aspect, camera]);

  useEffect(() => {
    if (preset === "custom") return;
    const next = cameraPresets[preset];
    desired.current = { pos: new THREE.Vector3(...next.pos), target: new THREE.Vector3(...next.target) };
  }, [cameraPresets, preset]);

  useFrame((_, delta) => {
    const next = desired.current;
    if (!next) return;
    const t = 1 - Math.pow(0.001, Math.min(delta, 0.08));
    camera.position.lerp(next.pos, t);
    if (controls) controls.target.lerp(next.target, t);
    controls?.update?.();
    if (camera.position.distanceTo(next.pos) < 0.025) {
      camera.position.copy(next.pos);
      if (controls) {
        controls.target.copy(next.target);
        controls.update?.();
      }
      desired.current = null;
    }
  });

  const beginDrag = useCallback(
    (id: string, fromBench: boolean) => {
      const start = fromBench ? benchPositions.get(id) ?? [0, BENCH_TOP, 0.5] : slotById.get(id) ?? [0, BENCH_TOP, 0.5];
      pointRef.current.set(start[0], fromBench ? BENCH_TOP : start[1], Math.max(start[2], -3.2));
      dragInfo.current = { id, fromBench };
      setDragId(id);
      setDragPoint(pointRef.current.clone());
      if (controls) controls.enabled = false;
    },
    [benchPositions, controls, slotById],
  );

  useEffect(() => {
    if (!dragId) return;
    const canvas = gl.domElement;
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(dragPlane, hit)) return;
      hit.x = THREE.MathUtils.clamp(hit.x, -2.3, 2.3);
      hit.z = THREE.MathUtils.clamp(hit.z, -3.25, 1.45);
      hit.y = BENCH_TOP;
      pointRef.current.copy(hit);
      setDragPoint(hit.clone());
    };
    const finish = () => {
      const info = dragInfo.current;
      if (info) {
        const point = pointRef.current;
        const overBench = point.x > -2.45 && point.x < 2.45 && point.z > -0.5 && point.z < 1.5;
        const overShelf = point.z < -2.35;
        if (overBench) {
          if (!info.fromBench) onMoveToBench(info.id);
          else {
            const remaining = bench.filter((id) => id !== info.id);
            const target = THREE.MathUtils.clamp(Math.round((point.x - BENCH_X0) / BENCH_DX), 0, remaining.length);
            const next = [...remaining.slice(0, target), info.id, ...remaining.slice(target)];
            if (next.join("|") !== bench.join("|")) onReorderBench(next);
          }
        } else if (overShelf && info.fromBench) {
          onReturnToShelf(info.id);
        }
      }
      dragInfo.current = null;
      setDragId(null);
      setDragPoint(null);
      if (controls) controls.enabled = true;
    };
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [bench, camera, controls, dragId, dragPlane, gl.domElement, ndc, onMoveToBench, onReorderBench, onReturnToShelf, raycaster]);

  const visibleItems = items.map((item) => {
    const onBenchItem = onBench.has(item.id);
    const base = onBenchItem ? benchPositions.get(item.id) ?? [0, BENCH_TOP, 0.5] : shelfSlots.find((slot) => slot.id === item.id)?.position ?? [0, 0, 0];
    const isDragging = dragId === item.id;
    const position: [number, number, number] = isDragging && dragPoint ? [dragPoint.x, dragPoint.y + 0.04, dragPoint.z] : base;
    return {
      item,
      position,
      scale: isDragging ? 0.7 : onBenchItem ? BENCH_SCALE : SHELF_SCALE,
      onBenchItem,
      isDragging,
    };
  });

  return (
    <>
      <ChemistryLabRoom
        config={{
          ...APPARATUS_LAB_ROOM,
          teacher: APPARATUS_LAB_ROOM.teacher ? { ...APPARATUS_LAB_ROOM.teacher, message: teacherHint } : null,
        }}
      />

      {visibleItems.map(({ item, position, scale, onBenchItem, isDragging }) => (
        <ApparatusObject
          key={item.id}
          id={item.id}
          position={position}
          scale={scale}
          selected={item.id === selectedId}
          dragging={isDragging}
          fromBench={onBenchItem}
          onSelect={onSelect}
          onDragStart={beginDrag}
          onToggle={(id) => (onBench.has(id) ? onReturnToShelf(id) : onMoveToBench(id))}
          onHover={setHoverId}
        />
      ))}

      {dragId ? (
        <mesh position={[0, BENCH_TOP + 0.004, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.95, 1.92]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.16} depthWrite={false} />
        </mesh>
      ) : null}

      <FloatingLabel entry={visibleItems.find((entry) => entry.item.id === (hoverId ?? selectedId)) ?? null} />

      <OrbitControls
        makeDefault
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={2.2}
        maxDistance={12}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI / 2.02}
        target={[0, 1.25, -0.9]}
        onStart={() => {
          desired.current = null;
          onPresetChange("custom");
        }}
      />
    </>
  );
}

export default function ApparatusRoom3D(props: RoomProps) {
  const [preset, setPreset] = useState<Preset>("room");
  const [webgl] = useState(() => detectWebGL());

  if (!webgl) {
    return (
      <div className="grid gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">This device cannot show the 3D laboratory.</p>
        <p>WebGL is turned off or unavailable. Use the apparatus shelves list below to select equipment and still complete the challenges.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-200 shadow-inner" aria-label="Interactive 3D laboratory room with apparatus shelves, a workbench, a notice board and a teacher. Select, drag and inspect equipment.">
      <div className="h-[560px] w-full">
        <Canvas camera={{ position: [0, 4.2, 9.4], fov: 44 }} dpr={[1, 1.6]} shadows gl={{ antialias: true }}>
          <RoomScene {...props} preset={preset} onPresetChange={setPreset} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-end gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
          {(["room", "shelves", "bench", "top"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreset(value)}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold capitalize shadow-sm transition ${preset === value ? "bg-sky-700 text-white" : "bg-white/90 text-slate-700 hover:bg-white"}`}
            >
              {value === "room" ? "Room" : value === "shelves" ? "Shelves" : value === "bench" ? "Bench" : "Top"}
            </button>
          ))}
        </div>
      </div>

      {(() => {
        const selected = props.items.find((item) => item.id === props.selectedId) ?? null;
        if (!selected) return null;
        return (
          <div className="pointer-events-auto absolute left-3 top-16 max-w-[18rem] rounded-xl border border-sky-200 bg-white/95 p-3 text-slate-700 shadow-lg backdrop-blur" aria-live="polite">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Selected apparatus</p>
            <p className="text-sm font-bold text-slate-950">{selected.name}</p>
            <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed">{selected.use}</p>
            <p className="mt-1.5 text-[10px] font-semibold text-sky-700">View the full guide below the room ↓</p>
          </div>
        );
      })()}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-xl border border-white/70 bg-white/85 px-3 py-2 text-xs text-slate-700 shadow-lg backdrop-blur">
          <span className="font-semibold text-slate-900">{props.bench.length}</span> on the bench
          {props.selectedId ? <span className="ml-2 text-slate-500"> · selected: {props.items.find((item) => item.id === props.selectedId)?.name}</span> : null}
        </div>
        <div className="pointer-events-auto flex gap-1.5">
          {props.bench.length > 0 ? (
            <button type="button" onClick={props.onClearBench} className="min-h-9 rounded-lg bg-white/90 px-3 text-xs font-semibold text-rose-700 shadow-sm hover:bg-white">
              Clear bench
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
