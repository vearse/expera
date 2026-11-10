"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { LabRoomPalette } from "../ChemistryLabRoom";
import { useLabQuality } from "./LabQualityContext";
import { pbrProps, useLabPbr, type PbrMaps } from "./labTextures";

const ROOM_DEPTH = 8.2;
const ROOM_HEIGHT = 4.7;
const DADO_HEIGHT = 1.16;
const WINDOW_Z = -1.1;
const WINDOW_Y = 2.35;
const WINDOW_W = 3.4;
const WINDOW_H = 1.64;
const WALL_THICKNESS = 0.24;

type Hole = { x: number; y: number; w: number; h: number };
const NO_HOLES: Hole[] = [];

function FluorescentPanel({ position, length }: { position: [number, number, number]; length: number }) {
  const quality = useLabQuality();
  const emit = quality === "low" ? 0.35 : quality === "medium" ? 0.85 : 1.25;
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[length, 0.05, 0.42]} />
        <meshStandardMaterial color="#d7d4c6" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.028, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length - 0.1, 0.28]} />
        <meshStandardMaterial color="#f7fbe8" emissive="#f3f6d2" emissiveIntensity={emit} roughness={0.35} />
      </mesh>
      {[-0.12, 0.12].map((z) => (
        <mesh key={z} position={[0, -0.026, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[length - 0.16, 0.04]} />
          <meshStandardMaterial color="#eef2c8" emissive="#f7fad8" emissiveIntensity={emit * 1.1} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Flat wall built from a shape so it can have openings. UVs are in metres, which keeps the
 * blockwork coursing continuous between the wall and its dado band.
 */
function WallPanel({
  width,
  height,
  yFrom,
  yTo,
  holes = NO_HOLES,
  maps,
  color,
  roughness,
  normalScale,
  envMapIntensity,
  position,
  rotation,
}: {
  width: number;
  height: number;
  yFrom: number;
  yTo: number;
  holes?: Hole[];
  maps: PbrMaps;
  color: string;
  roughness: number;
  normalScale: number;
  envMapIntensity: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x0 = -width / 2;
    const x1 = width / 2;
    const y0 = -height / 2 + yFrom;
    const y1 = -height / 2 + yTo;
    shape.moveTo(x0, y0);
    shape.lineTo(x1, y0);
    shape.lineTo(x1, y1);
    shape.lineTo(x0, y1);
    shape.closePath();
    for (const hole of holes) {
      const path = new THREE.Path();
      path.moveTo(hole.x - hole.w / 2, hole.y - hole.h / 2);
      path.lineTo(hole.x - hole.w / 2, hole.y + hole.h / 2);
      path.lineTo(hole.x + hole.w / 2, hole.y + hole.h / 2);
      path.lineTo(hole.x + hole.w / 2, hole.y - hole.h / 2);
      path.closePath();
      shape.holes.push(path);
    }
    return new THREE.ShapeGeometry(shape);
  }, [height, holes, width, yFrom, yTo]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} receiveShadow>
      <meshStandardMaterial {...pbrProps(maps, { roughness, envMapIntensity, normalScale })} color={color} />
    </mesh>
  );
}

function paintOutdoorView(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, "#7fb4de");
  sky.addColorStop(0.55, "#b5d5ec");
  sky.addColorStop(1, "#e6eff0");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.filter = `blur(${Math.round(w / 90)}px)`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  [
    [0.18, 0.16, 0.12, 0.045],
    [0.26, 0.14, 0.09, 0.05],
    [0.62, 0.22, 0.14, 0.04],
    [0.71, 0.2, 0.08, 0.045],
    [0.88, 0.12, 0.1, 0.035],
  ].forEach(([x, y, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x * w, y * h, rx * w, ry * h, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.filter = "none";

  // Distant tree line.
  ctx.fillStyle = "#5f8a4f";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.58);
  for (let x = 0; x <= w; x += w / 48) {
    const bump = Math.sin(x * 0.021) * 0.025 + Math.sin(x * 0.057 + 1.3) * 0.018;
    ctx.lineTo(x, h * (0.5 + bump));
  }
  ctx.lineTo(w, h * 0.62);
  ctx.lineTo(0, h * 0.62);
  ctx.fill();

  // Classroom block across the compound.
  const bx = w * 0.3;
  const by = h * 0.43;
  const bw = w * 0.46;
  const bh = h * 0.17;
  ctx.fillStyle = "#efe6cf";
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = "#b4823f";
  ctx.fillRect(bx - w * 0.012, by - h * 0.035, bw + w * 0.024, h * 0.04);
  ctx.fillStyle = "#8a5a2b";
  ctx.fillRect(bx - w * 0.012, by - h * 0.006, bw + w * 0.024, h * 0.008);
  for (let i = 0; i < 7; i += 1) {
    const wx = bx + bw * (0.05 + i * 0.135);
    ctx.fillStyle = "#4d6a78";
    ctx.fillRect(wx, by + bh * 0.28, bw * 0.08, bh * 0.4);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(wx, by + bh * 0.28, bw * 0.08, bh * 0.06);
  }
  ctx.fillStyle = "#c9bc9a";
  ctx.fillRect(bx, by + bh * 0.86, bw, bh * 0.14);

  // Laterite compound and a low fence wall.
  const ground = ctx.createLinearGradient(0, h * 0.6, 0, h);
  ground.addColorStop(0, "#b8764a");
  ground.addColorStop(1, "#9a5f3a");
  ctx.fillStyle = ground;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
  ctx.fillStyle = "#d9d2bf";
  ctx.fillRect(0, h * 0.66, w, h * 0.06);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  for (let x = 0; x < w; x += w / 22) ctx.fillRect(x, h * 0.66, 2, h * 0.06);

  // Palms in the foreground.
  const palm = (px: number, base: number, height: number) => {
    ctx.strokeStyle = "#6b5134";
    ctx.lineWidth = w * 0.007;
    ctx.beginPath();
    ctx.moveTo(px, base);
    ctx.quadraticCurveTo(px + w * 0.01, base - height * 0.5, px - w * 0.004, base - height);
    ctx.stroke();
    ctx.strokeStyle = "#3f6b35";
    ctx.lineWidth = w * 0.005;
    for (let k = 0; k < 9; k += 1) {
      const a = (k / 9) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(px - w * 0.004, base - height);
      ctx.quadraticCurveTo(
        px + Math.cos(a) * w * 0.04,
        base - height - h * 0.05,
        px + Math.cos(a) * w * 0.075,
        base - height + Math.abs(Math.sin(a)) * h * 0.05 + h * 0.04,
      );
      ctx.stroke();
    }
  };
  palm(w * 0.12, h * 0.7, h * 0.42);
  palm(w * 0.85, h * 0.72, h * 0.36);
}

function useOutdoorTexture() {
  const quality = useLabQuality();
  const texture = useMemo(() => {
    const w = quality === "low" ? 512 : 1024;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = w / 2;
    const ctx = canvas.getContext("2d");
    if (ctx) paintOutdoorView(ctx, canvas.width, canvas.height);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }, [quality]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Aluminium-framed glass louvre ("naco") window set in the wall opening. */
function LabWindow({ wallColor }: { wallColor: string }) {
  const quality = useLabQuality();
  const outdoor = useOutdoorTexture();
  const glassZ = -WALL_THICKNESS * 0.45;
  const panes = [-WINDOW_W / 3, 0, WINDOW_W / 3];
  const paneW = WINDOW_W / 3 - 0.05;
  const blades = 8;
  const bladeGap = (WINDOW_H - 0.08) / blades;

  const blade =
    quality === "high" ? (
      <meshPhysicalMaterial
        color="#e3f1f7"
        roughness={0.05}
        metalness={0}
        transmission={0.85}
        thickness={0.005}
        ior={1.5}
        transparent
        opacity={0.4}
        envMapIntensity={1.2}
        side={THREE.DoubleSide}
      />
    ) : (
      <meshPhysicalMaterial
        color="#dcecf3"
        roughness={0.06}
        metalness={0.05}
        transparent
        opacity={0.22}
        envMapIntensity={0.9}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    );
  const alu = <meshStandardMaterial color="#b9c2ca" metalness={0.7} roughness={0.3} />;
  const reveal = <meshStandardMaterial color={wallColor} roughness={0.9} />;

  return (
    <group>
      <mesh position={[0, 0, -WALL_THICKNESS - 0.9]}>
        <planeGeometry args={[7.2, 3.6]} />
        <meshBasicMaterial map={outdoor} toneMapped={false} />
      </mesh>

      {/* Wall reveal: jambs, head and the inside of the sill. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * WINDOW_W / 2, 0, -WALL_THICKNESS / 2]} rotation={[0, -side * Math.PI / 2, 0]}>
          <planeGeometry args={[WALL_THICKNESS, WINDOW_H]} />
          {reveal}
        </mesh>
      ))}
      <mesh position={[0, WINDOW_H / 2, -WALL_THICKNESS / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WINDOW_W, WALL_THICKNESS]} />
        {reveal}
      </mesh>
      <mesh position={[0, -WINDOW_H / 2, -WALL_THICKNESS / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WINDOW_W, WALL_THICKNESS]} />
        {reveal}
      </mesh>
      <mesh position={[0, -WINDOW_H / 2 - 0.03, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[WINDOW_W + 0.2, 0.06, 0.14]} />
        <meshStandardMaterial color="#d9ddd6" roughness={0.6} />
      </mesh>

      {/* Frame and mullions. */}
      {[
        [0, WINDOW_H / 2 - 0.025, WINDOW_W, 0.05],
        [0, -WINDOW_H / 2 + 0.025, WINDOW_W, 0.05],
        [-WINDOW_W / 2 + 0.025, 0, 0.05, WINDOW_H],
        [WINDOW_W / 2 - 0.025, 0, 0.05, WINDOW_H],
        [-WINDOW_W / 6, 0, 0.045, WINDOW_H],
        [WINDOW_W / 6, 0, 0.045, WINDOW_H],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, glassZ]} castShadow>
          <boxGeometry args={[w, h, 0.07]} />
          {alu}
        </mesh>
      ))}

      {panes.map((px) => (
        <group key={px} position={[px, 0, glassZ]}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (paneW / 2 - 0.012), 0, 0]}>
              <boxGeometry args={[0.018, WINDOW_H - 0.1, 0.05]} />
              {alu}
            </mesh>
          ))}
          {Array.from({ length: blades }, (_, b) => (
            <mesh key={b} position={[0, -WINDOW_H / 2 + 0.04 + bladeGap * (b + 0.5), 0]} rotation={[-0.38, 0, 0]}>
              <boxGeometry args={[paneW - 0.03, bladeGap * 1.04, 0.004]} />
              {blade}
            </mesh>
          ))}
        </group>
      ))}

      {quality === "high" ? (
        <mesh position={[0, -0.9, 1.8]} rotation={[0.55, 0, 0]} renderOrder={2}>
          <planeGeometry args={[2.4, 3.4]} />
          <meshBasicMaterial color="#ffe7b8" transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
}

function LabDoor({ width }: { width: number }) {
  return (
    <group position={[-width / 2 + 0.045, 1.2, 2.35]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.02, 2.38, 0.07]} />
        <meshStandardMaterial color="#6d4c32" roughness={0.62} />
      </mesh>
      <mesh position={[0.18, 0.42, 0.04]}>
        <boxGeometry args={[0.42, 0.72, 0.02]} />
        <meshPhysicalMaterial color="#cfe6f4" roughness={0.08} metalness={0.05} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.18, 0.42, 0.05]}>
        <boxGeometry args={[0.48, 0.78, 0.015]} />
        <meshStandardMaterial color="#d7c3a5" roughness={0.5} />
      </mesh>
      <mesh position={[-0.38, -0.05, 0.05]}>
        <boxGeometry args={[0.04, 0.16, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.22, 0.04]}>
        <boxGeometry args={[0.7, 0.08, 0.01]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
    </group>
  );
}

const WALL_PAINT = "#f1f6f1";
const DADO_PAINT = "#a9c6b8";

export function LabRoomShell({
  width,
  showWindow,
}: {
  palette: LabRoomPalette;
  width: number;
  showWindow: boolean;
}) {
  const maps = useLabPbr();
  const quality = useLabQuality();
  const sideX = width / 2 - 0.02;
  const trimX = width / 2;
  const floorRepeat = useMemo(() => {
    maps.floor.map.repeat.set(width / 2.1, 4);
    maps.floor.roughnessMap.repeat.set(width / 2.1, 4);
    maps.floor.normalMap.repeat.set(width / 2.1, 4);
    return maps;
  }, [maps, width]);

  const windowHoles = useMemo<Hole[]>(
    () => (showWindow ? [{ x: WINDOW_Z, y: WINDOW_Y - ROOM_HEIGHT / 2, w: WINDOW_W, h: WINDOW_H }] : NO_HOLES),
    [showWindow],
  );
  const wallNormal = quality === "low" ? 0.4 : 0.65;

  const walls: { key: string; width: number; position: [number, number, number]; rotation: [number, number, number]; holes?: Hole[] }[] = [
    { key: "back", width, position: [0, ROOM_HEIGHT / 2, -4.07], rotation: [0, 0, 0] },
    { key: "left", width: ROOM_DEPTH, position: [-sideX, ROOM_HEIGHT / 2, 0], rotation: [0, Math.PI / 2, 0] },
    { key: "right", width: ROOM_DEPTH, position: [sideX, ROOM_HEIGHT / 2, 0], rotation: [0, -Math.PI / 2, 0], holes: windowHoles },
  ];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, ROOM_DEPTH]} />
        <meshStandardMaterial {...pbrProps(floorRepeat.floor, { roughness: 0.42, envMapIntensity: quality === "low" ? 0.15 : 0.55 })} />
      </mesh>

      {walls.map((wall) => {
        const inward = wall.key === "back" ? [0, 0, 0.012] : wall.key === "left" ? [0.012, 0, 0] : [-0.012, 0, 0];
        return (
          <group key={wall.key}>
            <WallPanel
              width={wall.width}
              height={ROOM_HEIGHT}
              yFrom={DADO_HEIGHT}
              yTo={ROOM_HEIGHT}
              holes={wall.holes}
              maps={maps.blockWall}
              color={WALL_PAINT}
              roughness={0.94}
              normalScale={wallNormal}
              envMapIntensity={0.1}
              position={wall.position}
              rotation={wall.rotation}
            />
            <WallPanel
              width={wall.width}
              height={ROOM_HEIGHT}
              yFrom={0}
              yTo={DADO_HEIGHT}
              maps={maps.blockWall}
              color={DADO_PAINT}
              roughness={0.5}
              normalScale={wallNormal}
              envMapIntensity={0.35}
              position={[wall.position[0] + inward[0], wall.position[1], wall.position[2] + inward[2]]}
              rotation={wall.rotation}
            />
          </group>
        );
      })}

      <mesh position={[0, DADO_HEIGHT, -4.045]}>
        <boxGeometry args={[width, 0.035, 0.03]} />
        <meshStandardMaterial color="#7f9d90" roughness={0.55} />
      </mesh>
      <mesh position={[-trimX + 0.03, DADO_HEIGHT, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_DEPTH, 0.035, 0.03]} />
        <meshStandardMaterial color="#7f9d90" roughness={0.55} />
      </mesh>
      <mesh position={[trimX - 0.03, DADO_HEIGHT, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_DEPTH, 0.035, 0.03]} />
        <meshStandardMaterial color="#7f9d90" roughness={0.55} />
      </mesh>

      <mesh position={[0, 0.09, -4.04]}>
        <boxGeometry args={[width, 0.18, 0.08]} />
        <meshStandardMaterial color="#5c6b66" roughness={0.62} />
      </mesh>
      <mesh position={[-trimX, 0.09, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_DEPTH, 0.18, 0.08]} />
        <meshStandardMaterial color="#5c6b66" roughness={0.62} />
      </mesh>
      <mesh position={[trimX, 0.09, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_DEPTH, 0.18, 0.08]} />
        <meshStandardMaterial color="#5c6b66" roughness={0.62} />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, ROOM_DEPTH]} />
        <meshStandardMaterial color="#ece7d6" roughness={0.86} />
      </mesh>
      {[-2.4, 0, 2.4].map((x) =>
        [-2.2, 0.4].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, ROOM_HEIGHT - 0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width > 12 ? 0.04 : 0.03, ROOM_DEPTH]} />
            <meshStandardMaterial color="#ddd6c2" roughness={0.8} />
          </mesh>
        )),
      )}
      <FluorescentPanel position={[-2.55, 4.58, -1.35]} length={3.4} />
      <FluorescentPanel position={[2.55, 4.58, 0.55]} length={3.4} />
      {showWindow ? (
        <group position={[sideX, WINDOW_Y, WINDOW_Z]} rotation={[0, -Math.PI / 2, 0]}>
          <LabWindow wallColor={WALL_PAINT} />
        </group>
      ) : null}
      <LabDoor width={width} />
    </group>
  );
}
