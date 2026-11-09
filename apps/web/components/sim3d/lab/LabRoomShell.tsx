"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { LabRoomPalette } from "../ChemistryLabRoom";
import { useLabQuality } from "./LabQualityContext";
import { pbrProps, useLabPbr } from "./labTextures";

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

function LabWindow({ width }: { width: number }) {
  const quality = useLabQuality();
  const glass =
    quality === "high" ? (
      <meshPhysicalMaterial
        color="#dceef8"
        roughness={0.04}
        metalness={0}
        transmission={0.72}
        thickness={0.02}
        ior={1.5}
        transparent
        opacity={0.35}
        envMapIntensity={1.1}
      />
    ) : (
      <meshPhysicalMaterial color="#d7ebf6" roughness={0.08} metalness={0.04} transparent opacity={0.28} envMapIntensity={0.7} />
    );

  return (
    <group position={[width / 2 - 0.05, 2.35, -1.1]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[3.55, 1.82]} />
        <meshBasicMaterial color="#b9d4ea" />
      </mesh>
      <mesh position={[0.55, 0.18, -0.038]}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshBasicMaterial color="#fff6d6" />
      </mesh>
      <mesh position={[-0.9, -0.2, -0.038]}>
        <sphereGeometry args={[0.7, 16, 12]} />
        <meshBasicMaterial color="#e7eef2" />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[3.22, 1.48]} />
        {glass}
      </mesh>
      {[
        [0, 0.84, 0.03, 3.48, 0.08, 0.08],
        [0, -0.84, 0.03, 3.48, 0.08, 0.08],
        [-1.7, 0, 0.03, 0.08, 1.72, 0.08],
        [1.7, 0, 0.03, 0.08, 1.72, 0.08],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#8a96a3" metalness={0.55} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[0.055, 1.48, 0.05]} />
        <meshStandardMaterial color="#c5cdd4" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.28, 0.055]}>
        <boxGeometry args={[3.22, 0.045, 0.05]} />
        <meshStandardMaterial color="#c5cdd4" metalness={0.45} roughness={0.35} />
      </mesh>
      {quality !== "low"
        ? [-0.9, 0, 0.9].map((x) => (
            <group key={x} position={[x, 0.02, 0.07]}>
              {[-0.28, 0, 0.28].map((y) => (
                <mesh key={y} position={[0, y, 0]} rotation={[0.45, 0, 0]}>
                  <boxGeometry args={[0.95, 0.018, 0.08]} />
                  <meshStandardMaterial color="#d7dde3" roughness={0.4} metalness={0.2} />
                </mesh>
              ))}
            </group>
          ))
        : null}
      {quality === "high" ? (
        <mesh position={[0, -0.9, 1.8]} rotation={[0.55, 0, 0]} renderOrder={2}>
          <planeGeometry args={[2.4, 3.4]} />
          <meshBasicMaterial color="#ffe7b8" transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide} />
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

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, 8.2]} />
        <meshStandardMaterial {...pbrProps(floorRepeat.floor, { roughness: 0.42, envMapIntensity: quality === "low" ? 0.15 : 0.55 })} />
      </mesh>
      <mesh position={[0, 2.35, -4.07]} receiveShadow>
        <planeGeometry args={[width, 4.7]} />
        <meshStandardMaterial {...pbrProps(maps.plaster, { roughness: 0.92, envMapIntensity: 0.12 })} color="#f4faf7" />
      </mesh>
      <mesh position={[-sideX, 2.35, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.2, 4.7]} />
        <meshStandardMaterial {...pbrProps(maps.plaster, { roughness: 0.94, envMapIntensity: 0.1 })} color="#eef6f2" />
      </mesh>
      <mesh position={[sideX, 2.35, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.2, 4.7]} />
        <meshStandardMaterial {...pbrProps(maps.plaster, { roughness: 0.94, envMapIntensity: 0.12 })} color="#eef6f2" />
      </mesh>
      <mesh position={[0, 0.58, -4.03]}>
        <boxGeometry args={[width, 1.16, 0.035]} />
        <meshStandardMaterial color="#c5d4cc" roughness={0.88} />
      </mesh>
      <mesh position={[-trimX + 0.01, 0.58, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8.2, 1.16, 0.035]} />
        <meshStandardMaterial color="#c5d4cc" roughness={0.88} />
      </mesh>
      <mesh position={[trimX - 0.01, 0.58, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[8.2, 1.16, 0.035]} />
        <meshStandardMaterial color="#c5d4cc" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.16, -4.02]}>
        <boxGeometry args={[width, 0.04, 0.04]} />
        <meshStandardMaterial color="#9bb0a8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.09, -4.04]}>
        <boxGeometry args={[width, 0.18, 0.08]} />
        <meshStandardMaterial color="#5c6b66" roughness={0.62} />
      </mesh>
      <mesh position={[-trimX, 0.09, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8.2, 0.18, 0.08]} />
        <meshStandardMaterial color="#5c6b66" roughness={0.62} />
      </mesh>
      <mesh position={[trimX, 0.09, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[8.2, 0.18, 0.08]} />
        <meshStandardMaterial color="#5c6b66" roughness={0.62} />
      </mesh>
      <mesh position={[0, 4.69, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, 8.2]} />
        <meshStandardMaterial color="#ece7d6" roughness={0.86} />
      </mesh>
      {[-2.4, 0, 2.4].map((x) =>
        [-2.2, 0.4].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 4.68, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width > 12 ? 0.04 : 0.03, 8.2]} />
            <meshStandardMaterial color="#ddd6c2" roughness={0.8} />
          </mesh>
        )),
      )}
      <FluorescentPanel position={[-2.55, 4.58, -1.35]} length={3.4} />
      <FluorescentPanel position={[2.55, 4.58, 0.55]} length={3.4} />
      {showWindow ? <LabWindow width={width} /> : null}
      <LabDoor width={width} />
    </group>
  );
}
