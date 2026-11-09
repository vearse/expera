"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { LabLook } from "./lab/LabLook";
import { LabRoomShell } from "./lab/LabRoomShell";
import { ShelfUnitLook, SideBenchLook, StoolLook, WorkBenchLook } from "./lab/LabFurniture";
import { LabBanner, LabNoticeBoard, LabSafetyRulesSign, LabWallChart, LabWallClock } from "./lab/LabSignage";
import { LabSafetyProps } from "./lab/LabSafetyProps";

export const BENCH_TOP = 1.03;
export const SHELF_Z = -2.96;
export const SHELF_X = [-2.95, 2.95] as const;
export const SHELF_COLS = [-0.78, -0.26, 0.26, 0.78] as const;
export const SHELF_TIERS = [1.16, 1.76, 2.36] as const;
export const SHELF_SCALE = 0.48;
export const BENCH_SCALE = 0.66;
export const BENCH_COLS = 7;
export const BENCH_X0 = -2.1;
export const BENCH_DX = 0.7;

export type LabRoomPalette = {
  background: string;
  fog: string;
  floor: string;
  floorGridMajor: string;
  floorGridMinor: string;
  wallBack: string;
  wallSide: string;
  trim: string;
  shelfFrame: string;
  shelfBoard: string;
  shelfBase: string;
  shelfBack: string;
  benchTop: string;
  benchBody: string;
  sideBenchTop: string;
  drawer: string;
  metal: string;
  accent: string;
  seat: string;
};

export type NoticeBoardConfig = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  lines: string[];
  footer?: string;
};

export type TeacherConfig = {
  name?: string;
  message: string;
  position?: [number, number, number];
  rotation?: number;
  /** When false, speech is shown in an HTML overlay instead of the 3D bubble. */
  showSpeech?: boolean;
  /** Clicking the 3D speech bubble triggers this action. */
  onSpeechClick?: () => void;
};

export type WallChart = "periodic" | "measurement" | "biology" | "none";

export type LabRoomConfig = {
  palette?: Partial<LabRoomPalette>;
  notice?: NoticeBoardConfig | null;
  teacher?: TeacherConfig | null;
  /** Interior width in world units. Defaults to 12 so existing rooms keep their layout. */
  roomWidth?: number;
  shelfLabel?: string;
  subjectLabel?: string;
  wallChart?: WallChart;
  populateShelves?: boolean;
  showShelves?: boolean;
  showWorkBench?: boolean;
  showSideBench?: boolean;
  showStools?: boolean;
  showClock?: boolean;
  showWindow?: boolean;
  showPoster?: boolean;
  showContactShadows?: boolean;
};

const DEFAULT_PALETTE: LabRoomPalette = {
  background: "#dbe7f3",
  fog: "#dbe7f3",
  floor: "#dfe7ef",
  floorGridMajor: "#b8c5d3",
  floorGridMinor: "#cfd9e3",
  wallBack: "#eef4fa",
  wallSide: "#e6eef7",
  trim: "#cbd5e1",
  shelfFrame: "#8b5e3c",
  shelfBoard: "#9a6b45",
  shelfBase: "#7c4f32",
  shelfBack: "#dce6f1",
  benchTop: "#0f2f3d",
  benchBody: "#e2e8f0",
  sideBenchTop: "#183b49",
  drawer: "#f1f5f9",
  metal: "#94a3b8",
  accent: "#0ea5e9",
  seat: "#0f766e",
};

/**
 * One shared room shell for every Practical simulation. Subject-specific rooms
 * start from this config and only override their labels, notices and furniture.
 */
export const STANDARD_TEACHER: TeacherConfig = {
  name: "Ms. Ada",
  message: "",
  position: [-5.6, 0, -1.15],
  rotation: 1.32,
};

export const STANDARD_LAB_ROOM: LabRoomConfig = {
  roomWidth: 14,
  populateShelves: true,
  palette: {
    background: "#d8e6e5",
    fog: "#d8e6e5",
    floor: "#dce8e5",
    floorGridMajor: "#aec6c1",
    floorGridMinor: "#c7d8d4",
    wallBack: "#edf5f2",
    wallSide: "#e1eeea",
    trim: "#b9d0ca",
    benchTop: "#153c3b",
    sideBenchTop: "#1b4744",
    accent: "#0f766e",
    seat: "#0d9488",
  },
};

export const APPARATUS_LAB_ROOM: LabRoomConfig = {
  ...STANDARD_LAB_ROOM,
  populateShelves: false,
  shelfLabel: "APPARATUS STORE",
  notice: {
    eyebrow: "Class notice",
    title: "Apparatus laboratory",
    subtitle: "Identify it. Pick it up. Use it safely.",
    lines: [
      "Click an apparatus to open its guide.",
      "Drag it to the workbench, or double-click it.",
      "Drag a bench item back to the shelves to return it.",
      "Read the meniscus at eye level.",
    ],
    footer: "Ask Ms. Ada if you are unsure.",
  },
  teacher: {
    ...STANDARD_TEACHER,
    message: "Choose an apparatus from the shelves. Its guide will appear below the room.",
  },
};

export const TITRATION_LAB_ROOM: LabRoomConfig = {
  ...STANDARD_LAB_ROOM,
  shelfLabel: "CHEMISTRY STORE",
  notice: {
    eyebrow: "Practical notice",
    title: "Titration laboratory",
    subtitle: "A clean burette gives a trustworthy titre.",
    lines: [
      "Rinse the burette with the acid before filling.",
      "Clear the jet, then read the start at eye level.",
      "Pipette exactly 25 cm3 of base with a filler.",
      "Swirl and add the last drops slowly.",
    ],
    footer: "Record every reading carefully.",
  },
  teacher: {
    ...STANDARD_TEACHER,
    message: "Start by rinsing the burette with a little acid.",
  },
};

function useLabelTexture(text: string) {
  const asset = useMemo(() => {
    const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d");
    const font = '600 30px system-ui, -apple-system, "Segoe UI", sans-serif';
    if (measureCtx) measureCtx.font = font;
    const textWidth = measureCtx ? measureCtx.measureText(text).width : text.length * 17;
    const pad = 22;
    const height = 58;
    const width = Math.max(48, Math.ceil(textWidth + pad * 2));
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(1, 1, width - 2, height - 2, 14);
      else ctx.rect(1, 1, width - 2, height - 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.32)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#e0f2fe";
      ctx.fillText(text, width / 2, height / 2 + 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { texture, aspect: width / height };
  }, [text]);

  useEffect(() => () => asset.texture.dispose(), [asset]);
  return asset;
}

export function RoomLabel({
  text,
  position,
  height = 0.14,
  opacity = 1,
}: {
  text: string;
  position: [number, number, number];
  height?: number;
  opacity?: number;
}) {
  const { texture, aspect } = useLabelTexture(text);
  return (
    <sprite position={position} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} fog={false} />
    </sprite>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function useSpeechTexture(name: string, message: string, accent: string) {
  const asset = useMemo(() => {
    const width = 760;
    const measure = document.createElement("canvas").getContext("2d");
    if (measure) measure.font = '600 31px system-ui, -apple-system, "Segoe UI", sans-serif';
    const lines = measure ? wrapText(measure, message, 650) : [message];
    const height = 150 + lines.length * 40;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgba(255,255,255,0.97)";
      ctx.strokeStyle = accent;
      ctx.lineWidth = 5;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(8, 8, width - 16, height - 48, 28);
      else ctx.rect(8, 8, width - 16, height - 48);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width / 2 - 22, height - 42);
      ctx.lineTo(width / 2, height - 8);
      ctx.lineTo(width / 2 + 22, height - 42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.font = '800 21px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.textAlign = "left";
      ctx.fillText(name.toUpperCase(), 64, 52);
      ctx.fillStyle = "#1e293b";
      ctx.font = '600 31px system-ui, -apple-system, "Segoe UI", sans-serif';
      lines.forEach((line, index) => ctx.fillText(line, 64, 102 + index * 40));
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { texture, aspect: width / height };
  }, [accent, message, name]);

  useEffect(() => () => asset.texture.dispose(), [asset]);
  return asset;
}

function ShelfUnit({ x, label, palette }: { x: number; label: string; palette: LabRoomPalette }) {
  return <ShelfUnitLook x={x} label={label} palette={palette} />;
}

function ShelfSupplies() {
  const colours = ["#cbd5e1", "#fbbf24", "#a5f3fc", "#fda4af", "#bbf7d0"];
  const supply = [];
  for (let unit = 0; unit < 2; unit += 1) {
    for (let tier = 0; tier < 3; tier += 1) {
      for (let col = 0; col < 3; col += 1) {
        const x = SHELF_X[unit] + SHELF_COLS[col + (tier % 2 === 0 ? 0 : 1)] - 0.08;
        const y = SHELF_TIERS[tier] + 0.08;
        const h = 0.1 + ((unit + tier + col) % 3) * 0.035;
        const colour = colours[(unit + tier + col) % colours.length];
        supply.push(
          <group key={`${unit}-${tier}-${col}`} position={[x, y, SHELF_Z + 0.02]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.045, 0.05, h, 16]} />
              <meshPhysicalMaterial color={colour} transparent opacity={0.72} roughness={0.16} metalness={0.02} clearcoat={0.7} />
            </mesh>
            <mesh position={[0, h / 2 + 0.018, 0]}>
              <cylinderGeometry args={[0.018, 0.025, 0.045, 12]} />
              <meshStandardMaterial color="#334155" roughness={0.55} />
            </mesh>
          </group>,
        );
      }
    }
  }
  return <group>{supply}</group>;
}

function WorkBench({ palette }: { palette: LabRoomPalette }) {
  return <WorkBenchLook palette={palette} />;
}

function SideBench({ palette }: { palette: LabRoomPalette }) {
  return <SideBenchLook palette={palette} />;
}

function Stool({ x, palette }: { x: number; palette: LabRoomPalette }) {
  return <StoolLook x={x} palette={palette} />;
}

function RoomShell({
  palette,
  subjectLabel,
  wallChart,
  showClock,
  showWindow,
  showPoster,
  width,
}: {
  palette: LabRoomPalette;
  subjectLabel: string;
  wallChart: WallChart;
  showClock: boolean;
  showWindow: boolean;
  showPoster: boolean;
  width: number;
}) {
  return (
    <group>
      <LabRoomShell palette={palette} width={width} showWindow={showWindow} />
      <LabBanner label={subjectLabel} palette={palette} width={width} />
      {showPoster ? <LabWallChart kind={wallChart} palette={palette} width={width} /> : null}
      {showClock ? <LabWallClock palette={palette} width={width} /> : null}
    </group>
  );
}

function NoticeBoard({ config, palette }: { config: NoticeBoardConfig; palette: LabRoomPalette }) {
  return <LabNoticeBoard config={config} palette={palette} />;
}

function Teacher({ config, palette }: { config: TeacherConfig; palette: LabRoomPalette }) {
  const name = config.name ?? "Ms. Ada";
  const showSpeech = config.showSpeech !== false && config.message.trim().length > 0;
  const { texture, aspect } = useSpeechTexture(name, showSpeech ? config.message : " ", palette.accent);
  const position = config.position ?? [-4.55, 0, -1.15];
  const rotation = config.rotation ?? 1.32;
  const speech = useRef<THREE.Sprite>(null);
  const phase = useRef(0);
  const maxBubbleWidth = 2.15;
  let baseScaleX = 1.05 * aspect;
  let baseScaleY = 1.05;
  if (baseScaleX > maxBubbleWidth) {
    const fit = maxBubbleWidth / baseScaleX;
    baseScaleX = maxBubbleWidth;
    baseScaleY *= fit;
  }
  const speechBase: [number, number, number] = [1.45, 2.22, 0.35];
  const interactive = Boolean(config.onSpeechClick);

  useFrame((_state, delta) => {
    phase.current += delta;
    if (!speech.current || !showSpeech) return;
    const bob = Math.sin(phase.current * 1.8);
    speech.current.position.y = speechBase[1] + bob * 0.022;
    const pulse = 1 + Math.sin(phase.current * 2.4) * 0.006;
    speech.current.scale.set(baseScaleX * pulse, baseScaleY * pulse, 1);
  });

  const activate = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    config.onSpeechClick?.();
  };

  return (
    <group
      position={position}
      onClick={interactive ? activate : undefined}
      onPointerOver={
        interactive
          ? (event) => {
              event.stopPropagation();
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              document.body.style.cursor = "default";
            }
          : undefined
      }
    >
      <group rotation={[0, rotation, 0]}>
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
          <meshStandardMaterial color="#f8fafc" roughness={0.72} />
        </mesh>
        <mesh position={[0, 1.31, 0.255]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.12, 0.5, 0.02]} />
          <meshStandardMaterial color={palette.accent} roughness={0.7} />
        </mesh>
        <mesh position={[0.11, 1.17, 0.29]}>
          <circleGeometry args={[0.025, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        <mesh position={[-0.11, 1.17, 0.29]}>
          <circleGeometry args={[0.025, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.43, 0.36]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.18, 0.015]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        <mesh position={[-0.36, 1.16, 0]} rotation={[0, 0, -0.18]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.64, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.72} />
        </mesh>
        <mesh position={[0.38, 1.28, 0.1]} rotation={[0.2, 0, 0.45]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.56, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.72} />
        </mesh>
        <mesh position={[0.55, 1.42, 0.28]} rotation={[0.55, 0, 0.18]}>
          <cylinderGeometry args={[0.012, 0.018, 0.62, 10]} />
          <meshStandardMaterial color="#b45309" roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.62, 0]} castShadow>
          <sphereGeometry args={[0.2, 24, 18]} />
          <meshStandardMaterial color="#8a5a3b" roughness={0.62} />
        </mesh>
        <mesh position={[0, 1.67, -0.01]} scale={[1.06, 0.8, 1.02]} castShadow>
          <sphereGeometry args={[0.205, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
          <meshStandardMaterial color="#231b18" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.6, 0.17]}>
          <boxGeometry args={[0.2, 0.025, 0.025]} />
          <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.4} />
        </mesh>
        {[-0.075, 0.075].map((x) => (
          <mesh key={x} position={[x, 1.6, 0.185]}>
            <boxGeometry args={[0.07, 0.055, 0.012]} />
            <meshStandardMaterial color="#dbeafe" transparent opacity={0.55} roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[0, 1.48, 0.19]}>
          <boxGeometry args={[0.06, 0.015, 0.015]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
        </mesh>
      </group>
      {showSpeech ? (
        <sprite ref={speech} position={speechBase} scale={[baseScaleX, baseScaleY, 1]} renderOrder={8}>
          <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
        </sprite>
      ) : null}
      {interactive ? (
        <mesh position={[0.55, 1.35, 0.45]}>
          <boxGeometry args={[1.5, 2.3, 0.9]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

export function ChemistryLabRoom({ config }: { config: LabRoomConfig }) {
  const palette = useMemo(() => ({ ...DEFAULT_PALETTE, ...config.palette }), [config.palette]);
  const showShelves = config.showShelves ?? true;
  const showWorkBench = config.showWorkBench ?? true;
  const showSideBench = config.showSideBench ?? true;
  const showStools = config.showStools ?? true;
  const showClock = config.showClock ?? true;
  const showWindow = config.showWindow ?? true;
  const showPoster = config.showPoster ?? true;
  const subjectLabel = config.subjectLabel ?? "EXPERA CHEMISTRY LABORATORY";
  const wallChart = config.wallChart ?? "periodic";
  const showContactShadows = config.showContactShadows ?? true;
  const roomWidth = config.roomWidth ?? 12;

  return (
    <>
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.fog, 22, 48]} />
      <LabLook />

      <RoomShell
        palette={palette}
        subjectLabel={subjectLabel}
        wallChart={wallChart}
        showClock={showClock}
        showWindow={showWindow}
        showPoster={showPoster}
        width={roomWidth}
      />
      {showShelves ? (
        <>
          <ShelfUnit x={SHELF_X[0]} label={config.shelfLabel ?? "APPARATUS STORE"} palette={palette} />
          <ShelfUnit x={SHELF_X[1]} label={config.shelfLabel ?? "APPARATUS STORE"} palette={palette} />
          {config.populateShelves ? <ShelfSupplies /> : null}
        </>
      ) : null}
      {showWorkBench ? <WorkBench palette={palette} /> : null}
      {showSideBench ? <SideBench palette={palette} /> : null}
      {showStools ? (
        <>
          <Stool x={-2.9} palette={palette} />
          <Stool x={2.9} palette={palette} />
        </>
      ) : null}
      {config.notice ? <NoticeBoard config={config.notice} palette={palette} /> : null}
      {config.teacher ? <Teacher config={config.teacher} palette={palette} /> : null}
      <LabSafetyProps width={roomWidth} />
      <LabSafetyRulesSign width={roomWidth} />
      {showContactShadows ? <ContactShadows position={[0, 0.012, 0]} opacity={0.32} scale={16} blur={2.6} far={6} color="#334155" /> : null}
    </>
  );
}
