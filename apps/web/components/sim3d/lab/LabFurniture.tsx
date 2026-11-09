"use client";

import { RoundedBox } from "@react-three/drei";
import { BENCH_TOP, RoomLabel, SHELF_Z, type LabRoomPalette } from "../ChemistryLabRoom";
import { pbrProps, useLabPbr } from "./labTextures";

function Chrome({ roughness = 0.18 }: { roughness?: number }) {
  return <meshStandardMaterial color="#c5d0d8" metalness={0.92} roughness={roughness} envMapIntensity={1.15} />;
}

function RecessedHandle() {
  return (
    <group>
      <mesh position={[0, 0, 0.002]}>
        <boxGeometry args={[0.28, 0.04, 0.02]} />
        <meshStandardMaterial color="#1f2933" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[0.22, 0.012, 0.012]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

function DrawerFace({ y, x, palette }: { y: number; x: number; palette: LabRoomPalette }) {
  return (
    <group position={[x, y, 0.81]}>
      <mesh>
        <boxGeometry args={[1.38, 0.255, 0.02]} />
        <meshStandardMaterial color="#d7dee6" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0, 0.012]} castShadow>
        <boxGeometry args={[1.28, 0.2, 0.028]} />
        <meshStandardMaterial color={palette.drawer} roughness={0.58} />
      </mesh>
      <group position={[0, 0.01, 0.03]}>
        <RecessedHandle />
      </group>
    </group>
  );
}

function GasTap({ x }: { x: number }) {
  return (
    <group position={[x, BENCH_TOP + 0.08, -0.86]}>
      <mesh>
        <cylinderGeometry args={[0.028, 0.032, 0.06, 16]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 12]} />
        <Chrome />
      </mesh>
      <mesh position={[0.04, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.08, 12]} />
        <Chrome />
      </mesh>
      <mesh position={[0.08, 0.11, 0]}>
        <sphereGeometry args={[0.016, 12, 10]} />
        <meshStandardMaterial color="#9f1239" roughness={0.45} />
      </mesh>
    </group>
  );
}

function SocketStrip() {
  return (
    <group position={[0.15, 1.22, -0.93]}>
      <mesh>
        <boxGeometry args={[1.35, 0.08, 0.05]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {[-0.42, 0, 0.42].map((x) => (
        <mesh key={x} position={[x, 0, 0.03]}>
          <boxGeometry args={[0.22, 0.05, 0.02]} />
          <meshStandardMaterial color="#334155" roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function SwanNeckTap({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.028, 0.032, 0.04, 16]} />
        <Chrome roughness={0.16} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.26, 16]} />
        <Chrome />
      </mesh>
      <mesh position={[0, 0.26, 0.07]} rotation={[Math.PI / 2.4, 0, 0]}>
        <cylinderGeometry args={[0.013, 0.013, 0.18, 16]} />
        <Chrome />
      </mesh>
      <mesh position={[0, 0.2, 0.14]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.016, 0.05, 12]} />
        <Chrome />
      </mesh>
    </group>
  );
}

export function WorkBenchLook({ palette }: { palette: LabRoomPalette }) {
  const maps = useLabPbr();
  return (
    <group position={[0, 0, 0.48]}>
      <RoundedBox args={[5.05, 0.13, 1.95]} radius={0.035} smoothness={4} position={[0, BENCH_TOP - 0.065, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          {...pbrProps(maps.epoxy, { roughness: 0.28, metalness: 0.06, envMapIntensity: 0.7 })}
          color="#d2ece6"
          clearcoat={0.55}
          clearcoatRoughness={0.22}
        />
      </RoundedBox>
      <mesh position={[0, 0.53, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[4.7, 0.82, 1.64]} />
        <meshStandardMaterial {...pbrProps(maps.laminate, { roughness: 0.7 })} color={palette.benchBody} />
      </mesh>
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, 0.53, 0.8]}>
          <boxGeometry args={[0.03, 0.82, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
      ))}
      {[-1.55, 0, 1.55].map((x) => (
        <DrawerFace key={x} x={x} y={0.79} palette={palette} />
      ))}
      {[-1.55, 0, 1.55].map((x) => (
        <DrawerFace key={`low-${x}`} x={x} y={0.52} palette={palette} />
      ))}
      <mesh position={[0, 1.18, -0.96]} castShadow>
        <boxGeometry args={[5.05, 0.32, 0.06]} />
        <meshStandardMaterial color={palette.trim} roughness={0.68} />
      </mesh>
      <group position={[-2.05, BENCH_TOP, -0.42]}>
        <RoundedBox args={[0.62, 0.05, 0.42]} radius={0.02} smoothness={3} position={[0, -0.01, 0]}>
          <meshStandardMaterial color="#8a9aa6" metalness={0.72} roughness={0.22} />
        </RoundedBox>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.05, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.35} />
        </mesh>
        <SwanNeckTap position={[0, 0.02, -0.12]} />
      </group>
      <GasTap x={0.85} />
      <GasTap x={1.15} />
      <SocketStrip />
      <mesh position={[2.26, BENCH_TOP - 0.01, -0.36]} receiveShadow>
        <boxGeometry args={[0.5, 0.02, 0.42]} />
        <meshStandardMaterial color="#475569" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[2.26, BENCH_TOP + 0.12, -0.34]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.24, 16]} />
        <Chrome />
      </mesh>
      <mesh position={[2.26, BENCH_TOP + 0.24, -0.27]} rotation={[Math.PI / 3, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.2, 16]} />
        <Chrome />
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

export function SideBenchLook({ palette }: { palette: LabRoomPalette }) {
  const maps = useLabPbr();
  return (
    <group position={[5.25, 0, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[3.6, 0.12, 1.15]} radius={0.03} smoothness={4} position={[0, 0.97, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          {...pbrProps(maps.epoxy, { roughness: 0.32, metalness: 0.06, envMapIntensity: 0.65 })}
          color="#d2ece6"
          clearcoat={0.5}
          clearcoatRoughness={0.25}
        />
      </RoundedBox>
      <mesh position={[0, 0.5, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[3.35, 0.78, 0.94]} />
        <meshStandardMaterial {...pbrProps(maps.laminate, { roughness: 0.7 })} color={palette.benchBody} />
      </mesh>
      <mesh position={[-1.05, 0.66, 0.46]}>
        <boxGeometry args={[1.15, 0.22, 0.03]} />
        <meshStandardMaterial color={palette.drawer} roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.66, 0.46]}>
        <boxGeometry args={[1.15, 0.22, 0.03]} />
        <meshStandardMaterial color={palette.drawer} roughness={0.6} />
      </mesh>
      <group position={[-1.05, 0.68, 0.49]}>
        <RecessedHandle />
      </group>
      <group position={[0.2, 0.68, 0.49]}>
        <RecessedHandle />
      </group>
      <group position={[-1.05, 1.03, 0]}>
        <RoundedBox args={[0.78, 0.05, 0.54]} radius={0.02} smoothness={3}>
          <meshStandardMaterial color="#8e9ba8" metalness={0.78} roughness={0.2} />
        </RoundedBox>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.04, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.32} />
        </mesh>
        <mesh position={[0.12, 0.018, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <SwanNeckTap position={[0, 0.04, -0.16]} />
      </group>
      <group position={[0.85, 1.08, -0.12]}>
        {[-0.16, 0, 0.16].map((x) =>
          [-0.08, 0.08].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.045, 0.006, 8, 16]} />
              <Chrome roughness={0.28} />
            </mesh>
          )),
        )}
        <mesh position={[0, -0.02, 0.18]}>
          <boxGeometry args={[0.5, 0.02, 0.08]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      <group position={[1.45, 1.28, -0.42]}>
        <mesh>
          <boxGeometry args={[0.22, 0.32, 0.1]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.2, 0.02]}>
          <boxGeometry args={[0.16, 0.08, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
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

export function StoolLook({ x, palette }: { x: number; palette: LabRoomPalette }) {
  return (
    <group position={[x, 0, 1.85]}>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.255, 0.23, 0.055, 32]} />
        <meshStandardMaterial color={palette.seat} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.548, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.02, 32]} />
        <meshStandardMaterial color={palette.seat} roughness={0.42} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.16, 0.26, Math.sin(a) * 0.16]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.52, 12]} />
          <Chrome roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 0]}>
        <torusGeometry args={[0.22, 0.012, 8, 32]} />
        <Chrome roughness={0.28} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((a) => (
        <mesh key={`foot-${a}`} position={[Math.cos(a) * 0.16, 0.02, Math.sin(a) * 0.16]}>
          <cylinderGeometry args={[0.028, 0.03, 0.02, 12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function ShelfLabel({ text, y }: { text: string; y: number }) {
  return (
    <group position={[0.78, y, 0.27]} rotation={[0, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.42, 0.08, 0.01]} />
        <meshStandardMaterial color="#f4efe4" roughness={0.82} />
      </mesh>
      <RoomLabel text={text} position={[0, 0, 0.012]} height={0.055} />
    </group>
  );
}

export function ShelfUnitLook({ x, label, palette }: { x: number; label: string; palette: LabRoomPalette }) {
  const maps = useLabPbr();
  return (
    <group position={[x, 0, SHELF_Z]}>
      <mesh position={[0, 1.38, -0.22]} receiveShadow>
        <boxGeometry args={[2.26, 2.78, 0.05]} />
        <meshStandardMaterial color={palette.shelfBack} roughness={0.9} />
      </mesh>
      {[-1.11, 1.11].map((side) => (
        <mesh key={side} position={[side, 1.38, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.09, 2.78, 0.52]} />
          <meshStandardMaterial {...pbrProps(maps.wood, { roughness: 0.68 })} color="#e8d2b8" />
        </mesh>
      ))}
      {[1.12, 1.72, 2.32, 2.7].map((y, i) => (
        <group key={y}>
          <mesh position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.26, 0.075, 0.52]} />
            <meshStandardMaterial {...pbrProps(maps.wood, { roughness: 0.64 })} color="#edd9c0" />
          </mesh>
          {[-0.7, 0.7].map((bx) => (
            <mesh key={bx} position={[bx, y - 0.05, -0.18]}>
              <boxGeometry args={[0.08, 0.04, 0.04]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          {i < 3 ? <ShelfLabel text={`Row ${i + 1}`} y={y + 0.08} /> : null}
        </group>
      ))}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[2.26, 0.16, 0.52]} />
        <meshStandardMaterial {...pbrProps(maps.wood, { roughness: 0.7 })} color="#d7b48e" />
      </mesh>
      <RoomLabel text={label} position={[0, 2.85, 0.16]} height={0.1} />
    </group>
  );
}
