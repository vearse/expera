"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Apparatus } from "@/lib/content/schemas";
import type { ApparatusPartStates } from "@/lib/sim/apparatusPartStates";
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
import { BenchNote, type BenchNoteData } from "./BenchNote";

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
  teacherHint?: string;
  benchNote?: BenchNoteData | null;
  noteContent?: ReactNode;
  noteOpen?: boolean;
  onNoteOpenChange?: (open: boolean) => void;
  onTeacherClick?: () => void;
  highlightIds?: string[];
  guidedOverlay?: ReactNode;
  selectionPanel?: ReactNode;
  viewLocked?: boolean;
  onViewLockedChange?: (locked: boolean) => void;
  fullscreen?: boolean;
  onFullscreenChange?: (open: boolean) => void;
  partStates?: ApparatusPartStates;
  onTogglePart?: (part: "bunsen-lit" | "bunsen-air") => void;
};

function ApparatusObject({
  id,
  position,
  scale,
  selected,
  highlighted,
  dragging,
  fromBench,
  onSelect,
  onDragStart,
  onToggle,
  onHover,
  viewLocked,
}: {
  id: string;
  position: [number, number, number];
  scale: number;
  selected: boolean;
  highlighted: boolean;
  dragging: boolean;
  fromBench: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, fromBench: boolean) => void;
  onToggle: (id: string) => void;
  onHover: (id: string | null) => void;
  viewLocked: boolean;
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
        if (!viewLocked) onDragStart(id, fromBench);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (!viewLocked) onToggle(id);
      }}
    >
      <ApparatusModel id={id} active={selected || hovered || highlighted} lit={selected || hovered || highlighted} />
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

const NOTE_ANCHOR: [number, number, number] = [1.62, 1.54, 0.92];

function NoteAnchor({ anchorRef }: { anchorRef: RefObject<HTMLDivElement | null> }) {
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const el = anchorRef.current;
    const node = group.current;
    if (!el || !node) return;
    node.getWorldPosition(vec);
    vec.project(camera);
    if (vec.z > 1) {
      el.style.visibility = "hidden";
      return;
    }
    const card = el.firstElementChild as HTMLElement | null;
    const cardW = card?.offsetWidth || 336;
    const cardH = card?.offsetHeight || 420;
    const marginX = 10;
    const marginTop = 52;
    const marginBottom = 58;
    const rawX = (vec.x * 0.5 + 0.5) * size.width;
    const rawY = (-vec.y * 0.5 + 0.5) * size.height;
    const minX = marginX + cardW / 2;
    const maxX = Math.max(minX, size.width - marginX - cardW / 2);
    const minY = marginTop + cardH / 2;
    const maxY = Math.max(minY, size.height - marginBottom - cardH / 2);
    const x = Math.min(maxX, Math.max(minX, rawX));
    const y = Math.min(maxY, Math.max(minY, rawY));
    el.style.visibility = "visible";
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  });

  return <group ref={group} position={NOTE_ANCHOR} />;
}

function RoomScene({
  items,
  selectedId,
  bench,
  teacherHint,
  benchNote,
  noteContent,
  noteOpen = false,
  onNoteOpenChange,
  noteAnchorRef,
  onTeacherClick,
  highlightIds = [],
  preset,
  onPresetChange,
  onSelect,
  onMoveToBench,
  onReturnToShelf,
  onReorderBench,
  viewLocked = false,
}: RoomProps & {
  preset: Preset;
  onPresetChange: (p: Preset) => void;
  viewLocked?: boolean;
  noteAnchorRef?: RefObject<HTMLDivElement | null>;
}) {
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
          teacher: APPARATUS_LAB_ROOM.teacher
            ? {
                ...APPARATUS_LAB_ROOM.teacher,
                message: teacherHint ?? "",
                showSpeech: Boolean(teacherHint),
                onSpeechClick: onTeacherClick,
              }
            : null,
        }}
      />

      {visibleItems.map(({ item, position, scale, onBenchItem, isDragging }) => (
        <ApparatusObject
          key={item.id}
          id={item.id}
          position={position}
          scale={scale}
          selected={item.id === selectedId}
          highlighted={highlightIds.includes(item.id)}
          dragging={isDragging}
          fromBench={onBenchItem}
          onSelect={onSelect}
          onDragStart={beginDrag}
          onToggle={(id) => (onBench.has(id) ? onReturnToShelf(id) : onMoveToBench(id))}
          onHover={setHoverId}
          viewLocked={viewLocked}
        />
      ))}

      {dragId ? (
        <mesh position={[0, BENCH_TOP + 0.004, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.95, 1.92]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.16} depthWrite={false} />
        </mesh>
      ) : null}

      {benchNote ? (
        <BenchNote
          data={benchNote}
          position={NOTE_ANCHOR}
          rotation={[-0.62, -0.12, 0.08]}
          width={noteContent ? 1.34 : 1.16}
          height={noteContent ? 0.94 : 0.78}
          onClick={noteContent && !noteOpen ? () => onNoteOpenChange?.(true) : undefined}
        />
      ) : null}
      {noteContent && noteOpen && noteAnchorRef ? <NoteAnchor anchorRef={noteAnchorRef} /> : null}

      <FloatingLabel entry={visibleItems.find((entry) => entry.item.id === (hoverId ?? selectedId)) ?? null} />

      <OrbitControls
        makeDefault
        enablePan={!viewLocked}
        enabled={!viewLocked}
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
  const viewLocked = props.viewLocked ?? false;
  const fullscreen = props.fullscreen ?? false;
  const noteOpen = props.noteOpen ?? false;
  const noteAnchorRef = useRef<HTMLDivElement>(null);

  const roomInner = (
    <>
      <div className={fullscreen ? "h-full min-h-[480px] w-full" : "h-[560px] w-full"}>
        <Canvas camera={{ position: [0, 4.2, 9.4], fov: 44 }} dpr={[1, 1.6]} shadows gl={{ antialias: true }}>
          <RoomScene {...props} preset={preset} onPresetChange={setPreset} viewLocked={viewLocked} noteAnchorRef={noteAnchorRef} />
        </Canvas>
      </div>

      {props.noteContent && noteOpen ? (
        <div className="pointer-events-none absolute inset-0 z-10">
          <div ref={noteAnchorRef} className="pointer-events-none absolute left-0 top-0" style={{ visibility: "hidden" }}>
            <div
              className="bench-note-ui pointer-events-auto h-[420px] w-[min(348px,46vw)] overflow-hidden rounded-lg shadow-[0_18px_40px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/10"
              data-testid="bench-note-anchor"
            >
              {props.noteContent}
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-end gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
          {props.noteContent ? (
            <button
              type="button"
              onClick={() => props.onNoteOpenChange?.(!noteOpen)}
              aria-pressed={noteOpen}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold shadow-sm transition ${noteOpen ? "bg-amber-600 text-white" : "bg-white/90 text-slate-700 hover:bg-white"}`}
            >
              {noteOpen ? "Hide note" : "Note view"}
            </button>
          ) : null}
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

      {props.selectionPanel ? (
        <div className="pointer-events-none absolute right-3 top-[8.5rem] z-20 flex max-w-[min(90%,20rem)]">
          <div className="pointer-events-auto">{props.selectionPanel}</div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-xl border border-white/70 bg-white/85 px-3 py-2 text-xs text-slate-700 shadow-lg backdrop-blur">
          <span className="font-semibold text-slate-900">{props.bench.length}</span> on the bench
          {props.selectedId ? <span className="ml-2 text-slate-500"> · selected: {props.items.find((item) => item.id === props.selectedId)?.name}</span> : null}
          {viewLocked ? <span className="ml-2 font-semibold text-amber-800"> · view locked</span> : null}
        </div>
        <div className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
          <button
            type="button"
            onClick={() => props.onViewLockedChange?.(!viewLocked)}
            className={`min-h-9 rounded-lg px-3 text-xs font-semibold shadow-sm ${viewLocked ? "bg-amber-600 text-white" : "bg-white/90 text-slate-700 hover:bg-white"}`}
          >
            {viewLocked ? "Unlock view" : "Lock view"}
          </button>
          <button
            type="button"
            onClick={() => props.onFullscreenChange?.(!fullscreen)}
            className="min-h-9 rounded-lg bg-white/90 px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
          >
            {fullscreen ? "Exit full view" : "Full view"}
          </button>
          {props.bench.length > 0 ? (
            <button type="button" onClick={props.onClearBench} className="min-h-9 rounded-lg bg-white/90 px-3 text-xs font-semibold text-rose-700 shadow-sm hover:bg-white">
              Clear bench
            </button>
          ) : null}
        </div>
      </div>
    </>
  );

  if (!webgl) {
    return (
      <div className="grid gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-3">
          <div>
            <p className="font-semibold">This device cannot show the 3D laboratory.</p>
            <p>WebGL is turned off or unavailable. Use the 2D shelf list below to select equipment and complete the same guided steps.</p>
            {props.noteContent ? (
              <button
                type="button"
                onClick={() => props.onNoteOpenChange?.(!noteOpen)}
                aria-pressed={noteOpen}
                className="mt-2 min-h-9 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
              >
                {noteOpen ? "Hide note" : "Note view"}
              </button>
            ) : null}
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2" role="list" aria-label="Apparatus shelves (2D fallback)">
            {props.items.map((apparatus) => {
              const onBench = props.bench.includes(apparatus.id);
              const selected = apparatus.id === props.selectedId;
              return (
                <div
                  key={apparatus.id}
                  role="listitem"
                  className={`flex items-center justify-between gap-2 rounded-lg border bg-white p-1.5 ${selected ? "border-sky-600 ring-1 ring-sky-300" : "border-amber-200"}`}
                >
                  <button
                    type="button"
                    onClick={() => props.onSelect(apparatus.id)}
                    className="min-w-0 flex-1 truncate px-1.5 py-1 text-left text-xs font-semibold text-slate-800"
                  >
                    {apparatus.name}
                    <span className="ml-1 font-normal text-slate-500">{onBench ? "· bench" : "· shelf"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => (onBench ? props.onReturnToShelf(apparatus.id) : props.onMoveToBench(apparatus.id))}
                    className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${onBench ? "bg-amber-100 text-amber-900" : "bg-sky-700 text-white"}`}
                  >
                    {onBench ? "Return" : "Place"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid max-h-[70vh] content-start gap-2 overflow-y-auto">
          {noteOpen || !props.noteContent ? props.noteContent ?? props.guidedOverlay : null}
          {props.selectionPanel}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        fullscreen
          ? `fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)] gap-2 bg-slate-950/90 p-3 backdrop-blur-sm ${viewLocked ? "ring-2 ring-amber-400/80" : ""}`
          : `relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-200 shadow-inner ${viewLocked ? "ring-2 ring-amber-400/80" : ""}`
      }
      role={fullscreen ? "dialog" : undefined}
      aria-label="Interactive 3D laboratory room with apparatus shelves, a workbench, a notice board and a teacher. Select, drag and inspect equipment."
    >
      {fullscreen ? (
        <div className="flex items-center justify-between px-1 text-white">
          <p className="text-sm font-semibold">Full view · press Esc to exit</p>
          <button type="button" className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25" onClick={() => props.onFullscreenChange?.(false)}>
            Exit full view
          </button>
        </div>
      ) : null}
      <div
        className={
          fullscreen
            ? "relative min-h-0 overflow-hidden rounded-2xl border border-slate-500 bg-slate-200 shadow-2xl"
            : "relative"
        }
      >
        {roomInner}
      </div>
    </div>
  );
}
