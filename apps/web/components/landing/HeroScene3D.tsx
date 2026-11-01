"use client";

import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

function MoleculeCluster() {
  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Sphere args={[0.55, 32, 32]} position={[-0.8, 0.2, 0]}>
          <MeshDistortMaterial color="#2a9d8f" distort={0.25} speed={1.5} roughness={0.2} metalness={0.1} />
        </Sphere>
        <Sphere args={[0.35, 32, 32]} position={[0.5, -0.3, 0.3]}>
          <MeshDistortMaterial color="#457b9d" distort={0.2} speed={2} roughness={0.25} />
        </Sphere>
        <Sphere args={[0.22, 24, 24]} position={[0.9, 0.45, -0.2]}>
          <meshStandardMaterial color="#e9c46a" roughness={0.35} />
        </Sphere>
      </Float>
    </group>
  );
}

export function HeroScene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <MoleculeCluster />
    </Canvas>
  );
}
