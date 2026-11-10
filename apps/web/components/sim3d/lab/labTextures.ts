"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { anisotropyFor, textureSizeFor, type LabQuality } from "@/lib/sim/labQuality";
import { useLabQuality } from "./LabQualityContext";

export type PbrMaps = {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
};

const cache = new Map<string, PbrMaps>();

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return (
    (1 - uy) * ((1 - ux) * hash(ix, iy) + ux * hash(ix + 1, iy)) +
    uy * ((1 - ux) * hash(ix, iy + 1) + ux * hash(ix + 1, iy + 1))
  );
}

function fbm(x: number, y: number, octaves = 4) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i += 1) {
    v += a * noise(x * f, y * f);
    a *= 0.5;
    f *= 2;
  }
  return v;
}

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  return { canvas, ctx };
}

function canvasTexture(canvas: HTMLCanvasElement, colorSpace: THREE.ColorSpace, anisotropy: number, repeat: number) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  texture.anisotropy = anisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function heightToNormal(height: Float32Array, size: number, strength: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(size, size);
  const at = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength;
      const len = Math.hypot(dx, dy, 1) || 1;
      const i = (y * size + x) * 4;
      img.data[i] = Math.round((dx / len) * 127.5 + 127.5);
      img.data[i + 1] = Math.round((dy / len) * 127.5 + 127.5);
      img.data[i + 2] = Math.round((1 / len) * 127.5 + 127.5);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function finish(
  key: string,
  albedo: HTMLCanvasElement,
  roughness: HTMLCanvasElement,
  height: Float32Array,
  size: number,
  anisotropy: number,
  repeat: number,
  normalStrength: number,
): PbrMaps {
  const maps: PbrMaps = {
    map: canvasTexture(albedo, THREE.SRGBColorSpace, anisotropy, repeat),
    roughnessMap: canvasTexture(roughness, THREE.NoColorSpace, anisotropy, repeat),
    normalMap: canvasTexture(heightToNormal(height, size, normalStrength), THREE.NoColorSpace, anisotropy, repeat),
  };
  cache.set(key, maps);
  return maps;
}

function buildFloor(size: number, anisotropy: number): PbrMaps {
  const { canvas, ctx } = makeCanvas(size);
  const rough = makeCanvas(size);
  if (!ctx || !rough.ctx) throw new Error("canvas");
  const tiles = 8;
  const tile = size / tiles;
  const grout = Math.max(2, Math.round(tile * 0.045));
  const height = new Float32Array(size * size);
  ctx.fillStyle = "#b7c4bc";
  ctx.fillRect(0, 0, size, size);
  rough.ctx.fillStyle = "#c8c8c8";
  rough.ctx.fillRect(0, 0, size, size);

  for (let ty = 0; ty < tiles; ty += 1) {
    for (let tx = 0; tx < tiles; tx += 1) {
      const shade = 0.9 + hash(tx + 3, ty + 9) * 0.12;
      const g = Math.round(214 * shade);
      const r = Math.round(208 * shade);
      const b = Math.round(204 * shade + 4);
      const x0 = tx * tile + grout;
      const y0 = ty * tile + grout;
      const w = tile - grout * 2;
      const h = tile - grout * 2;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x0, y0, w, h);
      const wear = hash(tx, ty);
      if (wear > 0.55) {
        ctx.fillStyle = `rgba(90, 110, 100, ${0.04 + wear * 0.06})`;
        ctx.beginPath();
        ctx.ellipse(x0 + w * wear, y0 + h * (1 - wear), w * 0.18, h * 0.08, wear, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const img = ctx.getImageData(0, 0, size, size);
  const rimg = rough.ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const n = fbm(x / 48, y / 48, 3);
      img.data[i] = Math.min(255, img.data[i] + (n - 0.5) * 10);
      img.data[i + 1] = Math.min(255, img.data[i + 1] + (n - 0.5) * 12);
      const gx = x % tile;
      const gy = y % tile;
      const inGrout = gx < grout || gy < grout;
      const scuff = n > 0.72 && hash(x, y) > 0.86 ? 18 : 0;
      img.data[i] = Math.max(0, img.data[i] - scuff);
      img.data[i + 1] = Math.max(0, img.data[i + 1] - scuff);
      rimg.data[i] = inGrout ? 210 : 88 + n * 40 + scuff;
      rimg.data[i + 1] = rimg.data[i];
      rimg.data[i + 2] = rimg.data[i];
      height[y * size + x] = inGrout ? 0.12 : 0.55 + n * 0.2;
    }
  }
  ctx.putImageData(img, 0, 0);
  rough.ctx.putImageData(rimg, 0, 0);
  return finish("floor", canvas, rough.canvas, height, size, anisotropy, 6, 2.4);
}

function buildPlaster(size: number, anisotropy: number, tint: [number, number, number]): PbrMaps {
  const { canvas, ctx } = makeCanvas(size);
  const rough = makeCanvas(size);
  if (!ctx || !rough.ctx) throw new Error("canvas");
  const height = new Float32Array(size * size);
  const img = ctx.createImageData(size, size);
  const rimg = rough.ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const n = fbm(x / 90, y / 90, 5);
      const stain = Math.max(0, fbm(x / 180 + 8, y / 140, 3) - 0.62) * 40;
      img.data[i] = Math.round(tint[0] + (n - 0.5) * 14 - stain);
      img.data[i + 1] = Math.round(tint[1] + (n - 0.5) * 16 - stain * 0.7);
      img.data[i + 2] = Math.round(tint[2] + (n - 0.5) * 12 - stain * 0.4);
      img.data[i + 3] = 255;
      rimg.data[i] = 200 + n * 30;
      rimg.data[i + 1] = rimg.data[i];
      rimg.data[i + 2] = rimg.data[i];
      rimg.data[i + 3] = 255;
      height[y * size + x] = n;
    }
  }
  ctx.putImageData(img, 0, 0);
  rough.ctx.putImageData(rimg, 0, 0);
  return finish(`plaster-${tint.join(",")}`, canvas, rough.canvas, height, size, anisotropy, 3, 1.6);
}

/** World size of one texture tile: two 450×225 mm sandcrete blocks wide, four courses high. */
export const BLOCK_TILE_METERS = 0.9;

function buildBlockWall(size: number, anisotropy: number): PbrMaps {
  const { canvas, ctx } = makeCanvas(size);
  const rough = makeCanvas(size);
  if (!ctx || !rough.ctx) throw new Error("canvas");
  const height = new Float32Array(size * size);
  const img = ctx.createImageData(size, size);
  const rimg = rough.ctx.createImageData(size, size);
  const courses = 4;
  const blocksPerRow = 2;
  const courseH = size / courses;
  const blockW = size / blocksPerRow;
  const joint = Math.max(1, Math.round(size * 0.006));

  for (let y = 0; y < size; y += 1) {
    const course = Math.floor(y / courseH);
    const offset = course % 2 === 0 ? 0 : blockW / 2;
    const inCourseY = y - course * courseH;
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const bx = (x + offset) % size;
      const block = Math.floor(bx / blockW);
      const inBlockX = bx - block * blockW;
      const edge = Math.min(inCourseY, courseH - inCourseY, inBlockX, blockW - inBlockX);
      const inJoint = edge < joint;
      const jointSoft = smoothEdge(edge, joint, joint * 2.4);

      const pores = fbm(x / 6, y / 6, 2);
      const roller = fbm(x / 140, y / 22, 3);
      const blotch = fbm(x / 260 + course * 1.7, y / 260 + block * 2.3, 3);
      const faceTone = (hash(block + course * 7, course + 3) - 0.5) * 6;
      const stain = Math.max(0, fbm(x / 210 + 13, y / 170 + 4, 3) - 0.64) * 46;

      let shade = 1 - (1 - jointSoft) * 0.055 + (roller - 0.5) * 0.05 + (blotch - 0.5) * 0.06;
      if (pores > 0.8) shade -= 0.035;
      img.data[i] = Math.round(236 * shade + faceTone - stain);
      img.data[i + 1] = Math.round(240 * shade + faceTone - stain * 0.75);
      img.data[i + 2] = Math.round(229 * shade + faceTone - stain * 0.55);
      img.data[i + 3] = 255;

      const r = inJoint ? 228 : 210 + pores * 20 + roller * 14;
      rimg.data[i] = r;
      rimg.data[i + 1] = r;
      rimg.data[i + 2] = r;
      rimg.data[i + 3] = 255;

      const bulge = jointSoft * (0.62 + (blotch - 0.5) * 0.08);
      height[y * size + x] = bulge + pores * 0.035 + roller * 0.03;
    }
  }
  ctx.putImageData(img, 0, 0);
  rough.ctx.putImageData(rimg, 0, 0);
  const maps = finish("blockwall", canvas, rough.canvas, height, size, anisotropy, 1, 2.2);
  for (const t of [maps.map, maps.roughnessMap, maps.normalMap]) t.repeat.set(1 / BLOCK_TILE_METERS, 1 / BLOCK_TILE_METERS);
  return maps;
}

function smoothEdge(x: number, e0: number, e1: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function buildWood(size: number, anisotropy: number): PbrMaps {
  const { canvas, ctx } = makeCanvas(size);
  const rough = makeCanvas(size);
  if (!ctx || !rough.ctx) throw new Error("canvas");
  const height = new Float32Array(size * size);
  const img = ctx.createImageData(size, size);
  const rimg = rough.ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const grain = Math.sin((x / size) * Math.PI * 18 + noise(x / 40, y / 18) * 4) * 0.5 + 0.5;
      const n = fbm(x / 70, y / 14, 4);
      const ring = 0.55 + grain * 0.28 + n * 0.12;
      img.data[i] = Math.round(92 + ring * 70);
      img.data[i + 1] = Math.round(58 + ring * 42);
      img.data[i + 2] = Math.round(34 + ring * 22);
      img.data[i + 3] = 255;
      const edgeWear = x < 8 || x > size - 8 || y < 8 || y > size - 8 ? 30 : 0;
      rimg.data[i] = 140 + n * 50 - edgeWear;
      rimg.data[i + 1] = rimg.data[i];
      rimg.data[i + 2] = rimg.data[i];
      rimg.data[i + 3] = 255;
      height[y * size + x] = grain * 0.4 + n * 0.3;
    }
  }
  ctx.putImageData(img, 0, 0);
  rough.ctx.putImageData(rimg, 0, 0);
  return finish("wood", canvas, rough.canvas, height, size, anisotropy, 2, 2.8);
}

function buildEpoxy(size: number, anisotropy: number): PbrMaps {
  const { canvas, ctx } = makeCanvas(size);
  const rough = makeCanvas(size);
  if (!ctx || !rough.ctx) throw new Error("canvas");
  const height = new Float32Array(size * size);
  ctx.fillStyle = "#143c38";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 7; i += 1) {
    const cx = hash(i, 2) * size;
    const cy = hash(i, 7) * size;
    const rad = 18 + hash(i, 11) * 42;
    ctx.strokeStyle = `rgba(90, 140, 120, ${0.08 + hash(i, 4) * 0.1})`;
    ctx.lineWidth = 2 + hash(i, 5) * 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rad, rad * 0.86, hash(i, 9) * Math.PI, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(190, 220, 200, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 28; i += 1) {
    ctx.beginPath();
    ctx.moveTo(hash(i, 1) * size, hash(i, 3) * size);
    ctx.lineTo(hash(i, 4) * size, hash(i, 8) * size);
    ctx.stroke();
  }
  const img = ctx.getImageData(0, 0, size, size);
  const rimg = rough.ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const n = fbm(x / 80, y / 80, 3);
      img.data[i] = Math.min(255, img.data[i] + (n - 0.5) * 8);
      img.data[i + 1] = Math.min(255, img.data[i + 1] + (n - 0.5) * 10);
      const scratch = n > 0.78 ? 40 : 0;
      rimg.data[i] = 70 + n * 50 + scratch;
      rimg.data[i + 1] = rimg.data[i];
      rimg.data[i + 2] = rimg.data[i];
      rimg.data[i + 3] = 255;
      height[y * size + x] = 0.5 + n * 0.12;
    }
  }
  ctx.putImageData(img, 0, 0);
  rough.ctx.putImageData(rimg, 0, 0);
  return finish("epoxy", canvas, rough.canvas, height, size, anisotropy, 2, 1.1);
}

function buildLaminate(size: number, anisotropy: number): PbrMaps {
  const { canvas, ctx } = makeCanvas(size);
  const rough = makeCanvas(size);
  if (!ctx || !rough.ctx) throw new Error("canvas");
  const height = new Float32Array(size * size);
  ctx.fillStyle = "#e8edf1";
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  const rimg = rough.ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const n = fbm(x / 60, y / 60, 3);
      img.data[i] = Math.round(226 + (n - 0.5) * 8);
      img.data[i + 1] = Math.round(232 + (n - 0.5) * 8);
      img.data[i + 2] = Math.round(236 + (n - 0.5) * 6);
      img.data[i + 3] = 255;
      rimg.data[i] = 170 + n * 40;
      rimg.data[i + 1] = rimg.data[i];
      rimg.data[i + 2] = rimg.data[i];
      rimg.data[i + 3] = 255;
      height[y * size + x] = n * 0.15;
    }
  }
  ctx.putImageData(img, 0, 0);
  rough.ctx.putImageData(rimg, 0, 0);
  return finish("laminate", canvas, rough.canvas, height, size, anisotropy, 1, 0.8);
}

function buildPaper(size: number, anisotropy: number): PbrMaps {
  const { canvas, ctx } = makeCanvas(size);
  const rough = makeCanvas(size);
  if (!ctx || !rough.ctx) throw new Error("canvas");
  const height = new Float32Array(size * size);
  ctx.fillStyle = "#f4efe4";
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  const rimg = rough.ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const n = fbm(x / 40, y / 40, 4);
      img.data[i] = Math.round(244 + (n - 0.5) * 10);
      img.data[i + 1] = Math.round(239 + (n - 0.5) * 8);
      img.data[i + 2] = Math.round(228 + (n - 0.5) * 6);
      img.data[i + 3] = 255;
      rimg.data[i] = 210 + n * 30;
      rimg.data[i + 1] = rimg.data[i];
      rimg.data[i + 2] = rimg.data[i];
      rimg.data[i + 3] = 255;
      height[y * size + x] = n;
    }
  }
  ctx.putImageData(img, 0, 0);
  rough.ctx.putImageData(rimg, 0, 0);
  return finish("paper", canvas, rough.canvas, height, size, anisotropy, 1, 0.9);
}

export function getLabTextures(quality: LabQuality, maxAniso: number) {
  const size = textureSizeFor(quality);
  const aniso = anisotropyFor(quality, maxAniso);
  const key = `${quality}-${size}-${aniso}`;
  const hit = cache.get(`pack-${key}`);
  if (hit) {
    return {
      floor: cache.get("floor")!,
      plaster: cache.get("plaster-232,242,237")!,
      blockWall: cache.get("blockwall")!,
      wood: cache.get("wood")!,
      epoxy: cache.get("epoxy")!,
      laminate: cache.get("laminate")!,
      paper: cache.get("paper")!,
    };
  }

  const floor = cache.get("floor") ?? buildFloor(size, aniso);
  const plaster = cache.get("plaster-232,242,237") ?? buildPlaster(size, aniso, [232, 242, 237]);
  const blockWall = cache.get("blockwall") ?? buildBlockWall(size, aniso);
  const wood = cache.get("wood") ?? buildWood(size, aniso);
  const epoxy = cache.get("epoxy") ?? buildEpoxy(size, aniso);
  const laminate = cache.get("laminate") ?? buildLaminate(size, aniso);
  const paper = cache.get("paper") ?? buildPaper(Math.min(size, 512), aniso);
  cache.set(`pack-${key}`, floor);
  return { floor, plaster, blockWall, wood, epoxy, laminate, paper };
}

export function pbrProps(
  maps: PbrMaps,
  extra?: { roughness?: number; metalness?: number; envMapIntensity?: number; normalScale?: number },
) {
  const ns = extra?.normalScale ?? 0.55;
  return {
    map: maps.map,
    roughnessMap: maps.roughnessMap,
    normalMap: maps.normalMap,
    normalScale: new THREE.Vector2(ns, ns),
    roughness: extra?.roughness ?? 1,
    metalness: extra?.metalness ?? 0,
    envMapIntensity: extra?.envMapIntensity ?? 0.45,
  };
}

export function useLabPbr() {
  const quality = useLabQuality();
  const gl = useThree((s) => s.gl);
  return useMemo(() => getLabTextures(quality, gl.capabilities.getMaxAnisotropy()), [gl, quality]);
}
