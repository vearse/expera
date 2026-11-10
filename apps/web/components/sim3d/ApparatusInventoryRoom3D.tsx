"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Apparatus } from "@/lib/content/schemas";
import { detectWebGL } from "@/lib/device";
import { useLabReadySignal } from "@/components/lab/LabExperience";
import { ApparatusModel } from "./apparatusModels";
import {
  APPARATUS_LAB_ROOM,
  ChemistryLabRoom,
  RoomLabel,
  SHELF_COLS,
  SHELF_SCALE,
  SHELF_TIERS,
  SHELF_X,
  SHELF_Z,
  type LabRoomConfig,
} from "./ChemistryLabRoom";

export type InventorySubject = "physics" | "biology";

type Props = {
  items: Apparatus[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  title: string;
  teacherHint: string;
  subject: InventorySubject;
};

const SUBJECT_THEMES: Record<InventorySubject, Pick<LabRoomConfig, "subjectLabel" | "wallChart">> = {
  physics: {
    subjectLabel: "EXPERA PHYSICS LABORATORY",
    wallChart: "measurement",
  },
  biology: {
    subjectLabel: "EXPERA BIOLOGY LABORATORY",
    wallChart: "biology",
  },
};

function ShelfItem({
  item,
  position,
  selected,
  onSelect,
  onHover,
}: {
  item: Apparatus;
  position: [number, number, number];
  selected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group
      position={position}
      scale={SHELF_SCALE}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        onHover(item.id);
        if (typeof document !== "undefined") document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        if (typeof document !== "undefined") document.body.style.cursor = "";
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
    >
      <ApparatusModel id={item.id} active={selected || hovered} lit={selected || hovered} />
    </group>
  );
}

function Scene({ items, selectedId, title, teacherHint, onSelect, subject }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const { camera } = useThree();
  const controls = useThree((state) => state.controls) as { target: THREE.Vector3; update?: () => void } | null;
  const desired = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const config = useMemo(
    () => ({
      ...APPARATUS_LAB_ROOM,
      ...SUBJECT_THEMES[subject],
      shelfLabel: title.toUpperCase(),
      notice: {
        eyebrow: "Laboratory guide",
        title,
        subtitle: "Find it. Name it. Use it safely.",
        lines: [
          "Click any item on the shelves to inspect it.",
          "The short detail stays inside the 3D room.",
          "The full guide opens below the room.",
          "Rotate and zoom to study each item closely.",
        ],
        footer: "Ask your teacher if you are unsure.",
      },
      teacher: APPARATUS_LAB_ROOM.teacher ? { ...APPARATUS_LAB_ROOM.teacher, message: teacherHint } : null,
    }),
    [subject, teacherHint, title],
  );

  const positioned = useMemo(() => {
    const slots: { item: Apparatus; position: [number, number, number] }[] = [];
    items.forEach((item, index) => {
      const unit = Math.min(Math.floor(index / 12), 1);
      const within = index % 12;
      const tier = Math.floor(within / 4);
      const col = within % 4;
      slots.push({
        item,
        position: [SHELF_X[unit] + SHELF_COLS[col], SHELF_TIERS[tier] + 0.036, SHELF_Z],
      });
    });
    return slots;
  }, [items]);

  const labelEntry = positioned.find((entry) => entry.item.id === (hoverId ?? selectedId)) ?? null;
  const selectedEntry = positioned.find((entry) => entry.item.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedEntry) return;
    const [x, y, z] = selectedEntry.position;
    desired.current = {
      pos: new THREE.Vector3(x, y + 1.05, z + 2.7),
      target: new THREE.Vector3(x, y + 0.16, z),
    };
  }, [selectedEntry]);

  useFrame((_, delta) => {
    const next = desired.current;
    if (!next) return;
    const t = 1 - Math.pow(0.001, Math.min(delta, 0.08));
    camera.position.lerp(next.pos, t);
    if (controls) {
      controls.target.lerp(next.target, t);
      controls.update?.();
    }
  });

  return (
    <>
      <ChemistryLabRoom config={config} />
      {positioned.map(({ item, position }) => (
        <ShelfItem key={item.id} item={item} position={position} selected={item.id === selectedId} onSelect={onSelect} onHover={setHoverId} />
      ))}
      <RoomLabel
        text={labelEntry?.item.name ?? " "}
        position={[
          labelEntry?.position[0] ?? 0,
          (labelEntry?.position[1] ?? 0) + 0.04,
          labelEntry?.position[2] ?? 0,
        ]}
        height={0.14}
        opacity={labelEntry ? 1 : 0}
      />
      <OrbitControls
        makeDefault
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={2.4}
        maxDistance={11}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.04}
        target={[0, 1.65, -1.3]}
        onStart={() => {
          desired.current = null;
        }}
      />
    </>
  );
}

export default function ApparatusInventoryRoom3D(props: Props) {
  const [webgl, setWebgl] = useState(false);
  const [checked, setChecked] = useState(false);
  const markReady = useLabReadySignal();

  useEffect(() => {
    setWebgl(detectWebGL());
    setChecked(true);
  }, []);

  useEffect(() => {
    if (checked && !webgl) markReady?.();
  }, [checked, markReady, webgl]);

  if (!webgl) {
    return (
      <div className="grid gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
        <p className="font-semibold">This device cannot show the 3D storeroom.</p>
        <p>Use the apparatus list below to select an item and read its guide.</p>
      </div>
    );
  }

  const selected = props.items.find((item) => item.id === props.selectedId) ?? null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-200 shadow-inner" aria-label={`Interactive 3D ${props.title}. Click an apparatus on the shelves to inspect it.`}>
      <div className="h-[clamp(300px,60vh,560px)] w-full">
        <Canvas
          camera={{ position: [0, 3.9, 8.4], fov: 44 }}
          onCreated={() => markReady?.()}
          dpr={[1, 1.6]}
          shadows
          gl={{ antialias: true }}
        >
          <Scene {...props} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto grid max-w-[19rem] gap-2">
          <div className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-lg backdrop-blur">
            <span className="mr-2 inline-block size-2 rounded-full bg-sky-500" />
            <strong className="text-slate-950">{props.title}</strong>
            <span className="ml-2 text-slate-500">{props.items.length} items</span>
          </div>
          {selected ? (
            <div className="rounded-xl border border-sky-200 bg-white/95 p-3 text-slate-700 shadow-lg backdrop-blur" aria-live="polite">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Selected apparatus</p>
              <p className="text-sm font-bold text-slate-950">{selected.name}</p>
              <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed">{selected.use}</p>
              <p className="mt-1.5 text-[10px] font-semibold text-sky-700">View the full guide below the room ↓</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-lg backdrop-blur">
          Click an apparatus · drag to orbit · scroll or pinch to zoom
        </div>
        <div className="pointer-events-auto rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-[11px] font-semibold text-sky-800 shadow-lg backdrop-blur">
          {selected ? selected.name : "Choose an item"}
        </div>
      </div>
    </div>
  );
}
