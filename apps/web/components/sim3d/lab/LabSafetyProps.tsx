"use client";

import { useLabQuality } from "./LabQualityContext";

function Extinguisher({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.72, 20]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.08, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.05, 0.012, 8, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
      </mesh>
    </group>
  );
}

function FirstAid({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.32, 0.08]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <boxGeometry args={[0.18, 0.06, 0.01]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <boxGeometry args={[0.06, 0.18, 0.01]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
    </group>
  );
}

function Eyewash({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.34, 0.18, 0.22]} />
        <meshStandardMaterial color="#16a34a" roughness={0.5} />
      </mesh>
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.12, 0.02]}>
          <cylinderGeometry args={[0.028, 0.022, 0.08, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function FireBlanket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.38, 0.5, 0.08]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.18, 0.045]}>
        <boxGeometry args={[0.28, 0.06, 0.01]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

function CoatHooks() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.7, 0.06, 0.04]} />
        <meshStandardMaterial color="#57534e" roughness={0.5} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <group key={x} position={[x, -0.02, 0.04]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 10]} />
            <meshStandardMaterial color="#a8a29e" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.02, -0.55, 0.08]} rotation={[0.15, 0, 0.1]} castShadow>
            <boxGeometry args={[0.28, 1.05, 0.08]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.72} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WasteBin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.14, 0.42, 20]} />
        <meshStandardMaterial color="#334155" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
    </group>
  );
}

function SoapDispenser({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.1, 0.18, 0.08]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.1, 0.01]}>
        <boxGeometry args={[0.05, 0.04, 0.04]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.35} />
      </mesh>
    </group>
  );
}

function CeilingFan({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.08, 0.12, 16]} />
        <meshStandardMaterial color="#57534e" roughness={0.5} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.55, -0.02, Math.sin(a) * 0.55]} rotation={[0, -a, 0]}>
          <boxGeometry args={[0.9, 0.02, 0.16]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

export function LabSafetyProps({ width }: { width: number }) {
  const quality = useLabQuality();
  return (
    <group>
      <Extinguisher position={[-width / 2 + 0.18, 0, 1.55]} />
      <FirstAid position={[width / 2 - 0.1, 2.55, -3.15]} rotation={[0, -Math.PI / 2, 0]} />
      <Eyewash position={[width / 2 - 0.22, 1.28, 0.55]} />
      <FireBlanket position={[-1.85, 2.55, -3.96]} />
      <group position={[-width / 2 + 0.08, 1.85, 1.15]} rotation={[0, Math.PI / 2, 0]}>
        <CoatHooks />
      </group>
      <WasteBin position={[4.55, 0, 1.15]} />
      <SoapDispenser position={[5.42, 1.55, 0.85]} />
      {quality !== "low" ? <CeilingFan position={[0, 4.52, -0.2]} /> : null}
    </group>
  );
}
