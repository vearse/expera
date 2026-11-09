"use client";

import { useLayoutEffect, useMemo } from "react";
import { SoftShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLabQuality } from "./LabQualityContext";

function createLabProbeScene() {
  const scene = new THREE.Scene();
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(18, 10, 18),
    new THREE.MeshBasicMaterial({ color: "#d7e4de", side: THREE.BackSide }),
  );
  scene.add(box);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.MeshBasicMaterial({ color: "#f3f1e4" }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.8;
  scene.add(ceiling);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.MeshBasicMaterial({ color: "#c5d0c9" }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4.8;
  scene.add(floor);

  const window = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.2), new THREE.MeshBasicMaterial({ color: "#fff1cc" }));
  window.position.set(8.8, 1.2, -1);
  window.rotation.y = -Math.PI / 2;
  scene.add(window);

  const lampA = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.7), new THREE.MeshBasicMaterial({ color: "#f7fbe6" }));
  lampA.rotation.x = Math.PI / 2;
  lampA.position.set(-2.4, 4.6, -1);
  scene.add(lampA);
  const lampB = lampA.clone();
  lampB.position.set(2.4, 4.6, 1.2);
  scene.add(lampB);

  const bench = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 2.4), new THREE.MeshBasicMaterial({ color: "#1a4a44" }));
  bench.position.set(0, -2.4, 1);
  scene.add(bench);

  return scene;
}

export function LabLook() {
  const quality = useLabQuality();
  const { gl, scene } = useThree();

  useLayoutEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = quality === "high" ? 1.06 : quality === "medium" ? 1.0 : 0.96;
    gl.shadowMap.enabled = quality !== "low";
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    const pmrem = new THREE.PMREMGenerator(gl);
    const probe = createLabProbeScene();
    const env = pmrem.fromScene(probe, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = quality === "low" ? 0.2 : quality === "medium" ? 0.38 : 0.52;

    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
      probe.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose?.();
      });
    };
  }, [gl, quality, scene]);

  const shadow = quality !== "low";
  const mapSize = quality === "high" ? 2048 : 1024;
  const fill = quality === "low" ? 0.42 : 0.22;

  const lights = useMemo(
    () => ({
      hemi: quality === "low" ? 0.62 : 0.78,
      key: quality === "low" ? 1.05 : 1.48,
      spill: quality === "low" ? 0.35 : 0.85,
      fluoro: quality === "low" ? 1.4 : 2.6,
    }),
    [quality],
  );

  return (
    <>
      {quality === "high" ? <SoftShadows size={16} samples={10} focus={0.82} /> : null}
      <hemisphereLight args={["#f4efe4", "#8f9d97", lights.hemi]} />
      <ambientLight intensity={fill} color="#eef3ee" />
      <directionalLight
        position={[7.15, 3.55, -1.05]}
        intensity={lights.key}
        color="#fff3dc"
        castShadow={shadow}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-near={0.4}
        shadow-camera-far={18}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={7}
        shadow-camera-bottom={-5}
        shadow-bias={-0.00035}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4.8, 4.2, 3.4]} intensity={0.28} color="#dbe7e2" />
      <spotLight
        position={[6.55, 2.55, -1.1]}
        angle={0.72}
        penumbra={0.85}
        intensity={lights.spill}
        color="#ffd7a0"
        distance={14}
        castShadow={false}
      />
      <pointLight position={[-2.6, 3.92, -1.5]} intensity={lights.fluoro} distance={9} decay={2} color="#f4f7e4" />
      <pointLight position={[2.6, 3.92, 0.4]} intensity={lights.fluoro * 0.85} distance={9} decay={2} color="#f4f7e4" />
      <pointLight position={[0, 3.9, -2.6]} intensity={lights.fluoro * 0.55} distance={8} decay={2} color="#eef2d8" />
    </>
  );
}
