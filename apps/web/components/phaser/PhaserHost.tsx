"use client";

import { useEffect, useRef } from "react";
import type { StoreApi } from "zustand";

type PhaserGame = import("phaser").Game;

export function PhaserHost<T>({
  createScene,
  store,
  className,
}: {
  createScene: (Phaser: typeof import("phaser"), store: StoreApi<T>) => new (...args: unknown[]) => import("phaser").Scene;
  store: StoreApi<T>;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PhaserGame | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("phaser").then((Phaser) => {
      if (cancelled || !ref.current || gameRef.current) return;
      const SceneClass = createScene(Phaser, store);
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 640,
        height: 360,
        parent: ref.current,
        backgroundColor: "#f8fafc",
        scene: SceneClass,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      });
    });
    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [createScene, store]);

  return <div ref={ref} className={className ?? "h-[360px] w-full max-w-3xl rounded-xl border bg-white"} aria-label="2D lab bench" />;
}
