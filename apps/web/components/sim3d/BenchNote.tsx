"use client";

import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export type BenchNoteData = {
  eyebrow: string;
  title: string;
  lines: string[];
  footer?: string;
  accent?: string;
};

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

function useNoteTexture(data: BenchNoteData, accent: string) {
  const asset = useMemo(() => {
    const width = 1024;
    const height = 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = "#fbf7ea";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.28)";
    ctx.lineWidth = 2;
    for (let y = 128; y < height - 90; y += 42) {
      ctx.beginPath();
      ctx.moveTo(56, y);
      ctx.lineTo(width - 56, y);
      ctx.stroke();
    }

    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, width, 92);
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = '700 19px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(data.eyebrow.toUpperCase(), 52, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = '800 43px system-ui, -apple-system, "Segoe UI", sans-serif';
    const titleLines = wrapText(ctx, data.title, width - 104);
    ctx.fillText(titleLines[0] ?? "", 52, 79);
    if (titleLines[1]) {
      ctx.font = '700 30px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.fillText(titleLines[1], 52, 112);
    }

    let y = titleLines[1] ? 168 : 146;
    ctx.font = '500 27px system-ui, -apple-system, "Segoe UI", sans-serif';
    for (const line of data.lines) {
      const wrapped = wrapText(ctx, line, width - 150);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(64, y - 9, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      wrapped.forEach((part, index) => {
        ctx.fillText(part, 88, y + index * 36);
      });
      y += wrapped.length * 36 + 18;
      if (y > height - 100) break;
    }

    if (data.footer) {
      ctx.fillStyle = "rgba(15, 118, 110, 0.1)";
      ctx.fillRect(36, height - 76, width - 72, 48);
      ctx.fillStyle = "#0f172a";
      ctx.font = '600 22px system-ui, -apple-system, "Segoe UI", sans-serif';
      const footerLines = wrapText(ctx, data.footer, width - 104);
      ctx.fillText(footerLines[0] ?? "", 52, height - 45);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [accent, data]);

  useEffect(() => () => asset.dispose(), [asset]);
  return asset;
}

function StaticPaper({ data, width, height }: { data: BenchNoteData; width: number; height: number }) {
  const texture = useNoteTexture(data, data.accent ?? "#0f766e");
  return (
    <mesh position={[0, 0, 0.002]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
    </mesh>
  );
}

export function BenchNote({
  data,
  position = [0, 1.5, 0.9],
  rotation = [-0.7, 0.18, 0],
  width = 1.18,
  height = 0.83,
}: {
  data: BenchNoteData;
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -height / 2 - 0.17, -0.2]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[0.055, 0.5, 0.045]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.7} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.4, -0.34]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.035, 0.24]} />
        <meshStandardMaterial color="#7c4f32" roughness={0.64} />
      </mesh>
      <RoundedBox args={[width + 0.08, height + 0.08, 0.035]} radius={0.02} smoothness={4} position={[0, 0, -0.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#8b5e3c" roughness={0.62} metalness={0.04} />
      </RoundedBox>
      <StaticPaper data={data} width={width} height={height} />
      <mesh position={[0, height / 2 + 0.015, 0.02]} castShadow>
        <boxGeometry args={[0.2, 0.06, 0.03]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.82} roughness={0.24} />
      </mesh>
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, height / 2 + 0.055, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
}
