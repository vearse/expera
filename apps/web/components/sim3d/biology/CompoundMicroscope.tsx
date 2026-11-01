"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MicroscopeModelSpec, SpecimenSpec } from "@/lib/content/biology";
import type { SlideState } from "@/lib/engine/biology/microscopy";
import { MicroscopeStage } from "./MicroscopeStage";

type PartPosition = [number, number, number];

const PART_POSITIONS: Record<string, PartPosition> = {
  eyepiece: [0.04, 0.96, -0.02],
  "body-tube": [0.04, 0.78, -0.02],
  nosepiece: [0.04, 0.56, 0.015],
  "objective-4x": [-0.055, 0.49, 0.055],
  "objective-10x": [0.04, 0.49, 0.08],
  "objective-40x": [0.135, 0.49, 0.055],
  stage: [0.04, 0.43, 0.07],
  clips: [0.04, 0.45, 0.15],
  condenser: [0.04, 0.35, 0.02],
  diaphragm: [0.04, 0.315, 0.02],
  illuminator: [0.04, 0.11, 0.1],
  "coarse-knob": [-0.27, 0.27, -0.02],
  "fine-knob": [-0.27, 0.4, -0.02],
  arm: [-0.09, 0.55, -0.09],
  base: [0, 0.045, 0],
};

export function CompoundMicroscope({
  model,
  objectiveId,
  focusOffsetMicrometres,
  illuminationPower,
  illuminationIntensity,
  mirrorAligned,
  specimen,
  slide,
  selectedPart,
  onInspectPart,
  onStageClick,
  onClipClick,
}: {
  model: MicroscopeModelSpec;
  objectiveId: string;
  focusOffsetMicrometres: number;
  illuminationPower: boolean;
  illuminationIntensity: number;
  mirrorAligned: boolean;
  specimen: SpecimenSpec | null;
  slide: SlideState | null;
  selectedPart: string | null;
  onInspectPart: (id: string) => void;
  onStageClick: () => void;
  onClipClick: () => void;
}) {
  const nosepiece = useRef<THREE.Group | null>(null);
  const stageGroup = useRef<THREE.Group | null>(null);
  const coarseKnob = useRef<THREE.Mesh | null>(null);
  const fineKnob = useRef<THREE.Mesh | null>(null);
  const light = useRef<THREE.PointLight | null>(null);
  const selectedIndex = Math.max(0, model.objectives.findIndex((objective) => objective.id === objectiveId));
  const step = (Math.PI * 2) / model.objectives.length;
  const lightStrength = illuminationPower && (model.lightSource === "led" || mirrorAligned) ? 0.15 + (illuminationIntensity / 100) * 1.35 : 0;

  useFrame((_, delta) => {
    const t = 1 - Math.pow(0.001, Math.min(delta, 0.08));
    if (nosepiece.current) {
      const target = -selectedIndex * step;
      nosepiece.current.rotation.y = THREE.MathUtils.lerp(nosepiece.current.rotation.y, target, t);
    }
    if (stageGroup.current) {
      const target = THREE.MathUtils.clamp(focusOffsetMicrometres / 500, -1, 1) * -0.018;
      stageGroup.current.position.y = THREE.MathUtils.lerp(stageGroup.current.position.y, target, t);
    }
    if (coarseKnob.current) coarseKnob.current.rotation.x = focusOffsetMicrometres * 0.018;
    if (fineKnob.current) fineKnob.current.rotation.x = focusOffsetMicrometres * 0.06;
    if (light.current) light.current.intensity = THREE.MathUtils.lerp(light.current.intensity, lightStrength, t);
  });

  const marker: PartPosition | null = selectedPart ? PART_POSITIONS[selectedPart] ?? null : null;

  return (
    <group>
      <mesh position={[0, 0.035, -0.02]} onPointerDown={(e) => { e.stopPropagation(); onInspectPart("base"); }}>
        <sphereGeometry args={[0.017, 12, 8]} />
        <meshBasicMaterial color="#13202c" transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <RoundedBox args={[0.46, 0.07, 0.38]} radius={0.025} smoothness={4} position={[0, 0.035, -0.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#dbe3e8" roughness={0.45} metalness={0.18} />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.028, 0.31]} radius={0.018} smoothness={3} position={[0, 0.078, -0.01]} castShadow>
        <meshStandardMaterial color="#e7edf1" roughness={0.5} metalness={0.12} />
      </RoundedBox>

      <mesh position={[-0.11, 0.37, -0.105]} rotation={[0.04, 0, 0.1]} castShadow>
        <boxGeometry args={[0.11, 0.58, 0.12]} />
        <meshStandardMaterial color="#dfe7ec" roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[0.04, 0.79, -0.02]} castShadow>
        <cylinderGeometry args={[0.045, 0.052, 0.33, 28]} />
        <meshStandardMaterial color="#e8eef2" roughness={0.36} metalness={0.2} />
      </mesh>
      <mesh position={[0.04, 0.96, -0.02]} castShadow onPointerDown={(e) => { e.stopPropagation(); onInspectPart("eyepiece"); }}>
        <cylinderGeometry args={[0.051, 0.043, 0.105, 28]} />
        <meshStandardMaterial color="#17242d" roughness={0.34} metalness={0.45} />
      </mesh>
      <mesh position={[0.04, 1.018, -0.02]}>
        <cylinderGeometry args={[0.043, 0.043, 0.007, 28]} />
        <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.72} roughness={0.04} metalness={0.15} />
      </mesh>

      <group ref={nosepiece} position={[0.04, 0.56, 0.015]}>
        <mesh castShadow onPointerDown={(e) => { e.stopPropagation(); onInspectPart("nosepiece"); }}>
          <cylinderGeometry args={[0.125, 0.125, 0.042, 32]} />
          <meshStandardMaterial color="#17242d" roughness={0.35} metalness={0.5} />
        </mesh>
        {model.objectives.map((objective, index) => {
          const angle = index * step;
          const x = Math.sin(angle) * 0.078;
          const z = Math.cos(angle) * 0.078;
          const active = objective.id === objectiveId;
          return (
            <group
              key={objective.id}
              position={[x, -0.04, z]}
              onPointerDown={(event) => {
                event.stopPropagation();
                onInspectPart(`objective-${objective.id}`);
              }}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.033, 0.028, 0.13, 20]} />
                <meshStandardMaterial color={active ? "#0f766e" : "#cbd5e1"} roughness={0.28} metalness={0.72} emissive={active ? "#042f2e" : "#000000"} />
              </mesh>
              <mesh position={[0, -0.074, 0]}>
                <cylinderGeometry args={[0.026, 0.032, 0.018, 20]} />
                <meshStandardMaterial color={active ? "#99f6e4" : "#64748b"} roughness={0.24} metalness={0.65} />
              </mesh>
              <mesh position={[0, 0.012, 0]}>
                <torusGeometry args={[0.03, 0.004, 6, 20]} />
                <meshStandardMaterial color={active ? "#5eead4" : "#94a3b8"} metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          );
        })}
      </group>

      <group ref={stageGroup}>
        <MicroscopeStage
          specimen={specimen}
          hasSlide={Boolean(slide?.onStage)}
          secured={Boolean(slide?.secured)}
          coverslip={Boolean(slide?.completedStepIds.includes("coverslip"))}
          onStageClick={onStageClick}
          onClipClick={onClipClick}
        />
        <mesh position={[0.04, 0.33, 0.02]} onPointerDown={(e) => { e.stopPropagation(); onInspectPart("condenser"); }}>
          <cylinderGeometry args={[0.075, 0.09, 0.075, 24]} />
          <meshStandardMaterial color="#1f2937" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0.04, 0.292, 0.02]} rotation={[0, 0, 0]} onPointerDown={(e) => { e.stopPropagation(); onInspectPart("diaphragm"); }}>
          <cylinderGeometry args={[0.072, 0.072, 0.018, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.45} roughness={0.4} />
        </mesh>
      </group>

      {model.lightSource === "led" ? (
        <group position={[0.04, 0.105, 0.115]} onPointerDown={(e) => { e.stopPropagation(); onInspectPart("illuminator"); }}>
          <mesh>
            <cylinderGeometry args={[0.047, 0.055, 0.045, 20]} />
            <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.025, 0]}>
            <circleGeometry args={[0.04, 24]} />
            <meshBasicMaterial color={lightStrength > 0 ? "#fef9c3" : "#475569"} />
          </mesh>
          <pointLight ref={light} position={[0, 0.045, -0.08]} color="#fff7d6" intensity={lightStrength} distance={0.8} castShadow />
        </group>
      ) : (
        <group position={[0.04, 0.12, 0.13]} rotation={[0.5, 0, 0]} onPointerDown={(e) => { e.stopPropagation(); onInspectPart("illuminator"); }}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.018, 28]} />
            <meshStandardMaterial color={mirrorAligned && illuminationPower ? "#e0f2fe" : "#94a3b8"} metalness={0.9} roughness={0.08} />
          </mesh>
          <mesh position={[0, -0.014, 0]}>
            <cylinderGeometry args={[0.062, 0.062, 0.014, 28]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
          </mesh>
          <pointLight ref={light} position={[0, 0.08, -0.1]} color="#e0f2fe" intensity={lightStrength} distance={0.8} />
        </group>
      )}

      <mesh
        ref={coarseKnob}
        position={[-0.27, 0.27, -0.02]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        onPointerDown={(e) => { e.stopPropagation(); onInspectPart("coarse-knob"); }}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.045, 28]} />
        <meshStandardMaterial color="#22313d" roughness={0.38} metalness={0.45} />
      </mesh>
      <mesh
        ref={fineKnob}
        position={[-0.27, 0.395, -0.02]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        onPointerDown={(e) => { e.stopPropagation(); onInspectPart("fine-knob"); }}
      >
        <cylinderGeometry args={[0.041, 0.041, 0.035, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.4} />
      </mesh>

      <mesh position={[0.04, 0.94, -0.02]} onPointerDown={(e) => { e.stopPropagation(); onInspectPart("eyepiece"); }}>
        <sphereGeometry args={[0.012, 12, 8]} />
        <meshBasicMaterial color="#0f766e" transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <mesh position={[-0.09, 0.55, -0.09]} onPointerDown={(e) => { e.stopPropagation(); onInspectPart("arm"); }}>
        <sphereGeometry args={[0.025, 12, 8]} />
        <meshBasicMaterial color="#0f766e" transparent opacity={0.001} depthWrite={false} />
      </mesh>

      {marker ? (
        <group position={marker}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.055, 0.006, 8, 32]} />
            <meshBasicMaterial color="#5eead4" transparent opacity={0.9} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.075, 16, 12]} />
            <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.18} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}
