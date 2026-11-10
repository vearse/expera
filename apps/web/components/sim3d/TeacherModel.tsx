"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/device";

const TEACHER_MODEL = "/models/teacher_joe.glb";
const TARGET_HEIGHT = 1.85;
const SKIN_MATERIALS = new Set(["material_3", "material_5"]);
const SKIN_TINT = new THREE.Color().setRGB(0.9, 0.82, 0.76);

const HEAD_MATERIALS = new Set(["material_1", "material_2", "material_3", "material_4", "material_9", "material_10"]);
const LEG_MATERIALS = new Set(["material_6", "material_7"]);
/** Shirt (sleeves) and forearms/hands: the model ships in an A-pose, so these get bent at the shoulder. */
const ARM_DEFORM_MATERIALS = new Set(["material_5", "material_8"]);

/** Shoulder pivot and arm axis in the GLB's raw mesh space (≈1.85 units tall, +Z forward). */
const SHOULDER_X = 0.19;
const SHOULDER_Y = 1.43;
const ARM_AXIS_X = 0.517;
const ARM_AXIS_Y = -0.856;
/** Lowering beyond ~26° pushes the hands into the hips. */
const ARM_REST_DROP = THREE.MathUtils.degToRad(24);

type ActionKind = "headTurn" | "nod" | "weightShift" | "armSway";

type ArmDeform = {
  geometry: THREE.BufferGeometry;
  indices: Uint32Array;
  weights: Float32Array;
  sides: Int8Array;
  restPos: Float32Array;
  restNormal: Float32Array | null;
};

type IdleAction = {
  kind: ActionKind;
  start: number;
  duration: number;
  direction: number;
};

type TeacherRig = {
  root: THREE.Group;
  body: THREE.Group;
  upper: THREE.Group;
  head: THREE.Group;
  legs: THREE.Group;
  arms: ArmDeform[];
  upperBaseY: number;
  reducedMotion: boolean;
};

function materialName(mesh: THREE.Mesh): string {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return material?.name ?? "";
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** 0 on the torso, 1 along the arm; the boundary follows the armpit up to the top of the shoulder. */
function armWeight(x: number, y: number) {
  const ax = Math.abs(x);
  const split = y >= 1.31 ? 0.17 + (y - 1.31) * 0.29 : 0.16;
  const along = (ax - SHOULDER_X) * ARM_AXIS_X + (y - SHOULDER_Y) * ARM_AXIS_Y;
  return smoothstep(split - 0.005, split + 0.04, ax) * smoothstep(-0.03, 0.05, along);
}

function buildArmDeform(mesh: THREE.Mesh): ArmDeform | null {
  const geometry = mesh.geometry.clone();
  mesh.geometry = geometry;
  const position = geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
  if (!position) return null;
  const normal = geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;

  const indices: number[] = [];
  const weights: number[] = [];
  const sides: number[] = [];
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const weight = armWeight(x, position.getY(i));
    if (weight <= 0.001) continue;
    indices.push(i);
    weights.push(weight);
    sides.push(x >= 0 ? 1 : -1);
  }
  if (!indices.length) return null;

  position.setUsage(THREE.DynamicDrawUsage);
  normal?.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  return {
    geometry,
    indices: Uint32Array.from(indices),
    weights: Float32Array.from(weights),
    sides: Int8Array.from(sides),
    restPos: Float32Array.from(position.array as ArrayLike<number>),
    restNormal: normal ? Float32Array.from(normal.array as ArrayLike<number>) : null,
  };
}

/** Rotate arm vertices about each shoulder: `drop` lowers toward the body, `swing` moves forward/back. */
function poseArms(arms: ArmDeform[], drop: number, swingRight: number, swingLeft: number) {
  for (const arm of arms) {
    const position = arm.geometry.getAttribute("position") as THREE.BufferAttribute;
    const normal = arm.geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;
    const pos = position.array as Float32Array;
    const nrm = normal ? (normal.array as Float32Array) : null;
    const { restPos, restNormal } = arm;

    for (let k = 0; k < arm.indices.length; k += 1) {
      const i = arm.indices[k];
      const o = i * 3;
      const w = arm.weights[k];
      const side = arm.sides[k];
      const a = -side * drop * w;
      const s = (side > 0 ? swingRight : swingLeft) * w;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const cs = Math.cos(s);
      const ss = Math.sin(s);

      const px = side * SHOULDER_X;
      const dx = restPos[o] - px;
      const dy = restPos[o + 1] - SHOULDER_Y;
      const dz = restPos[o + 2];
      const rx = dx * ca - dy * sa;
      const ry = dx * sa + dy * ca;
      pos[o] = px + rx;
      pos[o + 1] = SHOULDER_Y + ry * cs - dz * ss;
      pos[o + 2] = ry * ss + dz * cs;

      if (nrm && restNormal) {
        const nx = restNormal[o];
        const ny = restNormal[o + 1];
        const nz = restNormal[o + 2];
        const qx = nx * ca - ny * sa;
        const qy = nx * sa + ny * ca;
        nrm[o] = qx;
        nrm[o + 1] = qy * cs - nz * ss;
        nrm[o + 2] = qy * ss + nz * cs;
      }
    }
    position.needsUpdate = true;
    if (normal) normal.needsUpdate = true;
  }
}

function buildRig(scene: THREE.Object3D, castShadow: boolean): TeacherRig {
  const source = scene.clone(true);
  source.updateMatrixWorld(true);

  const meshes: THREE.Mesh[] = [];
  source.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) meshes.push(mesh);
  });

  for (const mesh of meshes) {
    mesh.castShadow = castShadow;
    mesh.receiveShadow = false;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = materials.map((material) => {
      if (!material) return material;
      const next = material.clone();
      if (next instanceof THREE.MeshStandardMaterial && SKIN_MATERIALS.has(next.name)) {
        next.color.copy(SKIN_TINT);
      }
      return next;
    });
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
  }

  const hipY = 0.03;
  const hipZ = 0.243;
  const neckY = 0.168;
  const neckZ = 0.248;

  const body = new THREE.Group();
  const upper = new THREE.Group();
  const head = new THREE.Group();
  const legs = new THREE.Group();

  upper.position.set(0, hipY, hipZ);
  head.position.set(0, neckY - hipY, neckZ - hipZ);
  legs.position.set(0, hipY, hipZ);

  body.add(upper, legs);
  upper.add(head);

  const rigRoot = new THREE.Group();
  rigRoot.add(body);
  rigRoot.updateMatrixWorld(true);

  const arms: ArmDeform[] = [];
  for (const mesh of meshes) {
    const name = materialName(mesh);
    const target = HEAD_MATERIALS.has(name) ? head : LEG_MATERIALS.has(name) ? legs : upper;
    target.attach(mesh);
    if (ARM_DEFORM_MATERIALS.has(name)) {
      const deform = buildArmDeform(mesh);
      if (deform) arms.push(deform);
    }
  }
  poseArms(arms, ARM_REST_DROP, 0, 0);

  rigRoot.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(rigRoot);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;

  const root = new THREE.Group();
  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  root.add(rigRoot);
  root.updateMatrixWorld(true);

  return {
    root,
    body,
    upper,
    head,
    legs,
    arms,
    upperBaseY: upper.position.y,
    reducedMotion: prefersReducedMotion(),
  };
}

export function TeacherModel({ castShadow = true }: { castShadow?: boolean }) {
  const { scene } = useGLTF(TEACHER_MODEL);
  const rig = useMemo(() => buildRig(scene, castShadow), [castShadow, scene]);

  const rigRef = useRef(rig);
  rigRef.current = rig;

  const idle = useRef({
    time: 0,
    nextAction: 3,
    action: null as IdleAction | null,
  });

  useFrame((frame, delta) => {
    const current = rigRef.current;
    if (current.reducedMotion) return;
    const state = idle.current;
    state.time += Math.min(delta, 0.05);
    const time = state.time;

    // ~15 breaths a minute: chest rises and fills, shoulders follow.
    const breath = 0.5 - 0.5 * Math.cos(time * 1.55);
    const sway = Math.sin(time * 0.45) * 0.008;
    const armBreath = breath * THREE.MathUtils.degToRad(1.1);
    const armDrift = Math.sin(time * 0.62) * THREE.MathUtils.degToRad(2.2);

    if (!state.action && time >= state.nextAction) {
      const kinds: ActionKind[] = ["headTurn", "nod", "weightShift", "armSway"];
      state.action = {
        kind: kinds[Math.floor(Math.random() * kinds.length)],
        start: time,
        duration: 1.2 + Math.random() * 1.1,
        direction: Math.random() < 0.5 ? -1 : 1,
      };
    }
    if (state.action && time - state.action.start > state.action.duration) {
      state.action = null;
      state.nextAction = time + 3 + Math.random() * 4;
    }

    let headY = 0;
    let headX = breath * 0.012;
    let bodyZ = sway;
    let legZ = 0;
    let drop = ARM_REST_DROP - armBreath;
    let swingRight = armDrift;
    let swingLeft = -armDrift * 0.8;
    const upperY = current.upperBaseY + breath * 0.0022;

    if (state.action) {
      const progress = Math.min(1, (time - state.action.start) / state.action.duration);
      const eased = Math.sin(Math.PI * progress);
      const dir = state.action.direction;
      switch (state.action.kind) {
        case "headTurn":
          headY = 0.35 * eased * dir;
          break;
        case "nod":
          headX = 0.2 * eased;
          break;
        case "weightShift":
          bodyZ += 0.03 * eased * dir;
          legZ = -0.015 * eased * dir;
          drop -= THREE.MathUtils.degToRad(1.5) * eased;
          break;
        case "armSway":
          if (dir > 0) swingRight += THREE.MathUtils.degToRad(7) * eased;
          else swingLeft += THREE.MathUtils.degToRad(7) * eased;
          break;
      }
    }

    current.body.rotation.z = bodyZ;
    current.upper.position.y = upperY;
    current.upper.scale.set(1 + breath * 0.006, 1, 1 + breath * 0.014);
    current.head.rotation.y = headY;
    current.head.rotation.x = headX;
    current.legs.rotation.z = legZ;
    poseArms(current.arms, drop, swingRight, swingLeft);

    frame.invalidate();
  });

  return <primitive object={rig.root} />;
}

useGLTF.preload(TEACHER_MODEL);
