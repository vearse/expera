"use client";

import { RoundedBox } from "@react-three/drei";
import type { SpecimenSpec } from "@/lib/content/biology";
import { MicroscopeSlide } from "./MicroscopeSlide";

export function MicroscopeStage({
  specimen,
  hasSlide,
  secured,
  coverslip,
  onStageClick,
  onClipClick,
}: {
  specimen: SpecimenSpec | null;
  hasSlide: boolean;
  secured: boolean;
  coverslip: boolean;
  onStageClick: () => void;
  onClipClick: () => void;
}) {
  return (
    <group position={[0, 0, 0]}>
      <RoundedBox
        args={[0.38, 0.028, 0.32]}
        radius={0.012}
        smoothness={4}
        position={[0, 0.41, 0.035]}
        castShadow
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onStageClick();
        }}
      >
        <meshStandardMaterial color="#1f2937" metalness={0.55} roughness={0.38} />
      </RoundedBox>
      <mesh position={[0, 0.425, 0.045]}>
        <cylinderGeometry args={[0.055, 0.055, 0.006, 24]} />
        <meshStandardMaterial color="#050b12" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.428, 0.002]}>
        <torusGeometry args={[0.065, 0.007, 8, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      {hasSlide ? <MicroscopeSlide specimen={specimen} coverslip={coverslip} position={[0, 0.433, 0.045]} /> : null}
      {[-0.13, 0.13].map((x) => (
        <group key={x} position={[x, 0.43, 0.14]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            onPointerDown={(event) => {
              event.stopPropagation();
              onClipClick();
            }}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.12, 10]} />
            <meshStandardMaterial color={secured ? "#5eead4" : "#cbd5e1"} metalness={0.9} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.008, 0]}>
            <boxGeometry args={[0.026, 0.008, 0.07]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.21, 0.405, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.07, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh position={[0.21, 0.405, 0.085]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.07, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.22} />
      </mesh>
    </group>
  );
}
