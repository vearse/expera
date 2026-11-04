"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

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
    texture.anisotropy = 4;
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

function useNoticeTexture(config: NoticeBoardConfig, accent: string) {
  const asset = useMemo(() => {
    const width = 1024;
    const height = 572;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, width, 104);
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = '700 18px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText((config.eyebrow ?? "Class notice").toUpperCase(), 48, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = '800 45px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillText(config.title, 48, 84);
    let y = 150;
    if (config.subtitle) {
      ctx.fillStyle = "#334155";
      ctx.font = '600 24px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.fillText(config.subtitle, 48, y);
      y += 46;
    }
    ctx.font = '500 25px system-ui, -apple-system, "Segoe UI", sans-serif';
    for (const line of config.lines) {
      const wrapped = wrapText(ctx, line, 840);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(58, y - 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      wrapped.forEach((part, index) => {
        ctx.fillText(part, 82, y + index * 32);
      });
      y += wrapped.length * 32 + 25;
      if (y > height - 66) break;
    }
    if (config.footer) {
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(36, height - 62, width - 72, 38);
      ctx.fillStyle = "#475569";
      ctx.font = '600 20px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.fillText(config.footer, 52, height - 37);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [accent, config]);

  useEffect(() => () => asset.dispose(), [asset]);
  return asset;
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
  return (
    <group position={[x, 0, SHELF_Z]}>
      <mesh position={[0, 1.38, -0.22]} receiveShadow>
        <boxGeometry args={[2.26, 2.78, 0.05]} />
        <meshStandardMaterial color={palette.shelfBack} roughness={0.9} />
      </mesh>
      {[-1.11, 1.11].map((side) => (
        <mesh key={side} position={[side, 1.38, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.075, 2.78, 0.52]} />
          <meshStandardMaterial color={palette.shelfFrame} roughness={0.7} />
        </mesh>
      ))}
      {[1.12, 1.72, 2.32, 2.7].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.26, 0.065, 0.52]} />
          <meshStandardMaterial color={palette.shelfBoard} roughness={0.68} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[2.26, 0.16, 0.52]} />
        <meshStandardMaterial color={palette.shelfBase} roughness={0.72} />
      </mesh>
      <RoomLabel text={label} position={[0, 2.85, 0.16]} height={0.1} />
    </group>
  );
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

function Drawer({ y, x, palette }: { y: number; x: number; palette: LabRoomPalette }) {
  return (
    <group position={[x, y, 0.81]}>
      <mesh castShadow>
        <boxGeometry args={[1.32, 0.22, 0.035]} />
        <meshStandardMaterial color={palette.drawer} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.02, 0.035]}>
        <boxGeometry args={[0.34, 0.026, 0.03]} />
        <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function WorkBench({ palette }: { palette: LabRoomPalette }) {
  return (
    <group position={[0, 0, 0.48]}>
      <RoundedBox args={[5.05, 0.13, 1.95]} radius={0.035} smoothness={4} position={[0, BENCH_TOP - 0.065, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={palette.benchTop} roughness={0.38} metalness={0.08} clearcoat={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.53, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[4.7, 0.82, 1.64]} />
        <meshStandardMaterial color={palette.benchBody} roughness={0.72} />
      </mesh>
      {[-1.55, 0, 1.55].map((x, i) => (
        <Drawer key={x} x={x} y={0.79 - i * 0.001} palette={palette} />
      ))}
      {[-1.55, 0, 1.55].map((x) => (
        <Drawer key={`low-${x}`} x={x} y={0.52} palette={palette} />
      ))}
      <mesh position={[0, 1.18, -0.96]} castShadow>
        <boxGeometry args={[5.05, 0.32, 0.06]} />
        <meshStandardMaterial color={palette.trim} roughness={0.7} />
      </mesh>
      <mesh position={[2.26, BENCH_TOP - 0.01, -0.36]} receiveShadow>
        <boxGeometry args={[0.5, 0.02, 0.42]} />
        <meshStandardMaterial color="#475569" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[2.26, BENCH_TOP + 0.12, -0.34]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.24, 16]} />
        <meshStandardMaterial color={palette.metal} metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh position={[2.26, BENCH_TOP + 0.24, -0.27]} rotation={[Math.PI / 3, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.2, 16]} />
        <meshStandardMaterial color={palette.metal} metalness={0.9} roughness={0.22} />
      </mesh>
      {[-2.25, 2.25].map((x) => (
        <mesh key={x} position={[x, 0.08, 0.62]} castShadow>
          <boxGeometry args={[0.13, 0.16, 0.13]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function SideBench({ palette }: { palette: LabRoomPalette }) {
  return (
    <group position={[5.25, 0, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[3.6, 0.12, 1.15]} radius={0.03} smoothness={4} position={[0, 0.97, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={palette.sideBenchTop} roughness={0.4} metalness={0.08} clearcoat={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.5, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[3.35, 0.78, 0.94]} />
        <meshStandardMaterial color={palette.benchBody} roughness={0.72} />
      </mesh>
      <mesh position={[-1.05, 0.66, 0.46]}>
        <boxGeometry args={[1.15, 0.22, 0.03]} />
        <meshStandardMaterial color={palette.drawer} roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.66, 0.46]}>
        <boxGeometry args={[1.15, 0.22, 0.03]} />
        <meshStandardMaterial color={palette.drawer} roughness={0.6} />
      </mesh>
      <mesh position={[-1.05, 0.68, 0.48]}>
        <boxGeometry args={[0.32, 0.024, 0.03]} />
        <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, 0.68, 0.48]}>
        <boxGeometry args={[0.32, 0.024, 0.03]} />
        <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.3} />
      </mesh>
      <group position={[-1.05, 1.03, 0]}>
        <RoundedBox args={[0.72, 0.04, 0.5]} radius={0.02} smoothness={3}>
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.25} />
        </RoundedBox>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.58, 0.02, 0.36]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.16, -0.18]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.3, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.3, -0.09]} rotation={[Math.PI / 2.8, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.24, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      <mesh position={[1.3, 1.12, -0.4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
        <meshStandardMaterial color={palette.accent} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[1.3, 1.28, -0.31]} rotation={[Math.PI / 3, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.22, 16]} />
        <meshStandardMaterial color={palette.accent} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Stool({ x, palette }: { x: number; palette: LabRoomPalette }) {
  return (
    <group position={[x, 0, 1.85]}>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.23, 0.07, 28]} />
        <meshStandardMaterial color={palette.seat} roughness={0.55} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.16, 0.26, Math.sin(a) * 0.16]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.52, 12]} />
          <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 0]}>
        <torusGeometry args={[0.22, 0.012, 8, 32]} />
        <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function PeriodicPoster({ palette, width }: { palette: LabRoomPalette; width: number }) {
  const cells = useMemo(() => {
    const out: { x: number; y: number; color: string }[] = [];
    const colours = ["#38bdf8", "#0ea5e9", "#f59e0b", "#f43f5e", "#22c55e", "#a855f7", "#14b8a6", "#eab308"];
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < 12; col += 1) {
        if (row === 0 && col > 0 && col < 11) continue;
        out.push({ x: -0.54 + col * 0.094, y: 0.22 - row * 0.085, color: colours[(row + col) % colours.length] });
      }
    }
    return out;
  }, []);
  return (
    <group position={[-width / 2 + 0.08, 2.25, -0.55]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[1.35, 0.95]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {cells.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, 0.008]}>
          <planeGeometry args={[0.07, 0.064]} />
          <meshBasicMaterial color={c.color} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.36, 0.01]}>
        <planeGeometry args={[0.8, 0.055]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
    </group>
  );
}

function MeasurementPoster({ palette, width }: { palette: LabRoomPalette; width: number }) {
  return (
    <group position={[-width / 2 + 0.08, 2.25, -0.55]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[1.35, 0.95]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.36, 0.008]}>
        <planeGeometry args={[1.16, 0.11]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
      {Array.from({ length: 15 }).map((_, index) => (
        <mesh key={`top-${index}`} position={[-0.56 + index * 0.08, 0.28, 0.009]}>
          <planeGeometry args={[index % 5 === 0 ? 0.018 : 0.009, index % 5 === 0 ? 0.11 : 0.065]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}
      {[0.02, -0.12, -0.26].map((y, row) => (
        <group key={y}>
          <mesh position={[-0.38, y, 0.008]}>
            <planeGeometry args={[0.48 + row * 0.12, 0.052]} />
            <meshBasicMaterial color={["#0e7490", "#38bdf8", "#94a3b8"][row]} />
          </mesh>
          <mesh position={[0.38, y, 0.008]}>
            <planeGeometry args={[0.28, 0.052]} />
            <meshBasicMaterial color={["#f59e0b", "#0f766e", "#cbd5e1"][row]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.36, 0.19, 0.009]}>
        <circleGeometry args={[0.11, 28]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
      <mesh position={[0.36, 0.19, 0.011]}>
        <circleGeometry args={[0.045, 24]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-0.12, -0.38, 0.009]}>
        <planeGeometry args={[0.9, 0.035]} />
        <meshBasicMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}

function BiologyPoster({ palette, width }: { palette: LabRoomPalette; width: number }) {
  return (
    <group position={[-width / 2 + 0.08, 2.25, -0.55]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[1.35, 0.95]} />
        <meshStandardMaterial color="#f6faf2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.36, 0.008]}>
        <planeGeometry args={[1.16, 0.11]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
      <mesh position={[-0.29, 0.02, 0.009]}>
        <circleGeometry args={[0.26, 40]} />
        <meshBasicMaterial color="#b8d4b5" />
      </mesh>
      <mesh position={[-0.29, 0.02, 0.011]}>
        <circleGeometry args={[0.11, 32]} />
        <meshBasicMaterial color="#5b8a5a" />
      </mesh>
      {[
        [-0.43, 0.12, "#8fb56a"],
        [-0.19, -0.08, "#c7a5d8"],
        [-0.37, -0.15, "#65b9a8"],
        [-0.1, 0.16, "#e8b4b8"],
      ].map(([x, y, color], index) => (
        <mesh key={index} position={[Number(x), Number(y), 0.013]}>
          <circleGeometry args={[0.045, 20]} />
          <meshBasicMaterial color={String(color)} />
        </mesh>
      ))}
      <mesh position={[0.34, 0.08, 0.009]}>
        <planeGeometry args={[0.36, 0.46]} />
        <meshBasicMaterial color="#e0ead8" />
      </mesh>
      {[0.23, 0.07, -0.09].map((y, row) => (
        <mesh key={y} position={[0.34, y, 0.011]}>
          <planeGeometry args={[0.24, 0.07]} />
          <meshBasicMaterial color={["#8fb56a", "#c7a5d8", "#65b9a8"][row]} />
        </mesh>
      ))}
      <mesh position={[0.34, 0.35, 0.011]}>
        <planeGeometry args={[0.24, 0.055]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
      <mesh position={[0.02, -0.28, 0.009]}>
        <planeGeometry args={[1.04, 0.04]} />
        <meshBasicMaterial color="#b8d4b5" />
      </mesh>
    </group>
  );
}

function SubjectSticker({ label, palette, width }: { label: string; palette: LabRoomPalette; width: number }) {
  return (
    <group position={[-width / 2 + 1.85, 3.42, -3.98]}>
      <mesh position={[0, 0, -0.006]}>
        <planeGeometry args={[3.72, 0.4]} />
        <meshStandardMaterial color={palette.accent} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.19, -0.005]}>
        <planeGeometry args={[3.72, 0.035]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <RoomLabel text={label} position={[0, 0, 0.008]} height={0.13} />
    </group>
  );
}

function RoomWallChart({ kind, palette, width }: { kind: WallChart; palette: LabRoomPalette; width: number }) {
  if (kind === "measurement") return <MeasurementPoster palette={palette} width={width} />;
  if (kind === "biology") return <BiologyPoster palette={palette} width={width} />;
  if (kind === "periodic") return <PeriodicPoster palette={palette} width={width} />;
  return null;
}

function WallClock({ palette, width }: { palette: LabRoomPalette; width: number }) {
  return (
    <group position={[width / 2 - 1.5, 3.15, -3.94]}>
      <mesh>
        <cylinderGeometry args={[0.26, 0.26, 0.045, 40]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <torusGeometry args={[0.26, 0.018, 8, 40]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.07, 0.03]}>
        <boxGeometry args={[0.018, 0.15, 0.006]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.07, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.014, 0.14, 0.006]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 0, 0.034]}>
        <sphereGeometry args={[0.018, 16, 12]} />
        <meshStandardMaterial color={palette.accent} />
      </mesh>
    </group>
  );
}

function WindowLight({ width }: { width: number }) {
  return (
    <group position={[width / 2 - 0.05, 2.35, -1.1]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[3.3, 1.55]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[3.3, 0.08]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[3.46, 1.7, 0.045]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.35} roughness={0.5} wireframe />
      </mesh>
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[0.045, 1.55, 0.045]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.36, 0.022]}>
        <boxGeometry args={[3.3, 0.04, 0.045]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
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
  const sideX = width / 2 - 0.02;
  const trimX = width / 2;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, 8.2]} />
        <meshStandardMaterial color={palette.floor} roughness={0.9} />
      </mesh>
      <gridHelper args={[width, Math.round(width * 2), palette.floorGridMajor, palette.floorGridMinor]} position={[0, 0.006, 0]} />
      <mesh position={[0, 2.35, -4.07]} receiveShadow>
        <planeGeometry args={[width, 4.7]} />
        <meshStandardMaterial color={palette.wallBack} roughness={0.92} />
      </mesh>
      <mesh position={[-sideX, 2.35, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.2, 4.7]} />
        <meshStandardMaterial color={palette.wallSide} roughness={0.94} />
      </mesh>
      <mesh position={[sideX, 2.35, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.2, 4.7]} />
        <meshStandardMaterial color={palette.wallSide} roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.09, -4.04]}>
        <boxGeometry args={[width, 0.18, 0.08]} />
        <meshStandardMaterial color={palette.trim} roughness={0.7} />
      </mesh>
      <mesh position={[-trimX, 0.09, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8.2, 0.18, 0.08]} />
        <meshStandardMaterial color={palette.trim} roughness={0.7} />
      </mesh>
      <mesh position={[trimX, 0.09, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[8.2, 0.18, 0.08]} />
        <meshStandardMaterial color={palette.trim} roughness={0.7} />
      </mesh>
      <SubjectSticker label={subjectLabel} palette={palette} width={width} />
      {showPoster ? <RoomWallChart kind={wallChart} palette={palette} width={width} /> : null}
      {showWindow ? <WindowLight width={width} /> : null}
      {showClock ? <WallClock palette={palette} width={width} /> : null}
    </group>
  );
}

function NoticeBoard({ config, palette }: { config: NoticeBoardConfig; palette: LabRoomPalette }) {
  const texture = useNoticeTexture(config, palette.accent);
  return (
    <group position={[0, 2.2, -4.0]}>
      <mesh castShadow>
        <boxGeometry args={[3.05, 1.68, 0.07]} />
        <meshStandardMaterial color={palette.shelfBase} roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[2.84, 1.5]} />
        <meshStandardMaterial map={texture} roughness={0.82} />
      </mesh>
      {[-1.38, 1.38].map((x) => (
        <mesh key={x} position={[x, 0.76, 0.062]}>
          <sphereGeometry args={[0.038, 18, 14]} />
          <meshStandardMaterial color={palette.metal} metalness={0.85} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
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
      <fog attach="fog" args={[palette.fog, 13, 26]} />
      <ambientLight intensity={0.42} />
      <hemisphereLight args={["#e0f2fe", "#cbd5e1", 0.9]} />
      <directionalLight
        position={[4.8, 6.5, 5.5]}
        intensity={1.75}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-5.5, 3.5, -2]} intensity={0.7} color="#bfdbfe" />
      <pointLight position={[5.6, 2.5, -1]} intensity={5.5} distance={7} color="#e0f2fe" />
      <pointLight position={[-3, 2.2, 2]} intensity={2.5} distance={6} color="#fef3c7" />

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
      {showContactShadows ? <ContactShadows position={[0, 0.012, 0]} opacity={0.38} scale={16} blur={2.4} far={6} color="#334155" /> : null}
    </>
  );
}
