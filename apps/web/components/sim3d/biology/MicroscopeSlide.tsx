"use client";

import { RoundedBox } from "@react-three/drei";
import type { SpecimenSpec } from "@/lib/content/biology";

const SPECIMEN_COLOURS: Record<SpecimenSpec["sampleKind"], string> = {
  plant: "#8fb56a",
  animal: "#c7a5d8",
  microbial: "#65b9a8",
};

export function MicroscopeSlide({
  specimen,
  coverslip,
  position = [0, 0.018, 0.035],
}: {
  specimen: SpecimenSpec | null;
  coverslip: boolean;
  position?: [number, number, number];
}) {
  const colour = specimen ? SPECIMEN_COLOURS[specimen.sampleKind] : "#dbeafe";
  return (
    <group position={position}>
      <RoundedBox args={[0.3, 0.006, 0.12]} radius={0.003} smoothness={2} castShadow>
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.55} roughness={0.08} metalness={0.02} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0.004, 0]}>
        <boxGeometry args={[0.31, 0.001, 0.011]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      {specimen ? (
        <group position={[0.01, 0.006, 0]}>
          <mesh scale={[1.65, 1, 1]}>
            <circleGeometry args={[0.018, 24]} />
            <meshPhysicalMaterial color={colour} transparent opacity={0.72} roughness={0.25} clearcoat={0.6} />
          </mesh>
          <mesh position={[0.008, 0.001, 0.004]} scale={[1.2, 1, 0.7]}>
            <circleGeometry args={[0.012, 18]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.18} />
          </mesh>
        </group>
      ) : null}
      {coverslip ? (
        <RoundedBox args={[0.16, 0.003, 0.08]} radius={0.002} smoothness={2} position={[0.01, 0.009, 0]}>
          <meshPhysicalMaterial color="#ecfeff" transparent opacity={0.35} roughness={0.04} clearcoat={1} />
        </RoundedBox>
      ) : null}
    </group>
  );
}
