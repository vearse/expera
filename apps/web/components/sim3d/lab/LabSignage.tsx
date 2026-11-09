"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { LabRoomPalette, NoticeBoardConfig, WallChart } from "../ChemistryLabRoom";
import { RoomLabel } from "../ChemistryLabRoom";
import { useLabQuality } from "./LabQualityContext";
import { anisotropyFor } from "@/lib/sim/labQuality";
import { useThree } from "@react-three/fiber";

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

function useCanvasTexture(paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number, deps: unknown[]) {
  const quality = useLabQuality();
  const gl = useThree((s) => s.gl);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) paint(ctx, w, h);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = anisotropyFor(quality, gl.capabilities.getMaxAnisotropy());
    map.generateMipmaps = true;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.needsUpdate = true;
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, w, h, ...deps]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function paintNotice(ctx: CanvasRenderingContext2D, width: number, height: number, config: NoticeBoardConfig, accent: string) {
  ctx.fillStyle = "#f7f4ea";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(180, 160, 120, 0.12)";
  for (let i = 0; i < 40; i += 1) ctx.fillRect(Math.random() * width, Math.random() * height, 8, 1);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, width, 168);
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = '700 28px system-ui, "Segoe UI", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText((config.eyebrow ?? "Class notice").toUpperCase(), 72, 62);
  ctx.fillStyle = "#ffffff";
  ctx.font = '800 72px system-ui, "Segoe UI", sans-serif';
  ctx.fillText(config.title, 72, 132);
  let y = 240;
  if (config.subtitle) {
    ctx.fillStyle = "#334155";
    ctx.font = '600 36px system-ui, "Segoe UI", sans-serif';
    ctx.fillText(config.subtitle, 72, y);
    y += 70;
  }
  ctx.font = '500 38px system-ui, "Segoe UI", sans-serif';
  for (const line of config.lines) {
    const wrapped = wrapText(ctx, line, 1680);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(92, y - 12, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    wrapped.forEach((part, index) => ctx.fillText(part, 124, y + index * 48));
    y += wrapped.length * 48 + 36;
    if (y > height - 110) break;
  }
  if (config.footer) {
    ctx.fillStyle = "#e7eee8";
    ctx.fillRect(56, height - 100, width - 112, 64);
    ctx.fillStyle = "#334155";
    ctx.font = '600 30px system-ui, "Segoe UI", sans-serif';
    ctx.fillText(config.footer, 80, height - 58);
  }
}

const ELEMENTS: { s: string; n: number; c: string }[] = [
  { s: "H", n: 1, c: "#a0ffa0" },
  { s: "He", n: 2, c: "#c0ffff" },
  { s: "Li", n: 3, c: "#ff6666" },
  { s: "Be", n: 4, c: "#ffdead" },
  { s: "B", n: 5, c: "#cccc99" },
  { s: "C", n: 6, c: "#a0ffa0" },
  { s: "N", n: 7, c: "#a0ffa0" },
  { s: "O", n: 8, c: "#a0ffa0" },
  { s: "F", n: 9, c: "#ffff99" },
  { s: "Ne", n: 10, c: "#c0ffff" },
  { s: "Na", n: 11, c: "#ff6666" },
  { s: "Mg", n: 12, c: "#ffdead" },
  { s: "Al", n: 13, c: "#cccccc" },
  { s: "Si", n: 14, c: "#cccc99" },
  { s: "P", n: 15, c: "#a0ffa0" },
  { s: "S", n: 16, c: "#a0ffa0" },
  { s: "Cl", n: 17, c: "#ffff99" },
  { s: "Ar", n: 18, c: "#c0ffff" },
];

function paintPeriodic(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#0f766e";
  ctx.fillRect(0, 0, w, 92);
  ctx.fillStyle = "#fff";
  ctx.font = '800 42px system-ui, "Segoe UI", sans-serif';
  ctx.fillText("Periodic Table", 40, 58);
  ctx.font = '600 22px system-ui, "Segoe UI", sans-serif';
  ctx.fillText("WAEC / NERDC reference", 420, 58);
  const cellW = 96;
  const cellH = 88;
  const layout: Array<[number, number, number]> = [
    [0, 0, 0],
    [17, 0, 1],
    [0, 1, 2],
    [1, 1, 3],
    [12, 1, 4],
    [13, 1, 5],
    [14, 1, 6],
    [15, 1, 7],
    [16, 1, 8],
    [17, 1, 9],
    [0, 2, 10],
    [1, 2, 11],
    [12, 2, 12],
    [13, 2, 13],
    [14, 2, 14],
    [15, 2, 15],
    [16, 2, 16],
    [17, 2, 17],
  ];
  for (const [col, row, idx] of layout) {
    const el = ELEMENTS[idx];
    const x = 28 + col * cellW;
    const y = 120 + row * cellH;
    ctx.fillStyle = el.c;
    ctx.fillRect(x, y, cellW - 8, cellH - 8);
    ctx.strokeStyle = "rgba(15,23,42,0.15)";
    ctx.strokeRect(x, y, cellW - 8, cellH - 8);
    ctx.fillStyle = "#0f172a";
    ctx.font = '600 16px system-ui, "Segoe UI", sans-serif';
    ctx.fillText(String(el.n), x + 8, y + 20);
    ctx.font = '800 28px system-ui, "Segoe UI", sans-serif';
    ctx.fillText(el.s, x + 18, y + 52);
  }
  ctx.fillStyle = "#64748b";
  ctx.font = '500 22px system-ui, "Segoe UI", sans-serif';
  ctx.fillText("Groups 1–18 · periods 1–3 shown", 40, h - 36);
}

function paintMeasurement(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#0e7490";
  ctx.fillRect(0, 0, w, 96);
  ctx.fillStyle = "#fff";
  ctx.font = '800 44px system-ui, "Segoe UI", sans-serif';
  ctx.fillText("Measurement", 40, 62);
  ctx.fillStyle = "#0f172a";
  ctx.font = '600 32px system-ui, "Segoe UI", sans-serif';
  ["Vernier: 0.01 cm", "Micrometer: 0.01 mm", "Stopwatch: 0.01 s"].forEach((line, i) => {
    ctx.fillText(line, 56, 180 + i * 70);
  });
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(56, 420);
  ctx.lineTo(w - 80, 420);
  ctx.stroke();
  for (let i = 0; i <= 20; i += 1) {
    const x = 56 + i * ((w - 140) / 20);
    ctx.beginPath();
    ctx.moveTo(x, 420);
    ctx.lineTo(x, 420 - (i % 5 === 0 ? 36 : 18));
    ctx.stroke();
  }
}

function paintBiology(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#f4faf0";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#3f6212";
  ctx.fillRect(0, 0, w, 96);
  ctx.fillStyle = "#fff";
  ctx.font = '800 44px system-ui, "Segoe UI", sans-serif';
  ctx.fillText("Cell structure", 40, 62);
  ctx.fillStyle = "#86a873";
  ctx.beginPath();
  ctx.ellipse(420, 380, 220, 200, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4d7c0f";
  ctx.beginPath();
  ctx.arc(420, 380, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.font = '600 28px system-ui, "Segoe UI", sans-serif';
  ctx.fillText("Nucleus", 700, 360);
  ctx.fillText("Cytoplasm", 700, 420);
  ctx.fillText("Cell membrane", 700, 480);
}

function paintSafety(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#b45309";
  ctx.fillRect(0, 0, w, 90);
  ctx.fillStyle = "#fff";
  ctx.font = '800 40px system-ui, "Segoe UI", sans-serif';
  ctx.fillText("Laboratory safety", 36, 58);
  const rules = [
    "Wear goggles before lighting a burner.",
    "Never taste chemicals. Waft to smell.",
    "Keep bags under the bench, aisles clear.",
    "Report spills to Ms. Ada immediately.",
    "Wash hands before leaving the lab.",
  ];
  ctx.font = '600 32px system-ui, "Segoe UI", sans-serif';
  ctx.fillStyle = "#1e293b";
  rules.forEach((rule, i) => ctx.fillText(`${i + 1}.  ${rule}`, 40, 150 + i * 52));
  const hazards = ["Flammable", "Corrosive", "Toxic"];
  const colors = ["#f59e0b", "#ef4444", "#7c3aed"];
  hazards.forEach((label, i) => {
    const x = 70 + i * 210;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(x, 430);
    ctx.lineTo(x + 46, 510);
    ctx.lineTo(x - 46, 510);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.font = '700 22px system-ui, "Segoe UI", sans-serif';
    ctx.fillText(label, x - 48, 540);
  });
}

function PaperPoster({
  map,
  position,
  rotation,
  size,
}: {
  map: THREE.Texture;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.012]} castShadow>
        <boxGeometry args={[size[0] + 0.06, size[1] + 0.06, 0.025]} />
        <meshStandardMaterial color="#d6c7a8" roughness={0.7} />
      </mesh>
      <mesh receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial map={map} roughness={0.78} metalness={0} />
      </mesh>
      <mesh position={[0.01, -0.01, -0.018]} rotation={[0.02, 0, 0.015]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial color="#c4b79a" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function LabBanner({ label, palette, width }: { label: string; palette: LabRoomPalette; width: number }) {
  return (
    <group position={[-width / 2 + 1.85, 3.42, -3.98]}>
      <mesh position={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[3.78, 0.46, 0.05]} />
        <meshStandardMaterial color="#0f3f3c" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, -0.006]}>
        <planeGeometry args={[3.72, 0.4]} />
        <meshStandardMaterial color={palette.accent} roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.19, -0.005]}>
        <planeGeometry args={[3.72, 0.035]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <RoomLabel text={label} position={[0, 0, 0.012]} height={0.13} />
    </group>
  );
}

export function LabWallClock({ palette, width }: { palette: LabRoomPalette; width: number }) {
  const now = useMemo(() => new Date(), []);
  const minutes = now.getMinutes() + now.getHours() * 60;
  const minuteAngle = (minutes % 60) * (Math.PI / 30);
  const hourAngle = ((minutes / 60) % 12) * (Math.PI / 6);
  return (
    <group position={[width / 2 - 1.5, 3.15, -3.94]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 48]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.45} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.2, Math.cos(a) * 0.2, 0.025]}>
            <boxGeometry args={[i % 3 === 0 ? 0.018 : 0.01, 0.03, 0.004]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        );
      })}
      <mesh position={[Math.sin(hourAngle) * 0.06, Math.cos(hourAngle) * 0.06, 0.03]} rotation={[0, 0, -hourAngle]}>
        <boxGeometry args={[0.018, 0.14, 0.006]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[Math.sin(minuteAngle) * 0.08, Math.cos(minuteAngle) * 0.08, 0.032]} rotation={[0, 0, -minuteAngle]}>
        <boxGeometry args={[0.012, 0.18, 0.005]} />
        <meshStandardMaterial color={palette.accent} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.02, 16, 12]} />
        <meshStandardMaterial color={palette.accent} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.046]}>
        <circleGeometry args={[0.255, 40]} />
        <meshPhysicalMaterial color="#e2f0f8" roughness={0.05} metalness={0} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

export function LabNoticeBoard({ config, palette }: { config: NoticeBoardConfig; palette: LabRoomPalette }) {
  const texture = useCanvasTexture((ctx, w, h) => paintNotice(ctx, w, h, config, palette.accent), 2048, 1144, [config, palette.accent]);
  return (
    <group position={[0, 2.2, -4.0]}>
      <mesh castShadow>
        <boxGeometry args={[3.05, 1.68, 0.07]} />
        <meshStandardMaterial color={palette.shelfBase} roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[2.84, 1.5]} />
        <meshStandardMaterial map={texture} roughness={0.78} />
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

export function LabWallChart({ kind, width }: { kind: WallChart; palette: LabRoomPalette; width: number }) {
  const periodic = useCanvasTexture(paintPeriodic, 1792, 1280, []);
  const measurement = useCanvasTexture(paintMeasurement, 1408, 1152, []);
  const biology = useCanvasTexture(paintBiology, 1408, 1152, []);
  if (kind === "none") return null;
  const pos: [number, number, number] = [-width / 2 + 0.08, 2.25, -0.55];
  const rot: [number, number, number] = [0, Math.PI / 2, 0];
  const map = kind === "measurement" ? measurement : kind === "biology" ? biology : periodic;
  return <PaperPoster map={map} position={pos} rotation={rot} size={[1.35, 0.95]} />;
}

export function LabSafetyRulesSign({ width }: { width: number }) {
  const map = useCanvasTexture(paintSafety, 1408, 1152, []);
  return <PaperPoster map={map} position={[width / 2 - 0.08, 2.15, 1.55]} rotation={[0, -Math.PI / 2, 0]} size={[0.95, 0.78]} />;
}
