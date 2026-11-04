"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";

export function GuidedPointer({ position, instruction }: { position: [number, number, number]; instruction: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.05, 0.12, 18]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.075, 0.105, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.028, 16, 12]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      <Html position={[0, 0.34, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[40, 0]} wrapperClass="pointer-events-none">
        <div className="pointer-events-none flex max-w-[220px] items-start gap-1.5 rounded-lg border border-amber-300 bg-white/95 px-2 py-1 text-[10px] font-semibold leading-snug text-slate-800 shadow-lg">
          <span className="relative mt-0.5 flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span>{instruction}</span>
        </div>
      </Html>
    </group>
  );
}
