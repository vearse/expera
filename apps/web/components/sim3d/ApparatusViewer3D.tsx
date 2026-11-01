"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ApparatusModel } from "./apparatusModels";
import { detectWebGL } from "@/lib/device";

function FitModel({ id }: { id: string }) {
  const ref = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    group.scale.setScalar(1);
    group.position.set(0, 0, 0);
    group.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    const scale = 1.05 / Math.max(size.x, size.y, size.z, 0.001);
    group.scale.setScalar(scale);
    group.position.set(-centre.x * scale, -centre.y * scale, -centre.z * scale);
    group.updateWorldMatrix(true, true);
    camera.lookAt(0, 0, 0);
  }, [id, camera]);

  return (
    <group ref={ref}>
      <ApparatusModel id={id} active lit />
    </group>
  );
}

export default function ApparatusViewer3D({ id, className = "" }: { id: string; className?: string }) {
  const [webgl] = useState(() => detectWebGL());

  if (!webgl) {
    return <div className={`grid place-items-center rounded-xl border border-slate-700 bg-slate-950 p-4 text-center text-xs text-slate-400 ${className}`}>3D preview needs WebGL.</div>;
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950 ${className}`} aria-label="Interactive 3D view of the selected apparatus. Drag to rotate and scroll to zoom.">
      <Canvas camera={{ position: [1.15, 0.8, 1.55], fov: 38 }} dpr={[1, 1.5]} shadows gl={{ antialias: true }}>
        <color attach="background" args={["#0b1220"]} />
        <fog attach="fog" args={["#0b1220", 3.4, 6]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#dbeafe", "#0f172a", 0.9]} />
        <directionalLight position={[3, 4, 3]} intensity={1.8} castShadow />
        <spotLight position={[-2.6, 2.4, 2.2]} angle={0.65} penumbra={1} intensity={2.4} color="#e0f2fe" />
        <spotLight position={[2.4, 1.2, -2]} angle={0.8} penumbra={1} intensity={1.2} color="#38bdf8" />
        <FitModel key={id} id={id} />
        <ContactShadows position={[0, -0.62, 0]} opacity={0.42} scale={3.2} blur={2.6} far={2} color="#020617" />
        <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.85, 64]} />
          <meshStandardMaterial color="#111c2e" roughness={0.55} metalness={0.15} />
        </mesh>
        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={1.1}
          enablePan={false}
          minDistance={1.25}
          maxDistance={3.6}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
      <p className="pointer-events-none absolute bottom-2 left-3 text-[11px] font-medium tracking-wide text-slate-400">Drag to rotate · scroll to zoom</p>
    </div>
  );
}
