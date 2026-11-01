"use client";

import dynamic from "next/dynamic";

function ParticleCanvas({ ph }: { ph: number }) {
  const hCount = Math.min(40, Math.round(Math.pow(10, -ph) * 1e12));
  const ohCount = Math.min(40, Math.round(Math.pow(10, -(14 - ph)) * 1e12));
  return (
    <canvas
      width={320}
      height={80}
      className="mt-2 w-full max-w-md rounded border bg-white"
      aria-label={`Sample at pH ${ph}: more ${ph < 7 ? "H+" : ph > 7 ? "OH-" : "equal"} ions`}
      ref={(el) => {
        if (!el) return;
        const ctx = el.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, 320, 80);
        ctx.fillStyle = "#0072b2";
        for (let i = 0; i < hCount; i++) ctx.fillRect(8 + (i % 20) * 15, 10 + Math.floor(i / 20) * 12, 6, 6);
        ctx.fillStyle = "#d55e00";
        for (let i = 0; i < ohCount; i++) ctx.fillRect(8 + (i % 20) * 15, 44 + Math.floor(i / 20) * 12, 6, 6);
        ctx.fillStyle = "#334155";
        ctx.font = "12px sans-serif";
        ctx.fillText("H+ (blue)", 8, 76);
        ctx.fillText("OH- (orange)", 120, 76);
      }}
    />
  );
}

const Beaker3D = dynamic(() => import("@/components/atoms/Beaker3D"), { ssr: false });

function Beaker3DPreview({ ph, colour }: { ph: number; colour: string }) {
  return (
    <div className="mt-3">
      <Beaker3D liquidColour={colour} label={`Beaker at pH ${ph.toFixed(1)}`} />
    </div>
  );
}

export { ParticleCanvas, Beaker3DPreview };
